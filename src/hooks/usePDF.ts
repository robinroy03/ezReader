import { useState, useCallback } from 'react';
import { apiService } from '../services/api';

export const usePDF = () => {
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [selectedText, setSelectedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadPDF = useCallback(async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Validate file type
      if (file.type !== 'application/pdf') {
        throw new Error('Please select a valid PDF file');
      }

      // For now, create object URL locally
      // In future, this will upload to backend
      const url = URL.createObjectURL(file);
      setPdfUrl(url);

      // Optional: Upload to backend for storage/processing
      await apiService.uploadPDF(file);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload PDF';
      setError(errorMessage);
      console.error('PDF upload error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearPDF = useCallback(() => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl('');
    setSelectedText('');
    setError(null);
  }, [pdfUrl]);

  const handleTextSelection = useCallback((text: string) => {
    setSelectedText(text);
  }, []);

  return {
    pdfUrl,
    selectedText,
    isLoading,
    error,
    uploadPDF,
    clearPDF,
    handleTextSelection,
    setSelectedText,
  };
}; 