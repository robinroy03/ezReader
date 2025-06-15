import axios from 'axios';

// Configuration - Simple hostname-based detection
// If running on localhost = local development, otherwise = VPS production
// const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// // API Configuration
// // On VPS: use /api proxy routes through nginx
// // On local: connect directly to backend on localhost:8000
// export const API_BASE_URL = IS_LOCAL 
//   ? 'http://localhost:8000'  // Direct connection for local development
//   : '/api';  // Use relative path for nginx proxy on VPS

const IS_LOCAL = false;

export const API_BASE_URL = 'http://localhost:8000';

console.log('🔧 API Configuration:', {
  IS_LOCAL,
  API_BASE_URL,
  hostname: window.location.hostname
});

// Types
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  attachments?: File[];
  context?: string; // Selected text from PDF
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
  previousMessages?: ChatMessage[];
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

export interface RoadmapResponse {
  roadmap: Array<{
    id: string;
    label: string;
    indegree_id?: string[];
    outdegree_id?: string[];
  }>;
}

// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

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
      
      // Convert attachments to base64 if present
      let images: string[] | undefined;
      let pdf_files: string[] | undefined;
      let audio_files: string[] | undefined;

      if (request.attachments && request.attachments.length > 0) {
        images = [];
        pdf_files = [];
        audio_files = [];

        for (const file of request.attachments) {
          const base64 = await fileToBase64(file);
          
          if (file.type.startsWith('image/')) {
            images.push(base64);
          } else if (file.type === 'application/pdf') {
            pdf_files.push(base64);
          } else if (file.type.startsWith('audio/')) {
            audio_files.push(base64);
          }
        }

        // Remove empty arrays
        if (images.length === 0) images = undefined;
        if (pdf_files.length === 0) pdf_files = undefined;
        if (audio_files.length === 0) audio_files = undefined;
      }

      // Format main query with context if available
      const main_query = request.context 
        ? `Context: ${request.context}\n\nQuestion: ${request.message}`
        : request.message;

      // Convert previous messages to backend format
      const previous_messages = request.previousMessages?.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          main_query,
          pdf_files,
          images,
          audio_files,
          previous_messages,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      const decoder = new TextDecoder();
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }
          
          const chunk = decoder.decode(value, { stream: true });
          console.log('📥 Received chunk:', chunk); // Debug log
          
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.trim() === '') continue; // Skip empty lines
            
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                console.log('🏁 Stream ended');
                return;
              }
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  console.log('✅ Yielding content:', parsed.content);
                  yield parsed.content;
                } else if (parsed.error) {
                  console.error('❌ Stream error:', parsed.error);
                  throw new Error(parsed.error);
                }
              } catch (parseError) {
                // Skip invalid JSON lines
                console.warn('Failed to parse SSE data:', data, parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Chat API error:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend server. Make sure it\'s running on http://localhost:8000');
      }
      
      // Additional debugging
      console.error('Full error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : typeof error
      });
      
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

  // Generate roadmap from text
  async generateRoadmap(text: string): Promise<RoadmapResponse> {
    try {
      console.log('🧠 Roadmap generation API called with text length:', text.length);
      
      const response = await axios.post(`${API_BASE_URL}/roadmap/generate`, {
        text: text
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      });

      return response.data;
    } catch (error) {
      console.error('Roadmap generation API error:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Roadmap generation endpoint not found. Make sure the backend server is running on http://localhost:8000');
        }
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Cannot connect to backend server. Make sure it\'s running on http://localhost:8000');
        }
        throw new Error(error.response?.data?.detail || error.message || 'Failed to generate roadmap');
      }
      
      throw new Error('Failed to generate roadmap');
    }
  }
}

export const apiService = new APIService();
export default apiService; 