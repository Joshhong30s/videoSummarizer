// app/components/chat/chatbot.tsx
'use client';

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessage {
  id: string; // 可以是來自資料庫的 ID 或臨時的客戶端 ID
  role: 'user' | 'assistant';
  content: string;
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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userInput.trim(),
    };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setUserInput('');
    setIsLoading(true);
    setError(null);

    try {
      // const userId = getUserId ? getUserId() : undefined; // 如果需要傳遞 userId

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: newUserMessage.content,
          sessionId: sessionId,
          // userId: userId, // 如果需要
          sessionMetadata: contextMetadata, //
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
      };
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      setSessionId(data.sessionId);
    } catch (err: any) {
      console.error('Chatbot error:', err);
      setError(err.message || 'An error occurred.');

      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, an error occurred: ${err.message || 'Unknown error'}`,
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const chatboxStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '400px',
    height: '500px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: 'white',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    display: isOpen ? 'flex' : 'none',
    flexDirection: 'column',
    fontFamily: 'sans-serif',
    overflow: 'hidden',
    zIndex: 1050,
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
    wordWrap: 'break-word',
    alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
    backgroundColor: role === 'user' ? '#007bff' : '#e9ecef',
    color: role === 'user' ? 'white' : 'black',
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

  if (!isOpen) {
    return null;
  }

  return (
    <div style={chatboxStyle} className="chatbot-container">
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
      <div style={messagesContainerStyle} className="chatbot-messages">
        {messages.map(msg => (
          <div
            key={msg.id}
            style={messageStyle(msg.role)}
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
        <div ref={messagesEndRef} />
      </div>
      {error && (
        <div style={{ padding: '10px', color: 'red', textAlign: 'center' }}>
          Error: {error}
        </div>
      )}
      <form onSubmit={handleSubmit} style={formStyle} className="chatbot-form">
        <input
          type="text"
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
          placeholder="Type your message..."
          style={inputStyle}
          disabled={isLoading}
          className="chatbot-input"
        />
        <button
          type="submit"
          disabled={isLoading}
          style={buttonStyle}
          className="chatbot-submit"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
