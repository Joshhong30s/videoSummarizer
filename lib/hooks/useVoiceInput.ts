'use client';

import { useRef, useState, useCallback } from 'react';

interface VoiceInputHook {
  isListening: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  toggleLanguage: () => void;
  currentLang: 'zh-TW' | 'en-US';
}

export const useVoiceInput = (
  onResult: (text: string) => void,
  onError?: (error: string) => void
): VoiceInputHook => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLang, setCurrentLang] = useState<'zh-TW' | 'en-US'>('zh-TW');

  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const requestMicrophonePermission = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (err) {
      throw new Error('無法獲取麥克風權限。請檢查瀏覽器設定並允許使用麥克風。');
    }
  }, []);

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
    }, 15000);
  }, [isListening]);

  const clearRecognitionTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startListening = useCallback(async () => {
    try {
      const SpeechRecognition = getSpeechRecognition();

      await requestMicrophonePermission();

      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      const recognition = new SpeechRecognition();

      recognition.lang = currentLang;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      let finalTranscript = '';
      let interimTranscript = '';

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        setRecognitionTimeout();
      };

      recognition.onresult = (event: any) => {
        interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        // 如果有最終結果，回傳給上層
        if (finalTranscript.trim()) {
          onResult(finalTranscript.trim());
          finalTranscript = '';
        }
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

        if (onError) {
          onError(errorMessage);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        clearRecognitionTimeout();

        // 如果有累積的最終結果，確保回傳
        if (finalTranscript.trim()) {
          onResult(finalTranscript.trim());
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      const errorMessage = err.message || '啟動語音識別失敗，請重新嘗試。';
      setError(errorMessage);
      setIsListening(false);

      if (onError) {
        onError(errorMessage);
      }
    }
  }, [
    currentLang,
    getSpeechRecognition,
    requestMicrophonePermission,
    setRecognitionTimeout,
    clearRecognitionTimeout,
    onResult,
    onError,
  ]);

  // 停止語音識別
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    clearRecognitionTimeout();
  }, [isListening, clearRecognitionTimeout]);

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

  return {
    isListening,
    error,
    startListening,
    stopListening,
    toggleLanguage,
    currentLang,
  };
};
