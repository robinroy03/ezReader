import React, { useRef } from 'react';
import { useTTS } from '../hooks/useTTS';
import { apiService } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

interface ToolbarProps {
  onFileUpload: (file: File) => void;
  isLoading?: boolean;
  pdfText?: string; // Full PDF text for TTS
  onGenerateRoadmap?: () => Promise<string>;
  onRoadmapGenerated?: (data: Array<{
    id: string;
    label: string;
    indegree_id?: string[];
    outdegree_id?: string[];
  }>) => void;
  onRoadmapError?: (error: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onFileUpload,
  isLoading = false,
  pdfText = '',
  onGenerateRoadmap,
  onRoadmapGenerated,
  onRoadmapError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isPlaying, isLoading: ttsLoading, playText, stopPlayback } = useTTS();
  const { theme, toggleTheme } = useTheme();
  const [roadmapLoading, setRoadmapLoading] = React.useState(false);

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

  const handleGenerateRoadmap = async () => {
    if (!onGenerateRoadmap) return;
    
    try {
      setRoadmapLoading(true);
      
      // Clear any previous errors
      if (onRoadmapError) {
        onRoadmapError('');
      }
      
      const fullText = await onGenerateRoadmap();
      
      if (fullText) {
        // Generate roadmap from the extracted text
        const roadmapData = await apiService.generateRoadmap(fullText);
        console.log('Roadmap generated:', roadmapData);
        
        // Pass the roadmap data back to the parent component
        if (onRoadmapGenerated && roadmapData.roadmap) {
          onRoadmapGenerated(roadmapData.roadmap);
        }
        
        // Scroll down to the roadmap section after generation
        setTimeout(() => {
          window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
          });
        }, 500);
      }
    } catch (error) {
      console.error('Error generating roadmap:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate roadmap. Please make sure the backend server is running.';
      
      if (onRoadmapError) {
        onRoadmapError(errorMessage);
      } else {
        alert(errorMessage);
      }
    } finally {
      setRoadmapLoading(false);
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

      {/* Generate Roadmap Button */}
      {onGenerateRoadmap && (
        <button
          onClick={handleGenerateRoadmap}
          disabled={roadmapLoading}
          style={{
            padding: '10px 16px',
            backgroundColor: roadmapLoading ? 'var(--text-secondary)' : 'var(--button-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: roadmapLoading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: roadmapLoading ? 0.6 : 1,
          }}
          title="Generate learning roadmap from PDF"
        >
          {roadmapLoading ? '⏳ Generating...' : '🧠 Generate Roadmap'}
        </button>
      )}

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