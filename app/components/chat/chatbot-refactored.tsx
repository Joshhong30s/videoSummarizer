'use client';

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Mic, StopCircle, Copy, X, Maximize2, Minimize2, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';

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

function LoadingDots() {
  return (
    <div className="flex items-center gap-1">
      <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
      <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
      <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
    </div>
  );
}

export function ChatbotRefactored({
  isOpen,
  onClose,
  initialSessionId,
  contextMetadata,
}: ChatbotProps) {
  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [recognitionLang, setRecognitionLang] = useState<'zh-TW' | 'en-US'>('zh-TW');
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const speechRecognitionRef = useRef<any | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      setError('Voice recognition is not supported in this browser.');
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
        let errorMessage = 'Error occurred during speech recognition.';
        if (event.error === 'no-speech')
          errorMessage = 'No speech was detected.';
        else if (event.error === 'audio-capture')
          errorMessage = 'Cannot capture audio.';
        else if (event.error === 'not-allowed')
          errorMessage = 'Permission to use microphone was denied.';
        setError(errorMessage);
        setIsListening(false);
      };

      recognition.onend = () => setIsListening(false);

      speechRecognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (err) {
        setError('Failed to start speech recognition.');
        setIsListening(false);
      }
    }
  };

  useEffect(() => {
    if (!sessionId) return;
    async function fetchHistory() {
      const res = await fetch(`/api/chat/messages?sessionId=${sessionId}`);
      const data = await res.json();
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

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
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
      inputRef.current?.focus();
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    
    if (isToday) {
      return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          />
          
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'fixed z-50 flex flex-col overflow-hidden shadow-2xl',
              'bottom-0 left-0 right-0 h-[85vh] rounded-t-2xl',
              'lg:bottom-6 lg:right-6 lg:left-auto lg:h-[600px] lg:rounded-2xl',
              'bg-background border border-border',
              isExpanded ? 'lg:w-[800px]' : 'lg:w-[450px]',
              'transition-all duration-300'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
              <h3 className="text-lg font-semibold">AI Assistant</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="hidden lg:flex"
                >
                  {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages container */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="flex flex-col gap-4">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'flex gap-3',
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'relative max-w-[80%] rounded-2xl px-4 py-2.5',
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground',
                        msg.role === 'assistant' &&
                          'prose prose-sm dark:prose-invert max-w-none'
                      )}
                    >
                      {msg.role === 'assistant' ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        <p className="whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                      )}
                      
                      {msg.createdAt && (
                        <span className={cn(
                          'text-xs mt-1 block',
                          msg.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        )}>
                          {formatTime(msg.createdAt)}
                        </span>
                      )}
                      
                      {msg.role === 'assistant' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="absolute -bottom-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Copy className="h-3 w-3" />
                          {copiedMsgId === msg.id && <span className="ml-1 text-xs">Copied!</span>}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-muted rounded-2xl px-4 py-3">
                      <LoadingDots />
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mx-4 mb-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Input form */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 px-4 py-3 border-t border-border bg-card"
            >
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleToggleRecognitionLang}
                disabled={isLoading || isListening}
                className="hidden sm:flex"
              >
                {recognitionLang === 'zh-TW' ? 'EN' : '中'}
              </Button>
              
              <Button
                type="button"
                variant={isListening ? 'destructive' : 'ghost'}
                size="icon"
                onClick={handleToggleListening}
                disabled={isLoading && !isListening}
              >
                {isListening ? <StopCircle className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={isListening ? 'Listening...' : 'Type your message...'}
                disabled={isLoading}
                className="flex-1 bg-background border border-input rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
              />
              
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !userInput.trim()}
                className="rounded-full"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
