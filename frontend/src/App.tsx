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
      
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
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

        <div className="flex-1 flex">
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
                right={
                  <AIAssistant onInsertCode={handleInsertCode} />
                }
              />
            }
          />
        </div>
      </div>
    </div>
  );
}

export default App;