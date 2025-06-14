// import React from 'react';
import { usePDF } from './hooks/usePDF';
import Toolbar from './components/Toolbar';
import PDFViewer from './components/PDFViewer';
import ChatInterface from './components/ChatInterface';
import { ResizableContainer, ResizablePanel } from './components/ResizablePanel';
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

  const clearSelectedText = () => {
    setSelectedText('');
  };

  // Mock PDF text for TTS (in real app, this would be extracted from PDF)
  const mockPdfText = selectedText || 
    "This is a sample PDF content for text-to-speech demonstration. " +
    "In a real application, this would be the full text extracted from the PDF document.";

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f5f5f5',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '2px solid #e9ecef',
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
            color: '#2c3e50',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            📚 ezReader
            <span style={{
              fontSize: '14px',
              fontWeight: '400',
              color: '#6c757d',
              backgroundColor: '#e9ecef',
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
                backgroundColor: '#f8d7da',
                border: '1px solid #f5c6cb',
                color: '#721c24',
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
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #dee2e6',
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
        backgroundColor: 'white',
        borderTop: '1px solid #e9ecef',
        padding: '8px 20px',
        fontSize: '12px',
        color: '#6c757d',
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
  );
}

export default App;
