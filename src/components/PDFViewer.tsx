import React, { useRef, useEffect, useState } from 'react';

interface PDFViewerProps {
  /** URL of the PDF file to display */
  pdfUrl?: string;
  /** Base URL where PDF.js viewer is served (default: /web/) */
  viewerUrl?: string;
  /** Width of the iframe (default: 100%) */
  width?: string;
  /** Height of the iframe (default: 100%) */
  height?: string;
  /** Additional parameters to pass to the viewer */
  viewerParams?: Record<string, string>;
  /** Callback for when text is selected in the PDF */
  onTextSelection?: (selectedText: string) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  viewerUrl = '/web/viewer.html',
  width = '100%',
  height = '100%',
  viewerParams = {},
  onTextSelection
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Construct the full viewer URL with parameters
  const constructViewerUrl = () => {
    const url = new URL(viewerUrl, window.location.origin);
    
    // Add PDF file parameter if provided
    if (pdfUrl) {
      url.searchParams.set('file', pdfUrl);
    }
    
    // Add additional parameters
    Object.entries(viewerParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    
    return url.toString();
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
    
    // Inject text selection handler into the iframe
    if (iframeRef.current?.contentWindow) {
      try {
        // Send initialization message to setup text selection monitoring
        iframeRef.current.contentWindow.postMessage({
          type: 'INIT_TEXT_SELECTION_MONITORING'
        }, '*');
      } catch (err) {
        console.warn('Could not initialize text selection monitoring:', err);
      }
    }
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError('Failed to load PDF viewer. Make sure the PDF.js server is running.');
  };

  // Listen for messages from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'TEXT_SELECTION') {
        const selectedText = event.data.text;
        console.log('📄 Text selected from PDF:', selectedText);
        
        // Call the callback if provided
        if (onTextSelection) {
          onTextSelection(selectedText);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onTextSelection]);

  useEffect(() => {
    if (pdfUrl) {
      setIsLoading(true);
      setError(null);
    }
  }, [pdfUrl, viewerUrl]);

  if (!pdfUrl) {
    return (
      <div style={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-secondary)',
        border: `2px dashed var(--border-primary)`,
        borderRadius: '8px',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{ fontSize: '64px' }}>📄</div>
        <div style={{ 
          textAlign: 'center', 
          color: 'var(--text-primary)',
          fontSize: '18px',
          fontWeight: '500'
        }}>
          No PDF loaded
        </div>
        <div style={{ 
          textAlign: 'center', 
          color: 'var(--text-secondary)',
          fontSize: '14px'
        }}>
          Use the "Upload File" button to select a PDF document
        </div>
      </div>
    );
  }

  const finalViewerUrl = constructViewerUrl();

  return (
    <div style={{ width, height, position: 'relative' }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'var(--bg-primary)',
          padding: '24px',
          borderRadius: '8px',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          boxShadow: `0 4px 6px var(--shadow)`,
          border: `1px solid var(--border-primary)`,
        }}>
          <div style={{ fontSize: '32px' }}>📄</div>
          <div style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)' }}>Loading PDF viewer...</div>
        </div>
      )}
      
      {error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'var(--bg-primary)',
          border: `2px solid var(--button-danger)`,
          color: 'var(--button-danger)',
          padding: '24px',
          borderRadius: '8px',
          textAlign: 'center',
          zIndex: 10,
          maxWidth: '400px',
          boxShadow: `0 4px 6px var(--shadow)`,
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>❌</div>
          <div style={{ fontWeight: '600', marginBottom: '8px' }}>Error:</div>
          <div style={{ marginBottom: '12px' }}>{error}</div>
          <div style={{ fontSize: '12px', opacity: 0.8, color: 'var(--text-secondary)' }}>
            Make sure to run: <code style={{ backgroundColor: 'var(--bg-secondary)', padding: '2px 4px', borderRadius: '4px' }}>npm run dev</code>
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={finalViewerUrl}
        width="100%"
        height="100%"
        style={{
          border: 'none',
          borderRadius: '8px',
          backgroundColor: 'white',
        }}
        title="PDF Viewer"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        sandbox="allow-scripts allow-same-origin allow-downloads allow-forms"
      />
    </div>
  );
};

export default PDFViewer; 