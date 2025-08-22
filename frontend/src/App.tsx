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
  const [sidebarOpen, setSidebarOpen] = useState(true); // 👈 Toggle state

  // Default template
  useEffect(() => {
    if (!currentDocument && !content) {
      setContent(`\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\title{Your Document Title}
\\author{Your Name}
\\date{\\today}
\\begin{document}
\\maketitle
\\section{Introduction}
Write your introduction here.
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
        await apiService.updateDocument(currentDocument.id, { title, content });
        setCurrentDocument({ ...currentDocument, title, content });
      } else {
        const newDoc = await apiService.createDocument({ title, content });
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

    if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
    setAutoSaveTimeout(setTimeout(saveDocument, 2000));
  };

  const handleCompile = async () => {
    setCompiling(true);
    try {
      const result = await apiService.compileDocument(content);
      setCompileResult(result);
    } catch (error) {
      console.error('Compilation failed:', error);
      setCompileResult({ pdf_base64: '', error_log: 'Compilation failed' });
    } finally {
      setCompiling(false);
    }
  };

  const handleFixErrors = async () => {
    if (!compileResult?.error_log) return;
    setFixingErrors(true);
    try {
      const result = await apiService.fixErrors({ content, error_log: compileResult.error_log });
      setContent(result.fixed_content);
      setHasUnsavedChanges(true);
      setTimeout(handleCompile, 500);
    } catch (error) {
      console.error('Failed to fix errors:', error);
    } finally {
      setFixingErrors(false);
    }
  };

  const handleInsertCode = (code: string) => {
    setContent((prev) => prev + '\n\n' + code);
    setHasUnsavedChanges(true);
  };

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      {/* Sidebar with toggle */}
      <div
        className={`transition-all duration-300 border-r border-gray-200 bg-white ${
          sidebarOpen ? 'w-64' : 'w-0'
        } overflow-hidden`}
      >
        <DocumentSidebar
          currentDocument={currentDocument}
          onSelectDocument={handleDocumentSelect}
          onNewDocument={handleNewDocument}
        />
      </div>

      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            {/* Toggle Button 👇 */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
            >
              {sidebarOpen ? '←' : '→'}
            </button>

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
              <span className="text-sm text-orange-600 font-medium">Unsaved changes</span>
            )}
          </div>

          <button
            onClick={saveDocument}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            Save
          </button>
        </header>

        {/* Content area */}
        <div className="flex flex-1 overflow-hidden">
          <ResizablePanes
            left={
              <LaTeXEditor
                content={content}
                onChange={handleContentChange}
                onCompile={handleCompile}
                compiling={compiling}
                hasErrors={!!compileResult?.error_log}
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
