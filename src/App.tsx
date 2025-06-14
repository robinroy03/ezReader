// import React from 'react';
import { usePDF } from './hooks/usePDF';
import Toolbar from './components/Toolbar';
import PDFViewer from './components/PDFViewer';
import ChatInterface from './components/ChatInterface';
import { ResizableContainer, ResizablePanel } from './components/ResizablePanel';

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
    <div className="h-screen w-screen flex flex-col bg-bg overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b-2 border-border py-2 flex-shrink-0 shadow-light">
        <div className="px-5">
          <h1 className="m-0 text-2xl font-heading text-text flex items-center gap-3">
            📚 ezReader
            <span className="text-sm font-base text-gray-600 bg-gray-200 px-2 py-1 rounded-base border border-border">
              now learn with no context switching!
            </span>
          </h1>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex-shrink-0">
        <Toolbar
          onFileUpload={uploadPDF}
          isLoading={pdfLoading}
          pdfText={mockPdfText}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex p-5 gap-0 w-full min-h-0 overflow-hidden box-border">
        <ResizableContainer>
          {/* PDF Viewer Section */}
          <div className="flex-1 min-w-0 flex flex-col pr-2">
            {pdfError && (
              <div className="bg-red-100 border-2 border-red-300 text-red-800 p-3 rounded-base mb-4 text-sm shadow-light">
                <strong>Error:</strong> {pdfError}
              </div>
            )}
            
            <div className="flex-1 bg-white rounded-base border-2 border-border overflow-hidden relative shadow-light">
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
            <div className="h-full pl-2">
              <ChatInterface
                selectedText={selectedText}
                onClearSelectedText={clearSelectedText}
              />
            </div>
          </ResizablePanel>
        </ResizableContainer>
      </div>

      {/* Footer/Status Bar */}
      <div className="bg-white border-t-2 border-border py-2 px-5 text-xs text-gray-600 flex justify-between items-center flex-shrink-0 shadow-light">
        <div>
          {pdfUrl ? (
            <span>✅ PDF loaded successfully</span>
          ) : (
            <span>📄 No PDF loaded - upload a file to get started</span>
          )}
        </div>
        
        <div className="flex gap-4">
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
