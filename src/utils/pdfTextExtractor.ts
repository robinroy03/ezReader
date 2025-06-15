/**
 * Utility function to extract all text from the PDF.js viewer iframe
 */
export const extractFullTextFromPDF = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Find the PDF viewer iframe
      const iframe = document.querySelector('iframe[title="PDF Viewer"]') as HTMLIFrameElement;
      
      if (!iframe) {
        throw new Error('PDF viewer iframe not found. Please make sure a PDF is loaded.');
      }

      if (!iframe.contentWindow) {
        throw new Error('Cannot access PDF viewer content. Please make sure a PDF is loaded.');
      }

      // Set up a timeout for the operation
      const timeout = setTimeout(() => {
        reject(new Error('Text extraction timed out. The PDF might be too large or not fully loaded.'));
      }, 10000); // 10 second timeout

      // Set up message listener for the response
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'FULL_TEXT_RESPONSE') {
          clearTimeout(timeout);
          window.removeEventListener('message', handleMessage);
          
          const extractedText = event.data.text;
          if (!extractedText || extractedText.trim().length === 0) {
            reject(new Error('No text found in the PDF. The document might be image-based or empty.'));
          } else {
            console.log('📄 Successfully extracted text from PDF:', extractedText.length, 'characters');
            resolve(extractedText);
          }
        } else if (event.data?.type === 'FULL_TEXT_ERROR') {
          clearTimeout(timeout);
          window.removeEventListener('message', handleMessage);
          reject(new Error(event.data.error || 'Failed to extract text from PDF'));
        }
      };

      window.addEventListener('message', handleMessage);

      // Request full text extraction from the PDF viewer
      iframe.contentWindow.postMessage({
        type: 'EXTRACT_FULL_TEXT'
      }, '*');

    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Alternative method using PDF.js API directly (if available)
 * This is a fallback method in case the message-based approach doesn't work
 */
export const extractTextFromPDFDocument = async (): Promise<string> => {
  // This would require access to the PDFDocument object from PDF.js
  // For now, we'll use the message-based approach above
  throw new Error('Direct PDF.js API access not implemented yet. Using message-based extraction.');
}; 