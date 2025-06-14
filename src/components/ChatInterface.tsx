import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../services/api';
import { useChat } from '../hooks/useChat';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

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
    <Card className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <CardHeader className="border-b-2 border-border bg-white rounded-t-base flex flex-row justify-between items-center p-4">
        <CardTitle className="text-lg font-heading">
          💬 AI Assistant
        </CardTitle>
        <Button
          onClick={clearMessages}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          Clear
        </Button>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-600 italic mt-16">
            <div className="text-5xl mb-4">🤖</div>
            <p className="font-base">Select text from the PDF and ask me anything!</p>
            <p className="text-sm font-base">
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
          <div className="bg-white p-3 rounded-base border-2 border-border self-start max-w-[85%] shadow-light">
            <div className="text-sm leading-relaxed font-base">
              {streamingMessage}
              <span className="blinking-cursor">|</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input Area */}
      <div className="p-4 border-t-2 border-border bg-white rounded-b-base">
        {/* Attachments */}
        {(attachments.length > 0 || selectedText) && (
          <div className="mb-2 flex flex-wrap gap-2">
            {/* Selected text as attachment */}
            {selectedText && (
              <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-base text-xs border-2 border-yellow-300 shadow-light">
                📝 Selected Text: "{selectedText.length > 30 ? selectedText.substring(0, 30) + '...' : selectedText}"
                <button
                  onClick={() => onClearSelectedText?.()}
                  className="ml-1 text-red-500 hover:text-red-700 border-none bg-transparent cursor-pointer"
                >
                  ×
                </button>
              </div>
            )}

            {/* File attachments */}
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center bg-blue-100 px-2 py-1 rounded-base text-xs border-2 border-blue-300 shadow-light"
              >
                📎 {file.name}
                <button
                  onClick={() => removeAttachment(index)}
                  className="ml-1 text-red-500 hover:text-red-700 border-none bg-transparent cursor-pointer"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            onPaste={handlePaste}
            placeholder="Ask about the PDF content..."
            className="flex-1 resize-none"
            rows={3}
          />
          
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="icon"
              title="Attach image"
            >
              📎
            </Button>
            
            <Button
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && attachments.length === 0 && !selectedText)}
              size="icon"
              title="Send message"
            >
              📤
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Message Bubble Component
const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] p-3 rounded-base border-2 border-border shadow-light font-base ${
        isUser 
          ? 'bg-main text-black' 
          : 'bg-white text-black'
      }`}>
        {message.attachments && message.attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {message.attachments.map((attachment, index) => (
              <div key={index} className="text-xs bg-gray-100 px-2 py-1 rounded border">
                📎 {attachment.name}
              </div>
            ))}
          </div>
        )}
        
        {message.context && (
          <div className="mb-2 p-2 bg-yellow-50 border-l-2 border-yellow-300 text-xs italic">
            <strong>Context:</strong> "{message.context.length > 100 ? message.context.substring(0, 100) + '...' : message.context}"
          </div>
        )}
        
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface; 