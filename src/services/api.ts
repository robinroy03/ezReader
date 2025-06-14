// API Configuration (for future use when we have real backend)
// When implementing real backend calls, import axios and use it
export const API_BASE_URL = 'https://api.smartpdf-reader.com';

// Types
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  attachments?: File[];
}

export interface TTSRequest {
  text: string;
  voice?: string;
  speed?: number;
}

export interface ChatRequest {
  message: string;
  context?: string; // Selected text from PDF
  attachments?: File[];
  conversationId?: string;
}

export interface ShareResponse {
  shareUrl: string;
  shareId: string;
}

export interface ShareMetadata {
  title?: string;
  description?: string;
  tags?: string[];
}

// API Service Class
class APIService {
  // Text-to-Speech API
  async textToSpeech(request: TTSRequest): Promise<Blob> {
    try {
      // Dummy implementation - for now return a promise that resolves after delay
      console.log('🔊 TTS API called with:', request);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return dummy audio blob (empty for now)
      return new Blob(['dummy audio data'], { type: 'audio/mpeg' });
    } catch (error) {
      console.error('TTS API error:', error);
      throw new Error('Failed to generate speech');
    }
  }

  // Chat API with streaming
  async *streamChat(request: ChatRequest): AsyncGenerator<string, void, unknown> {
    try {
      console.log('💬 Chat API called with:', request);
      
      // Dummy streaming response
      const dummyResponse = `I understand you're asking about: "${request.context || request.message}". 

Based on the PDF content, here's my analysis:

This appears to be discussing evaluation orders for SDDs (Syntax-Directed Definitions). The key points are:

1. S-Attributed definitions guarantee an evaluation order
2. They don't permit dependency graphs with cycles  
3. Attributes are evaluated in bottom-up order
4. Post-order traversal is used for evaluation

Would you like me to explain any specific aspect in more detail?`;

      // Simulate streaming by yielding chunks
      const words = dummyResponse.split(' ');
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate typing delay
        yield words[i] + ' ';
      }
    } catch (error) {
      console.error('Chat API error:', error);
      throw new Error('Failed to get chat response');
    }
  }

  // Share functionality
  async shareDocument(documentId: string, metadata?: ShareMetadata): Promise<ShareResponse> {
    try {
      console.log('🔗 Share API called with:', { documentId, metadata });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For now, return current URL
      return {
        shareUrl: window.location.href,
        shareId: `share_${Date.now()}`
      };
    } catch (error) {
      console.error('Share API error:', error);
      throw new Error('Failed to share document');
    }
  }

  // Upload PDF (if needed for backend storage)
  async uploadPDF(file: File): Promise<{ fileId: string; url: string }> {
    try {
      console.log('📄 PDF Upload API called with:', file.name);
      
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return dummy response
      return {
        fileId: `pdf_${Date.now()}`,
        url: URL.createObjectURL(file)
      };
    } catch (error) {
      console.error('PDF Upload API error:', error);
      throw new Error('Failed to upload PDF');
    }
  }
}

export const apiService = new APIService();
export default apiService; 