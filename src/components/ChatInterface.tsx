import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../services/api';
import { useChat } from '../hooks/useChat';

interface ChatInterfaceProps {
  selectedText?: string;
  onClearSelectedText?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  selectedText,
  onClearSelectedText,
}) => {
  const { messages, isLoading, streamingMessage, sendMessage, clearMessages } = useChat();
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  const handleSend = async () => {
    if (!input.trim() && attachments.length === 0 && !selectedText) return;

    const request = {
      message: input,
      context: selectedText,
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    await sendMessage(request);
    setInput('');
    setAttachments([]);
    if (onClearSelectedText) {
      onClearSelectedText();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter(item => item.type.startsWith('image/'));
    
    if (imageItems.length > 0) {
      e.preventDefault();
      
      imageItems.forEach(item => {
        const file = item.getAsFile();
        if (file) {
          setAttachments(prev => [...prev, file]);
        }
      });
    }
  };



  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#f8f9fa',
      border: '1px solid #e9ecef',
      borderRadius: '8px',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #e9ecef',
        backgroundColor: 'white',
        borderRadius: '8px 8px 0 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
          💬 AI Assistant
        </h3>
        <button
          onClick={clearMessages}
          style={{
            background: 'none',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          Clear
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        {messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#6c757d',
            fontStyle: 'italic',
            marginTop: '60px',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
            <p>Select text from the PDF and ask me anything!</p>
            <p style={{ fontSize: '14px' }}>
              I can help explain concepts, summarize content, or answer questions.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}

        {/* Streaming message */}
        {streamingMessage && (
          <div style={{
            backgroundColor: 'white',
            padding: '12px',
            borderRadius: '12px',
            border: '1px solid #e9ecef',
            alignSelf: 'flex-start',
            maxWidth: '85%',
          }}>
            <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
              {streamingMessage}
              <span className="blinking-cursor">|</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid #e9ecef',
        backgroundColor: 'white',
        borderRadius: '0 0 8px 8px',
      }}>
        {/* Attachments */}
        {(attachments.length > 0 || selectedText) && (
          <div style={{
            marginBottom: '8px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            {/* Selected text as attachment */}
            {selectedText && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#fff3cd',
                  padding: '4px 8px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  border: '1px solid #ffeaa7',
                }}
              >
                📝 Selected Text: "{selectedText.length > 30 ? selectedText.substring(0, 30) + '...' : selectedText}"
                <button
                  onClick={() => onClearSelectedText?.()}
                  style={{
                    marginLeft: '4px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#f44336',
                  }}
                >
                  ×
                </button>
              </div>
            )}
            {/* File attachments */}
            {attachments.map((file, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#e3f2fd',
                  padding: '4px 8px',
                  borderRadius: '16px',
                  fontSize: '12px',
                }}
              >
                📎 {file.name}
                <button
                  onClick={() => removeAttachment(index)}
                  style={{
                    marginLeft: '4px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#f44336',
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              onPaste={handlePaste}
              placeholder="Ask a question about the PDF..."
              disabled={isLoading}
              style={{
                width: '100%',
                minHeight: '44px',
                maxHeight: '120px',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                resize: 'vertical',
                fontSize: '14px',
                lineHeight: '1.4',
                outline: 'none',
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '4px' }}>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '16px',
              }}
              title="Attach image"
            >
              📎
            </button>
            
            <button
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && attachments.length === 0)}
              style={{
                padding: '12px 16px',
                backgroundColor: isLoading ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
              }}
            >
              {isLoading ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .blinking-cursor {
          animation: blink 1s infinite;
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div style={{
      alignSelf: isUser ? 'flex-end' : 'flex-start',
      maxWidth: '85%',
    }}>
      <div style={{
        backgroundColor: isUser ? '#007bff' : 'white',
        color: isUser ? 'white' : 'black',
        padding: '12px',
        borderRadius: '12px',
        border: isUser ? 'none' : '1px solid #e9ecef',
        fontSize: '14px',
        lineHeight: '1.5',
      }}>
        {message.content}
        
        {/* Show attachments */}
        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {message.attachments && message.attachments.length > 0 && (
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              📎 {message.attachments.length} file attachment(s)
            </div>
          )}
          {message.context && (
            <div style={{ 
              fontSize: '12px', 
              opacity: 0.8,
              backgroundColor: isUser ? 'rgba(255,255,255,0.1)' : '#fff3cd',
              padding: '4px 8px',
              borderRadius: '8px',
              border: isUser ? '1px solid rgba(255,255,255,0.2)' : '1px solid #ffeaa7',
              color: isUser ? 'white' : '#856404'
            }}>
              📝 Selected Text: "{message.context.length > 50 ? message.context.substring(0, 50) + '...' : message.context}"
            </div>
          )}
        </div>
      </div>
      
      <div style={{
        fontSize: '11px',
        color: '#6c757d',
        marginTop: '4px',
        textAlign: isUser ? 'right' : 'left',
      }}>
        {new Date(message.timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </div>
    </div>
  );
};

export default ChatInterface; 