// import React from 'react';
import { useRef, useState } from 'react';
import { usePDF } from './hooks/usePDF';
import Toolbar from './components/Toolbar';
import PDFViewer from './components/PDFViewer';
import ChatInterface from './components/ChatInterface';
import RoadmapGenerator from './components/RoadmapGenerator';
import { ResizableContainer, ResizablePanel } from './components/ResizablePanel';
import { extractFullTextFromPDF } from './utils/pdfTextExtractor';
import './App.css';

function App() {
  const {
    pdfUrl,
    selectedText,
    isLoading: pdfLoading,
    error: pdfError,
    uploadPDF,
    handleTextSelection,
    setSelectedText,
  } = usePDF();

  const roadmapRef = useRef<HTMLDivElement>(null);
  const [roadmapData, setRoadmapData] = useState<Array<{
    id: string;
    label: string;
    indegree_id?: string[];
    outdegree_id?: string[];
  }>>([]);
  const [roadmapError, setRoadmapError] = useState('');
  const [roadmapLoading, setRoadmapLoading] = useState(false);

  const clearSelectedText = () => {
    setSelectedText('');
  };

  const handleClearRoadmap = () => {
    setRoadmapData([]);
    setRoadmapError('');
  };

  const handleRoadmapGenerated = (data: typeof roadmapData) => {
    setRoadmapData(data);
    console.log('Roadmap data received in App:', data);
  };

  const handleRoadmapError = (error: string) => {
    setRoadmapError(error);
  };

  const handleRoadmapLoadingChange = (loading: boolean) => {
    setRoadmapLoading(loading);
  };



  // const handleExtractFullText = async (): Promise<string> => {
  //   return await extractFullTextFromPDF();
  // };

  const handleGenerateRoadmap = async (): Promise<string> => {
    try {
      // Extract text and generate roadmap
      const fullText = await extractFullTextFromPDF();
      
      // Scroll to roadmap section
      setTimeout(() => {
        roadmapRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
      
      return fullText;
    } catch (error) {
      console.error('Error in roadmap generation:', error);
      throw error;
    }
  };

  // Mock PDF text for TTS (in real app, this would be extracted from PDF)
  const mockPdfText = selectedText || 
    "This is a sample PDF content for text-to-speech demonstration. " +
    "In a real application, this would be the full text extracted from the PDF document.";

  return (
    <div style={{
      width: '100vw',
      backgroundColor: 'var(--bg-secondary)',
      overflow: 'auto',
    }}>
      {/* Main App Section - Full Viewport */}
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'var(--bg-primary)',
          borderBottom: `2px solid var(--border-primary)`,
          padding: '8px 0',
          flexShrink: 0,
        }}>
          <div style={{
            padding: '0 20px',
          }}>
            <h1 style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: '700',
              color: 'var(--text-accent)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              📚 ezReader
              <span style={{
                fontSize: '14px',
                fontWeight: '400',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-secondary)',
                padding: '4px 8px',
                borderRadius: '12px',
              }}>
                now learn with no context switching!
              </span>
            </h1>
          </div>
        </div>

        {/* Toolbar */}
        <div style={{ flexShrink: 0 }}>
                      <Toolbar
              onFileUpload={uploadPDF}
              isLoading={pdfLoading}
              pdfText={mockPdfText}
              onGenerateRoadmap={pdfUrl ? handleGenerateRoadmap : undefined}
              onRoadmapGenerated={handleRoadmapGenerated}
              onRoadmapError={handleRoadmapError}
              onRoadmapLoadingChange={handleRoadmapLoadingChange}
            />
        </div>

          {/* Main Content */}
          <div style={{
            flex: 1,
            display: 'flex',
            padding: '20px',
            gap: '0',
            width: 'calc(100% - 40px)',
            margin: '0 20px',
            minHeight: 0,
            overflow: 'hidden',
            boxSizing: 'border-box',
          }}>
            <ResizableContainer>
              {/* PDF Viewer Section */}
              <div style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                paddingRight: '8px',
              }}>
                {pdfError && (
                  <div style={{
                    backgroundColor: 'var(--error-bg)',
                    border: `1px solid var(--error-border)`,
                    color: 'var(--error-text)',
                    padding: '12px',
                    borderRadius: '6px',
                    marginBottom: '16px',
                    fontSize: '14px',
                  }}>
                    <strong>Error:</strong> {pdfError}
                  </div>
                )}
                
                <div style={{
                  flex: 1,
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: '8px',
                  border: `1px solid var(--border-secondary)`,
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                  <PDFViewer
                    pdfUrl={pdfUrl}
                    onTextSelection={handleTextSelection}
                    height="100%"
                  />
                </div>
              </div>

              {/* Resizable Chat Interface Section */}
              <ResizablePanel 
                defaultWidth={400}
                minWidth={250}
                maxWidth={600}
              >
                <div style={{
                  height: '100%',
                  paddingLeft: '8px',
                }}>
                  <ChatInterface
                    selectedText={selectedText}
                    onClearSelectedText={clearSelectedText}
                  />
                </div>
              </ResizablePanel>
            </ResizableContainer>
          </div>

          {/* Footer/Status Bar */}
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            borderTop: `1px solid var(--border-primary)`,
            padding: '8px 20px',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}>
            <div>
              {pdfUrl ? (
                <span>✅ PDF loaded successfully</span>
              ) : (
                <span>📄 No PDF loaded - upload a file to get started</span>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              {selectedText && (
                <span>📝 Text selected: {selectedText.length} characters</span>
              )}
              <span>
                🚀 ezReader v1.0
              </span>
            </div>
          </div>
        </div>

        {/* Roadmap Generator Section - Full Viewport */}
        {pdfUrl && (
          <div 
            ref={roadmapRef}
            style={{
              height: '100vh',
              backgroundColor: 'var(--bg-secondary)',
              borderTop: '2px solid var(--border-primary)',
            }}
          >
            <RoadmapGenerator 
              roadmapData={roadmapData}
              error={roadmapError}
              isLoading={roadmapLoading}
              onClear={handleClearRoadmap}
            />
          </div>
        )}
    </div>
  );
}

export default App;
