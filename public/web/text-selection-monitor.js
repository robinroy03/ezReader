// Text Selection Monitor for PDF.js
// This script monitors text selection in PDF.js and communicates with the parent window

(function() {
  'use strict';
  
  let isInitialized = false;
  
  function initializeTextSelectionMonitoring() {
    if (isInitialized) return;
    isInitialized = true;
    
    console.log('Initializing text selection monitoring...');
    
    // Function to get selected text from PDF.js
    function getSelectedText() {
      // Try multiple methods to get selected text
      let selectedText = '';
      
      // Method 1: Check window selection
      const selection = window.getSelection();
      if (selection && selection.toString().trim()) {
        selectedText = selection.toString().trim();
      }
      
      // Method 2: Check for PDF.js specific text layer selection
      if (!selectedText) {
        const textLayerElements = document.querySelectorAll('.textLayer span');
        const selectedElements = Array.from(textLayerElements).filter(el => {
          const style = window.getComputedStyle(el);
          return style.backgroundColor !== 'rgba(0, 0, 0, 0)' && 
                 style.backgroundColor !== 'transparent' &&
                 style.backgroundColor !== '';
        });
        
        if (selectedElements.length > 0) {
          selectedText = selectedElements.map(el => el.textContent).join(' ').trim();
        }
      }
      
      return selectedText;
    }
    
    // Function to send selected text to parent window
    function sendSelectedText() {
      const selectedText = getSelectedText();
      if (selectedText && selectedText.length > 0) {
        try {
          window.parent.postMessage({
            type: 'TEXT_SELECTION',
            text: selectedText,
            timestamp: Date.now()
          }, '*');
        } catch (err) {
          console.error('Error sending text selection:', err);
        }
      }
    }
    
    // Monitor selection changes
    let selectionTimeout;
    function handleSelectionChange() {
      clearTimeout(selectionTimeout);
      selectionTimeout = setTimeout(() => {
        sendSelectedText();
      }, 300); // Debounce selection changes
    }
    
    // Event listeners for text selection
    document.addEventListener('mouseup', handleSelectionChange);
    document.addEventListener('keyup', (e) => {
      // Handle keyboard text selection (Shift+arrows, Ctrl+A, etc.)
      if (e.shiftKey || e.ctrlKey || e.metaKey) {
        handleSelectionChange();
      }
    });
    
    // Monitor selection API directly
    document.addEventListener('selectionchange', handleSelectionChange);
    
    // PDF.js specific events
    document.addEventListener('textlayerrendered', () => {
      console.log('Text layer rendered, selection monitoring active');
    });
    
    // Listen for PDF.js viewer events if available
    if (window.PDFViewerApplication) {
      const eventBus = window.PDFViewerApplication.eventBus;
      if (eventBus) {
        eventBus.on('textlayerrendered', () => {
          console.log('PDF.js text layer rendered');
        });
        
        eventBus.on('pagerendered', () => {
          console.log('PDF.js page rendered');
        });
      }
    }
    
    console.log('Text selection monitoring initialized successfully');
  }
  
  // Listen for initialization message from parent window
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'INIT_TEXT_SELECTION_MONITORING') {
      initializeTextSelectionMonitoring();
    }
  });
  
  // Auto-initialize when PDF.js is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initializeTextSelectionMonitoring, 1000);
    });
  } else {
    setTimeout(initializeTextSelectionMonitoring, 1000);
  }
  
  // Also try to initialize when PDF.js application is ready
  function waitForPDFJS() {
    if (window.PDFViewerApplication && window.PDFViewerApplication.initialized) {
      setTimeout(initializeTextSelectionMonitoring, 500);
    } else {
      setTimeout(waitForPDFJS, 100);
    }
  }
  
  waitForPDFJS();
})(); 