'use client';

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Mic, StopCircle, Copy, X, Maximize2, Minimize2, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useEnhancedVoiceInput } from '@/lib/hooks/useEnhancedVoiceInput';
import { VoiceVisualizer } from '@/app/components/ui/voice-visualizer';

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

export function Chatbot({
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const voiceInput = useEnhancedVoiceInput(
    (transcript, isFinal) => {
      if (isFinal) {
        // 最終結果，直接設置
        setUserInput(transcript);
      } else {
        // 即時預覽，不要直接修改輸入框
        // 讓用戶看到即時識別但不干擾編輯
      }
    },
    (voiceError) => {
      setError(voiceError);
    },
    {
      pauseThreshold: 2000,    // 2秒停頓後送出
      timeoutDuration: 30000,  // 30秒超時
      showInterimResults: true,
      autoDetectLanguage: true,
    }
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

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
            {(error || voiceInput.error) && (
              <div className="mx-4 mb-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error || voiceInput.error}
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
                onClick={voiceInput.toggleLanguage}
                disabled={isLoading || voiceInput.isListening}
                className="hidden sm:flex"
              >
                {voiceInput.currentLang === 'zh-TW' ? 'EN' : '中'}
              </Button>
              
              <div className="relative">
                <Button
                  type="button"
                  variant={voiceInput.isListening ? 'destructive' : 'ghost'}
                  size="icon"
                  onClick={voiceInput.isListening ? voiceInput.stopListening : voiceInput.startListening}
                  disabled={isLoading && !voiceInput.isListening}
                  className="relative"
                >
                  <VoiceVisualizer
                    isListening={voiceInput.isListening}
                    audioLevel={voiceInput.audioLevel}
                    isSpeaking={voiceInput.isSpeaking}
                    size="sm"
                    className="absolute inset-0"
                  />
                  {voiceInput.isListening ? (
                    <StopCircle className="h-4 w-4 relative z-10" />
                  ) : (
                    <Mic className="h-4 w-4 relative z-10" />
                  )}
                </Button>
              </div>
              
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={
                    voiceInput.isListening 
                      ? voiceInput.isSpeaking 
                        ? 'Listening...' 
                        : 'Speak now...' 
                      : 'Type your message...'
                  }
                  disabled={isLoading}
                  className="w-full bg-background border border-input rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
                />
                
                {/* 即時語音識別預覽 */}
                {voiceInput.isListening && (voiceInput.finalTranscript || voiceInput.interimTranscript) && (
                  <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-muted/80 backdrop-blur-sm border border-border rounded-lg text-xs z-50">
                    {voiceInput.finalTranscript && (
                      <span className="text-foreground">
                        {voiceInput.finalTranscript}
                      </span>
                    )}
                    {voiceInput.interimTranscript && (
                      <span className="text-muted-foreground italic">
                        {voiceInput.finalTranscript ? ' ' : ''}
                        {voiceInput.interimTranscript}
                        <span className="animate-pulse">|</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
              
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
