# PDF.js React Integration

This project demonstrates how to integrate PDF.js viewer into a React application using an iframe approach.

## Overview

PDF.js requires a web server to function properly due to browser security restrictions (CORS, service workers, etc.). This implementation:

1. **Serves PDF.js files from a web server** - The `web/` directory contains the complete PDF.js viewer
2. **Embeds PDF.js in an iframe** - React component that safely embeds the viewer
3. **Handles PDF loading and parameters** - Flexible configuration for different PDF sources

## Project Structure

```
├── src/
│   ├── PDFViewer.tsx          # Main PDF viewer React component
│   ├── App.tsx                # Demo application using PDFViewer
│   └── ...
├── public/
│   └── web/                   # PDF.js viewer files (copied from root web/)
│       ├── viewer.html        # Main PDF.js viewer
│       ├── viewer.css         # PDF.js styles
│       ├── viewer.mjs         # PDF.js JavaScript
│       └── ...
├── web/                       # Original PDF.js distribution
└── ...
```

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   ```
   http://localhost:5173
   ```

The PDF viewer should load automatically with a default PDF file.

## Usage

### Basic Usage

```tsx
import PDFViewer from './PDFViewer'

function App() {
  return (
    <PDFViewer 
      pdfUrl="/path/to/your/document.pdf"
      height="600px"
    />
  )
}
```

### Advanced Usage

```tsx
import PDFViewer from './PDFViewer'

function App() {
  return (
    <PDFViewer 
      pdfUrl="/path/to/your/document.pdf"
      viewerUrl="/web/viewer.html"  // Custom viewer location
      width="100%"
      height="80vh"
      viewerParams={{
        locale: 'en-US',
        disableTextLayer: 'false',
        disableAnnotations: 'false'
      }}
    />
  )
}
```

## Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pdfUrl` | `string` | `undefined` | URL of the PDF file to display |
| `viewerUrl` | `string` | `/web/viewer.html` | Base URL where PDF.js viewer is served |
| `width` | `string` | `100%` | Width of the iframe |
| `height` | `string` | `600px` | Height of the iframe |
| `viewerParams` | `Record<string, string>` | `{}` | Additional parameters for PDF.js viewer |

## PDF.js Viewer Parameters

You can pass additional parameters to customize the PDF.js viewer behavior:

```tsx
viewerParams={{
  // UI customization
  locale: 'en-US',
  disableTextLayer: 'false',
  disableAnnotations: 'false',
  
  // Viewer behavior
  page: '1',                    // Start page
  zoom: 'auto',                 // Zoom level
  pagemode: 'none',             // Page mode
  
  // Performance
  disableWorker: 'false',
  disableAutoFetch: 'false',
  disableStream: 'false'
}}
```

## Loading Different PDF Sources

### Local Files (Static)
```tsx
<PDFViewer pdfUrl="/public/documents/sample.pdf" />
```

### Remote Files
```tsx
<PDFViewer pdfUrl="https://example.com/document.pdf" />
```

### File Upload
```tsx
const [pdfUrl, setPdfUrl] = useState('')

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file && file.type === 'application/pdf') {
    const url = URL.createObjectURL(file)
    setPdfUrl(url)
  }
}

return (
  <>
    <input type="file" accept=".pdf" onChange={handleFileUpload} />
    <PDFViewer pdfUrl={pdfUrl} />
  </>
)
```

## Features

- ✅ **Full PDF.js functionality** - All PDF.js features available
- ✅ **Responsive design** - Adapts to container size
- ✅ **Error handling** - Graceful error states
- ✅ **Loading states** - Shows loading indicator
- ✅ **File upload support** - Handle local file uploads
- ✅ **Configurable parameters** - Customize viewer behavior
- ✅ **TypeScript support** - Full type safety

## Troubleshooting

### PDF viewer shows "Loading" forever
- Ensure the server is running (`npm run dev`)
- Check browser console for CORS errors
- Verify the PDF file exists and is accessible

### "Failed to load PDF viewer" error
- Make sure PDF.js files are properly served
- Check that `/web/viewer.html` is accessible
- Verify Vite configuration is correct

### PDF file doesn't load
- Check the PDF file URL is correct
- Ensure the PDF file is accessible from the server
- For remote files, check CORS headers

### CORS Issues
The project is configured with appropriate headers in `vite.config.ts`:
```ts
server: {
  headers: {
    'Cross-Origin-Embedder-Policy': 'credentialless',
    'Cross-Origin-Opener-Policy': 'same-origin'
  }
}
```

## Browser Compatibility

PDF.js supports:
- Chrome 109+
- Firefox 115+
- Safari 15.4+
- Edge 109+

## Security Considerations

The iframe uses these sandbox attributes for security:
- `allow-scripts` - Required for PDF.js functionality
- `allow-same-origin` - Required for local file access
- `allow-downloads` - Enables PDF download functionality
- `allow-forms` - Enables form interactions

## Performance Tips

1. **Use appropriate zoom levels** - Auto zoom works best for responsive design
2. **Disable unnecessary features** - Use viewerParams to disable unused features
3. **Optimize PDF files** - Smaller PDFs load faster
4. **Consider lazy loading** - Load PDF viewers only when needed

## Advanced Configuration

### Custom PDF.js Build
To use a custom PDF.js build:
1. Replace files in `public/web/` with your custom build
2. Update `viewerUrl` prop if needed
3. Restart the development server

### Multiple Viewers
You can have multiple PDF viewers on the same page:
```tsx
<PDFViewer pdfUrl="/doc1.pdf" height="400px" />
<PDFViewer pdfUrl="/doc2.pdf" height="400px" />
```

### Integration with State Management
```tsx
// With Redux/Zustand/etc.
const { currentPdf } = useAppSelector(state => state.documents)

return <PDFViewer pdfUrl={currentPdf?.url} />
```

## License

This project uses PDF.js which is licensed under Apache License 2.0. 