import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from './ui/card';

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
      <Card 
        className="flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 flex-col gap-4"
        style={{ width, height }}
      >
        <CardContent className="text-center p-8">
          <div className="text-6xl mb-4">📄</div>
          <div className="text-gray-600 text-lg font-base mb-2">
            No PDF loaded
          </div>
          <div className="text-gray-600 text-sm font-base">
            Use the "Upload File" button to select a PDF document
          </div>
        </CardContent>
      </Card>
    );
  }

  const finalViewerUrl = constructViewerUrl();

  return (
    <div className="relative" style={{ width, height }}>
      {isLoading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/95 p-6 rounded-base z-10 flex flex-col items-center gap-3 shadow-light border-2 border-border">
          <div className="text-3xl">📄</div>
          <div className="text-base font-base">Loading PDF viewer...</div>
        </div>
      )}
      
      {error && (
        <Card className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/95 border-2 border-red-500 text-red-600 z-10 max-w-sm">
          <CardContent className="text-center p-6">
            <div className="text-3xl mb-3">❌</div>
            <div className="font-heading mb-2">Error:</div>
            <div className="mb-3 font-base">{error}</div>
            <div className="text-xs opacity-80 font-base">
              Make sure to run: <code className="bg-gray-100 px-1 rounded">npm run dev</code>
            </div>
          </CardContent>
        </Card>
      )}

      <iframe
        ref={iframeRef}
        src={finalViewerUrl}
        width="100%"
        height="100%"
        className="border-none rounded-base bg-white"
        title="PDF Viewer"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        sandbox="allow-scripts allow-same-origin allow-downloads allow-forms"
      />
    </div>
  );
};

export default PDFViewer; 