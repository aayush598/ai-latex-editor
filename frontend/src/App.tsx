import React, { useState, useCallback, useEffect } from 'react';
import { DocumentSidebar } from './components/DocumentSidebar';
import { LaTeXEditor } from './components/LaTeXEditor';
import { PDFViewer } from './components/PDFViewer';
import { AIAssistant } from './components/AIAssistant';
import { ResizablePanes } from './components/ResizablePanes';
import { apiService } from './services/api';
import type { Document, CompileResponse } from './types/api';

function App() {
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Untitled Document');
  const [compileResult, setCompileResult] = useState<CompileResponse | null>(null);
  const [compiling, setCompiling] = useState(false);
  const [fixingErrors, setFixingErrors] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      if (!ctrlOrCmd) return;

      // Save (Ctrl+S / Cmd+S)
      if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveDocument();
      }

      // Compile (Ctrl+Enter / Cmd+Enter)
      if (e.key === 'Enter') {
        e.preventDefault();
        handleCompile();
      }

      // New file (Ctrl+N / Cmd+N)
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewDocument();
      }

      // Rename file (Ctrl+R / Cmd+R)
      if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        const newTitle = prompt('Enter new file name:', title);
        if (newTitle) {
          setTitle(newTitle);
          setHasUnsavedChanges(true);
        }
      }

      // Delete file (Ctrl+Shift+D / Cmd+Shift+D)
      if (e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (currentDocument && confirm(`Delete "${title}"? This cannot be undone.`)) {
          apiService.deleteDocument(currentDocument.id).then(() => {
            setCurrentDocument(null);
            setContent('');
            setTitle('Untitled Document');
            setCompileResult(null);
          });
        }
      }

      // Search file (Ctrl+F / Cmd+F)
      if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        const query = prompt('Search for file name:');
        if (query) {
          // A placeholder: you'd hook this into your sidebar search logic
          console.log('Searching for file:', query);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentDocument, title, content]);



  // Initialize with default LaTeX template
  useEffect(() => {
    if (!currentDocument && !content) {
      setContent(`\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}

\\title{Your Document Title}
\\author{Your Name}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Introduction}

Write your introduction here.

\\section{Main Content}

Your main content goes here. You can use mathematical formulas like $E = mc^2$ inline, or display equations:

\\begin{equation}
    \\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
\\end{equation}

\\section{Conclusion}

Conclude your document here.

\\end{document}`);
    }
  }, [currentDocument, content]);

  const handleDocumentSelect = async (doc: Document) => {
    setCurrentDocument(doc);
    setContent(doc.content);
    setTitle(doc.title);
    setHasUnsavedChanges(false);
    setCompileResult(null);
  };

  const handleNewDocument = () => {
    setCurrentDocument(null);
    setTitle('Untitled Document');
    setContent(`\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}

\\title{New Document}
\\author{Your Name}
\\date{\\today}

\\begin{document}
\\maketitle

\\section{Introduction}
Start writing your document here...

\\end{document}`);
    setHasUnsavedChanges(false);
    setCompileResult(null);
  };

  const saveDocument = useCallback(async () => {
    try {
      if (currentDocument) {
        await apiService.updateDocument(currentDocument.id, {
          title,
          content,
        });
        setCurrentDocument({ ...currentDocument, title, content });
      } else {
        const newDoc = await apiService.createDocument({
          title,
          content,
        });
        setCurrentDocument(newDoc);
      }
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save document:', error);
    }
  }, [currentDocument, title, content]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(true);

    // Auto-save after 2 seconds of inactivity
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    const timeout = setTimeout(() => {
      saveDocument();
    }, 2000);
    
    setAutoSaveTimeout(timeout);
  };

  const handleCompile = async () => {
    setCompiling(true);
    
    try {
      const result = await apiService.compileDocument(content);
      setCompileResult(result);
    } catch (error) {
      console.error('Compilation failed:', error);
      setCompileResult({
        pdf_base64: '',
        error_log: error instanceof Error ? error.message : 'Compilation failed',
      });
    } finally {
      setCompiling(false);
    }
  };

  const handleFixErrors = async () => {
    if (!compileResult?.error_log) return;

    setFixingErrors(true);
    
    try {
      const result = await apiService.fixErrors({
        content,
        error_log: compileResult.error_log,
      });
      
      setContent(result.fixed_content);
      setHasUnsavedChanges(true);
      
      // Auto-compile after fixing errors
      setTimeout(() => {
        handleCompile();
      }, 500);
    } catch (error) {
      console.error('Failed to fix errors:', error);
    } finally {
      setFixingErrors(false);
    }
  };

  const handleInsertCode = (code: string) => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + code + content.substring(end);
      setContent(newContent);
      setHasUnsavedChanges(true);
      
      // Focus back to textarea and set cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + code.length;
      }, 0);
    } else {
      // Fallback: append to end
      setContent(prev => prev + '\n\n' + code);
      setHasUnsavedChanges(true);
    }
  };

  return (
 <div className="h-screen bg-gray-100 flex overflow-hidden">
  <DocumentSidebar
    currentDocument={currentDocument}
    onSelectDocument={handleDocumentSelect}
    onNewDocument={handleNewDocument}
  />
  
  <div className="flex flex-col flex-1">
    {/* Header fixed height */}
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-gray-900">AI LaTeX Editor</h1>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setHasUnsavedChanges(true);
          }}
          className="text-lg font-medium text-gray-700 bg-transparent border-none outline-none hover:bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 transition-colors"
        />
        {hasUnsavedChanges && (
          <span className="text-sm text-orange-600 font-medium">
            Unsaved changes
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        <button
          onClick={saveDocument}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        >
          Save
        </button>
      </div>
    </header>

    {/* Content area fills rest of screen */}
    <div className="flex flex-1 overflow-hidden">
      <ResizablePanes
        left={
          <LaTeXEditor
            content={content}
            onChange={handleContentChange}
            onCompile={handleCompile}
            compiling={compiling}
            hasErrors={!!(compileResult?.error_log && compileResult.error_log.trim())}
          />
        }
        right={
          <ResizablePanes
            defaultLeftWidth={65}
            left={
              <PDFViewer
                pdfBase64={compileResult?.pdf_base64 || null}
                errorLog={compileResult?.error_log || ''}
                loading={compiling}
                onFixErrors={handleFixErrors}
                fixingErrors={fixingErrors}
              />
            }
            right={<AIAssistant onInsertCode={handleInsertCode} />}
          />
        }
      />
    </div>
  </div>
</div>

  );
}

export default App;