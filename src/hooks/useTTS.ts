import { useState, useCallback, useRef } from 'react';
import type { TTSRequest } from '../services/api';
import { apiService } from '../services/api';

export const useTTS = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playText = useCallback(async (text: string, options?: Partial<TTSRequest>) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!text.trim()) {
        throw new Error('No text provided for speech synthesis');
      }

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const request: TTSRequest = {
        text: text.trim(),
        voice: options?.voice || 'default',
        speed: options?.speed || 1.0,
      };

      // Get audio blob from API
      const audioBlob = await apiService.textToSpeech(request);
      
      // Create audio element and play
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setError('Failed to play audio');
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      await audio.play();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to synthesize speech';
      setError(errorMessage);
      console.error('TTS error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isPlaying,
    isLoading,
    error,
    playText,
    stopPlayback,
    clearError,
  };
}; 