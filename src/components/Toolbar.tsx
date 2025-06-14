import React, { useRef } from 'react';
import { useTTS } from '../hooks/useTTS';
import { apiService } from '../services/api';
import { Button } from './ui/button';

interface ToolbarProps {
  onFileUpload: (file: File) => void;
  isLoading?: boolean;
  pdfText?: string; // Full PDF text for TTS
}

const Toolbar: React.FC<ToolbarProps> = ({
  onFileUpload,
  isLoading = false,
  pdfText = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isPlaying, isLoading: ttsLoading, playText, stopPlayback } = useTTS();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
    // Reset input to allow same file selection again
    e.target.value = '';
  };

  const handleTTS = async () => {
    if (!pdfText.trim()) {
      alert('No PDF content available for text-to-speech');
      return;
    }

    if (isPlaying) {
      stopPlayback();
    } else {
      await playText(pdfText);
    }
  };

  const handleShare = async () => {
    try {
      const response = await apiService.shareDocument('current-pdf', {
        title: 'Shared PDF Document',
        description: 'PDF document shared from ezReader',
      });
      
      // Copy to clipboard
      await navigator.clipboard.writeText(response.shareUrl);
      alert('Share link copied to clipboard!');
    } catch (error) {
      console.error('Share error:', error);
      // Fallback to current URL
      await navigator.clipboard.writeText(window.location.href);
      alert('Current page URL copied to clipboard!');
    }
  };

  return (
    <div className="flex gap-3 p-4 bg-white border-b-2 border-border items-center shadow-light">
      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          variant="success"
          className="flex items-center gap-2"
          title="Upload PDF file"
        >
          📄 {isLoading ? 'Uploading...' : 'Upload File'}
        </Button>
      </div>

      {/* TTS Button */}
      <Button
        onClick={handleTTS}
        disabled={ttsLoading || !pdfText.trim()}
        variant={isPlaying ? 'destructive' : 'default'}
        size="icon"
        className="text-base"
        title={isPlaying ? 'Stop speech' : 'Read PDF aloud'}
      >
        {ttsLoading ? '⏳' : isPlaying ? '⏹️' : '🔊'}
      </Button>

      {/* Share Button */}
      <Button
        onClick={handleShare}
        variant="secondary"
        className="flex items-center gap-2"
        title="Share document"
      >
        🔗 Share
      </Button>

      {/* Status Messages */}
      {isLoading && (
        <div className="ml-auto text-sm text-gray-600 italic font-base">
          Uploading PDF...
        </div>
      )}
      
      {ttsLoading && (
        <div className={`${isLoading ? 'ml-0' : 'ml-auto'} text-sm text-gray-600 italic font-base`}>
          Generating speech...
        </div>
      )}
    </div>
  );
};

export default Toolbar; 