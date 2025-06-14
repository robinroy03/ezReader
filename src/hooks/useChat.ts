import { useState, useCallback } from 'react';
import type { ChatMessage, ChatRequest } from '../services/api';
import { apiService } from '../services/api';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');

  const sendMessage = useCallback(async (request: ChatRequest) => {
    try {
      setIsLoading(true);
      setStreamingMessage('');

      // Add user message
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}_user`,
        content: request.message,
        role: 'user',
        timestamp: Date.now(),
        attachments: request.attachments,
      };

      setMessages(prev => [...prev, userMessage]);

      // Create assistant message placeholder
      const assistantMessageId = `msg_${Date.now()}_assistant`;
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        content: '',
        role: 'assistant',
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Stream the response
      let fullContent = '';
      for await (const chunk of apiService.streamChat(request)) {
        fullContent += chunk;
        setStreamingMessage(fullContent);
      }

      // Update the assistant message with full content
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? { ...msg, content: fullContent }
            : msg
        )
      );

      setStreamingMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setStreamingMessage('');
  }, []);

  return {
    messages,
    isLoading,
    streamingMessage,
    sendMessage,
    clearMessages,
  };
}; 