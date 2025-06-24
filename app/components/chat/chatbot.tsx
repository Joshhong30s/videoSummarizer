'use client';

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Mic, StopCircle, Copy } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  initialSessionId?: string;
  contextMetadata?: Record<string, any>;
}

export function Chatbot({
  isOpen,
  onClose,
  initialSessionId,
  contextMetadata,
}: ChatbotProps) {
  const [sessionId, setSessionId] = useState<string | undefined>(
    initialSessionId
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [recognitionLang, setRecognitionLang] = useState<'zh-TW' | 'en-US'>(
    'zh-TW'
  );
  const [isWide, setIsWide] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const speechRecognitionRef = useRef<any | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleToggleRecognitionLang = () => {
    setRecognitionLang(prevLang => (prevLang === 'zh-TW' ? 'en-US' : 'zh-TW'));
  };

  const handleToggleListening = () => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setError('voice recognition is not supported in this browser.');
      return;
    }
    if (isListening && speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
    } else {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = recognitionLang;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(prevInput => prevInput + transcript);
      };

      recognition.onerror = (event: any) => {
        let errorMessage = 'error occurred during speech recognition.';
        if (event.error === 'no-speech')
          errorMessage = 'no speech was detected.';
        else if (event.error === 'audio-capture')
          errorMessage = 'cannot capture audio.';
        else if (event.error === 'not-allowed')
          errorMessage = 'permission to use microphone was denied.';
        setError(errorMessage);
        setIsListening(false);
      };

      recognition.onend = () => setIsListening(false);

      speechRecognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (err) {
        setError('failed to start speech recognition.');
        setIsListening(false);
      }
    }
  };

  useEffect(() => {
    if (!sessionId) return;
    async function fetchHistory() {
      const res = await fetch(`/api/chat/messages?sessionId=${sessionId}`);
      const data = await res.json();
      // 加入 createdAt 時間（前端 fallback 用 Date.now，或後端提供）
      setMessages(
        data.map((msg: any) => ({
          ...msg,
          createdAt: msg.created_at || new Date().toISOString(),
        }))
      );
    }
    fetchHistory();
  }, [sessionId]);

  useEffect(() => {
    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.abort();
        speechRecognitionRef.current = null;
        setIsListening(false);
      }
    };
  }, []);

  const handleToggleWidth = () => setIsWide(w => !w);

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 1200);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const timestamp = new Date().toISOString();
    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userInput.trim(),
      createdAt: timestamp,
    };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setUserInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: newUserMessage.content,
          sessionId: sessionId,
          sessionMetadata: contextMetadata,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details ||
            errorData.error ||
            'Failed to get response from server'
        );
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        createdAt: new Date().toISOString(),
      };
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      setSessionId(data.sessionId);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, an error occurred: ${err.message || 'Unknown error'}`,
        createdAt: new Date().toISOString(),
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 時間格式化（只顯示時間 HH:MM 或日期+時間）
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const messagesContainerStyle: React.CSSProperties = {
    flexGrow: 1,
    padding: '10px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  };

  const messageStyle = (role: 'user' | 'assistant'): React.CSSProperties => ({
    padding: '8px 12px',
    borderRadius: '18px',
    maxWidth: '70%',
    wordBreak: 'break-word',
    whiteSpace: 'pre-line',
    alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
    backgroundColor: role === 'user' ? '#007bff' : '#e9ecef',
    color: role === 'user' ? 'white' : 'black',
    marginBottom: 6,
  });

  const formStyle: React.CSSProperties = {
    display: 'flex',
    padding: '10px',
    borderTop: '1px solid #ccc',
  };

  const inputStyle: React.CSSProperties = {
    flexGrow: 1,
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '20px',
    marginRight: '10px',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 15px',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    borderRadius: '20px',
    cursor: 'pointer',
  };

  if (!isOpen) return null;

  return (
    <div
      className={`
        chatbot-container fixed z-50 bg-white dark:bg-gray-800 flex flex-col overflow-hidden
        bottom-0 left-0 right-0 w-full h-[85vh] rounded-t-xl shadow-2xl border-t border-gray-300 dark:border-gray-700
        md:bottom-5 md:right-5 md:left-auto md:top-auto 
        ${isWide ? 'md:w-[800px]' : 'md:w-[400px]'}
        md:h-[500px] md:rounded-lg md:shadow-xl md:border 
        ${isOpen ? 'flex' : 'hidden'} 
      `}
    >
      <div
        style={{
          padding: '10px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Chat</h3>
        <div>
          <button
            onClick={handleToggleWidth}
            title={isWide ? 'original width' : '2x width'}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              marginRight: '10px',
              lineHeight: 1,
            }}
          >
            ⇔
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '0 5px',
            }}
            aria-label="Close chat"
          >
            &times;
          </button>
        </div>
      </div>

      <div style={messagesContainerStyle} className="chatbot-messages">
        {messages.map((msg, i) => (
          <div
            key={msg.id}
            style={{ ...messageStyle(msg.role), position: 'relative' }}
            className={`message message-${msg.role}`}
          >
            {msg.role === 'assistant' ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.content}
              </ReactMarkdown>
            ) : (
              msg.content
            )}
          </div>
        ))}

        {isLoading && (
          <div
            style={{
              ...messageStyle('assistant'),
              opacity: 0.7,
              fontStyle: 'italic',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              minHeight: '36px',
              background: '#e9ecef',
              color: '#333',
              marginTop: 4,
            }}
            className="message message-assistant animate-pulse"
          >
            <LoadingDots />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {error && (
        <div style={{ padding: '10px', color: 'red', textAlign: 'center' }}>
          Error: {error}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        style={formStyle}
        className="chatbot-form items-center"
      >
        <button
          type="button"
          onClick={handleToggleRecognitionLang}
          disabled={isLoading || isListening}
          title={`Switch to ${recognitionLang === 'zh-TW' ? 'English' : 'Chinese (Traditional)'} input`}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mr-2"
          style={{ flexShrink: 0 }}
        >
          {recognitionLang === 'zh-TW' ? 'EN' : '中'}
        </button>
        <button
          type="button"
          onClick={handleToggleListening}
          disabled={isLoading && !isListening}
          title={isListening ? 'Stop voice input' : 'Start voice input'}
          className={`p-2 rounded-full transition-colors mr-2 ${
            isListening
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          style={{ flexShrink: 0 }}
        >
          {isListening ? <StopCircle size={20} /> : <Mic size={20} />}
        </button>
        <input
          type="text"
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
          placeholder={isListening ? 'Listening...' : 'Type your message...'}
          style={inputStyle}
          disabled={isLoading}
          className="chatbot-input"
        />
        <button
          type="submit"
          disabled={isLoading || !userInput.trim()}
          style={buttonStyle}
          className="chatbot-submit"
        >
          {isLoading && !isListening ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

function LoadingDots() {
  return (
    <span style={{ display: 'inline-block', minWidth: 40 }}>
      <span
        className="dot"
        style={{ animation: 'dot-blink 1.2s infinite', animationDelay: '0s' }}
      >
        .
      </span>
      <span
        className="dot"
        style={{ animation: 'dot-blink 1.2s infinite', animationDelay: '0.2s' }}
      >
        .
      </span>
      <span
        className="dot"
        style={{ animation: 'dot-blink 1.2s infinite', animationDelay: '0.4s' }}
      >
        .
      </span>
      <style>
        {`
        @keyframes dot-blink {
          0%, 80%, 100% { opacity: 0.2; }
          40% { opacity: 1; }
        }
        `}
      </style>
    </span>
  );
}
