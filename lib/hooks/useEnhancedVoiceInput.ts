'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

interface VoiceInputConfig {
  pauseThreshold?: number;  // 停頓多久後自動送出（毫秒）
  timeoutDuration?: number; // 超時時間（毫秒）
  defaultLanguage?: 'zh-TW' | 'en-US';
  autoDetectLanguage?: boolean;
  showInterimResults?: boolean;
}

interface EnhancedVoiceInputHook {
  isListening: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  toggleLanguage: () => void;
  clearTranscript: () => void;
  currentLang: 'zh-TW' | 'en-US';
  finalTranscript: string;
  interimTranscript: string;
  audioLevel: number; // 0-100 音量級別
  isSpeaking: boolean; // 是否正在說話
}

const DEFAULT_CONFIG: Required<VoiceInputConfig> = {
  pauseThreshold: 1500,    // 1.5秒停頓後送出
  timeoutDuration: 30000,  // 30秒超時（增加）
  defaultLanguage: 'zh-TW',
  autoDetectLanguage: false,
  showInterimResults: true,
};

export const useEnhancedVoiceInput = (
  onResult: (text: string, isFinal: boolean) => void,
  onError?: (error: string) => void,
  config?: VoiceInputConfig
): EnhancedVoiceInputHook => {
  const settings = { ...DEFAULT_CONFIG, ...config };
  
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLang, setCurrentLang] = useState<'zh-TW' | 'en-US'>(settings.defaultLanguage);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const accumulatedTranscriptRef = useRef('');

  // 初始化音頻分析器
  const initAudioAnalyser = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      // 開始分析音量
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const checkAudioLevel = () => {
        if (!analyserRef.current || !isListening) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        const normalizedLevel = Math.min(100, (average / 128) * 100);
        
        setAudioLevel(normalizedLevel);
        setIsSpeaking(normalizedLevel > 10); // 閾值可調整
        
        animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
      };
      
      checkAudioLevel();
    } catch (err) {
      console.warn('無法初始化音頻分析器:', err);
    }
  }, [isListening]);

  // 清理音頻資源
  const cleanupAudio = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setAudioLevel(0);
    setIsSpeaking(false);
  }, []);

  // 獲取 Speech Recognition API
  const getSpeechRecognition = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      throw new Error(
        '您的瀏覽器不支援語音輸入功能。建議使用 Chrome 或 Edge 瀏覽器。'
      );
    }

    return SpeechRecognition;
  }, []);

  // 自動語言檢測
  const detectLanguage = useCallback((text: string) => {
    if (!settings.autoDetectLanguage) return;
    
    const hasChineseChars = /[\u4e00-\u9fa5]/.test(text);
    const shouldBeZhTW = hasChineseChars;
    const isCurrentlyZhTW = currentLang === 'zh-TW';
    
    if (shouldBeZhTW !== isCurrentlyZhTW) {
      setCurrentLang(shouldBeZhTW ? 'zh-TW' : 'en-US');
      // 重啟識別以應用新語言
      if (recognitionRef.current) {
        recognitionRef.current.lang = shouldBeZhTW ? 'zh-TW' : 'en-US';
      }
    }
  }, [currentLang, settings.autoDetectLanguage]);

  // 設置超時
  const setRecognitionTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
        setError('語音輸入超時，請重新嘗試。');
        setIsListening(false);
      }
    }, settings.timeoutDuration);
  }, [isListening, settings.timeoutDuration]);

  // 清除超時
  const clearRecognitionTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // 設置停頓計時器
  const setPauseTimer = useCallback(() => {
    // 清除現有計時器
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
    }

    // 設置新的停頓計時器
    pauseTimerRef.current = setTimeout(() => {
      const accumulated = accumulatedTranscriptRef.current.trim();
      if (accumulated) {
        onResult(accumulated, true);
        accumulatedTranscriptRef.current = '';
        setFinalTranscript('');
        setInterimTranscript('');
      }
    }, settings.pauseThreshold);
  }, [onResult, settings.pauseThreshold]);

  // 清除停頓計時器
  const clearPauseTimer = useCallback(() => {
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
  }, []);

  // 開始聆聽
  const startListening = useCallback(async () => {
    try {
      const SpeechRecognition = getSpeechRecognition();

      // 請求麥克風權限
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // 停止現有的識別
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      const recognition = new SpeechRecognition();

      recognition.lang = currentLang;
      recognition.continuous = true;
      recognition.interimResults = settings.showInterimResults;
      recognition.maxAlternatives = 1;

      // 重置累積文字
      accumulatedTranscriptRef.current = '';
      setFinalTranscript('');
      setInterimTranscript('');

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        setRecognitionTimeout();
        initAudioAnalyser();
      };

      recognition.onresult = (event: any) => {
        clearRecognitionTimeout(); // 重置超時
        clearPauseTimer(); // 清除停頓計時器

        let currentInterim = '';
        let newFinal = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            newFinal += transcript;
            // 自動語言檢測
            detectLanguage(transcript);
          } else {
            currentInterim += transcript;
          }
        }

        // 更新顯示
        if (newFinal) {
          // 智慧累積，避免多餘空格
          const existingText = accumulatedTranscriptRef.current.trim();
          if (existingText) {
            // 檢查是否需要空格（中文不需要）
            const needsSpace = !/[\u4e00-\u9fa5]$/.test(existingText) && 
                             !/^[\u4e00-\u9fa5]/.test(newFinal);
            accumulatedTranscriptRef.current = existingText + (needsSpace ? ' ' : '') + newFinal;
          } else {
            accumulatedTranscriptRef.current = newFinal;
          }
          
          setFinalTranscript(accumulatedTranscriptRef.current);
          
          // 即時回調（非最終）
          if (settings.showInterimResults) {
            onResult(accumulatedTranscriptRef.current, false);
          }
          
          // 設置停頓計時器
          setPauseTimer();
        }

        // 更新即時顯示
        setInterimTranscript(currentInterim);
        
        // 重新設置超時
        setRecognitionTimeout();
      };

      recognition.onerror = (event: any) => {
        let errorMessage = '語音識別發生錯誤，請重新嘗試。';

        switch (event.error) {
          case 'no-speech':
            errorMessage = '沒有檢測到語音，請重新嘗試。';
            break;
          case 'audio-capture':
            errorMessage = '無法獲取音頻輸入，請檢查麥克風設定。';
            break;
          case 'not-allowed':
            errorMessage = '麥克風權限被拒絕，請在瀏覽器設定中允許使用麥克風。';
            break;
          case 'network':
            errorMessage = '網路錯誤，請檢查網路連接後重試。';
            break;
          case 'service-not-allowed':
            errorMessage = '語音識別服務不可用，請稍後重試。';
            break;
          case 'aborted':
            // 用戶主動停止，不顯示錯誤
            return;
        }

        setError(errorMessage);
        setIsListening(false);
        clearRecognitionTimeout();
        clearPauseTimer();
        cleanupAudio();

        if (onError) {
          onError(errorMessage);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        clearRecognitionTimeout();
        clearPauseTimer();
        cleanupAudio();

        // 確保送出最後的文字
        const finalText = accumulatedTranscriptRef.current.trim();
        if (finalText) {
          onResult(finalText, true);
          accumulatedTranscriptRef.current = '';
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      const errorMessage = err.message || '啟動語音識別失敗，請重新嘗試。';
      setError(errorMessage);
      setIsListening(false);
      cleanupAudio();

      if (onError) {
        onError(errorMessage);
      }
    }
  }, [
    currentLang,
    getSpeechRecognition,
    setRecognitionTimeout,
    clearRecognitionTimeout,
    setPauseTimer,
    clearPauseTimer,
    detectLanguage,
    initAudioAnalyser,
    cleanupAudio,
    onResult,
    onError,
    settings.showInterimResults,
  ]);

  // 停止聆聽
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    clearRecognitionTimeout();
    clearPauseTimer();
    cleanupAudio();
  }, [isListening, clearRecognitionTimeout, clearPauseTimer, cleanupAudio]);

  // 切換語言
  const toggleLanguage = useCallback(() => {
    const newLang = currentLang === 'zh-TW' ? 'en-US' : 'zh-TW';
    setCurrentLang(newLang);

    // 如果正在聽，重新啟動以使用新語言
    if (isListening) {
      stopListening();
      setTimeout(() => startListening(), 100);
    }
  }, [currentLang, isListening, stopListening, startListening]);

  // 清除記錄
  const clearTranscript = useCallback(() => {
    accumulatedTranscriptRef.current = '';
    setFinalTranscript('');
    setInterimTranscript('');
  }, []);

  // 組件卸載時清理
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      clearRecognitionTimeout();
      clearPauseTimer();
      cleanupAudio();
    };
  }, [clearRecognitionTimeout, clearPauseTimer, cleanupAudio]);

  return {
    isListening,
    error,
    startListening,
    stopListening,
    toggleLanguage,
    clearTranscript,
    currentLang,
    finalTranscript,
    interimTranscript,
    audioLevel,
    isSpeaking,
  };
};