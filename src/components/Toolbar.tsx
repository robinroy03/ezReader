import React, { useRef } from 'react';
import { useTTS } from '../hooks/useTTS';
import { apiService } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

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
  const { theme, toggleTheme } = useTheme();

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
    <div style={{
      display: 'flex',
      gap: '12px',
      padding: '16px',
      backgroundColor: 'var(--bg-primary)',
      borderBottom: `1px solid var(--border-primary)`,
      alignItems: 'center',
    }}>
      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          style={{
            padding: '10px 16px',
            backgroundColor: 'var(--button-success)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: isLoading ? 0.6 : 1,
          }}
          title="Upload PDF file"
        >
          📄 {isLoading ? 'Uploading...' : 'Upload File'}
        </button>
      </div>

      {/* TTS Button */}
      <button
        onClick={handleTTS}
        disabled={ttsLoading || !pdfText.trim()}
        style={{
          padding: '10px 12px',
          backgroundColor: isPlaying ? 'var(--button-danger)' : 'var(--button-primary)',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: (ttsLoading || !pdfText.trim()) ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          opacity: (ttsLoading || !pdfText.trim()) ? 0.6 : 1,
        }}
        title={isPlaying ? 'Stop speech' : 'Read PDF aloud'}
      >
        {ttsLoading ? '⏳' : isPlaying ? '⏹️' : '🔊'}
      </button>

      {/* Share Button */}
      <button
        onClick={handleShare}
        style={{
          padding: '10px 16px',
          backgroundColor: 'var(--button-secondary)',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
        title="Share document"
      >
        🔗 Share
      </button>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="theme-toggle"
        style={{
          marginLeft: 'auto',
        }}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      {/* Status Messages */}
      {isLoading && (
        <div style={{
          marginLeft: theme ? '0' : 'auto',
          fontSize: '14px',
          color: 'var(--text-secondary)',
          fontStyle: 'italic',
        }}>
          Uploading PDF...
        </div>
      )}
      
      {ttsLoading && (
        <div style={{
          marginLeft: (isLoading || theme) ? '0' : 'auto',
          fontSize: '14px',
          color: 'var(--text-secondary)',
          fontStyle: 'italic',
        }}>
          Generating speech...
        </div>
      )}
    </div>
  );
};

export default Toolbar; 