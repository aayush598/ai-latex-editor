import React, { useEffect } from 'react';
import { DocumentSidebar } from './components/DocumentSidebar';
import { LaTeXEditor } from './components/LaTeXEditor';
import { PDFViewer } from './components/PDFViewer';
import { AIAssistant } from './components/AIAssistant';
import { ResizablePanes } from './components/ResizablePanes';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useDocumentHandlers } from './hooks/useDocumentHandlers';
import { DEFAULT_APP_TEMPLATE } from './constants/newDocumentTemplate';

function App() {
  const {
    state: { currentDocument, content, title, compileResult, compiling, fixingErrors, hasUnsavedChanges },
    setters: { setTitle, setContent, setCurrentDocument, setCompileResult, setHasUnsavedChanges },
    handlers: {
      handleDocumentSelect,
      handleNewDocument,
      saveDocument,
      handleContentChange,
      handleCompile,
      handleFixErrors,
      handleInsertCode,
    },
  } = useDocumentHandlers();

  // Inject default template if no doc
  useEffect(() => {
    if (!currentDocument && !content) {
      setContent(DEFAULT_APP_TEMPLATE);
    }
  }, [currentDocument, content, setContent]);

  // keyboard shortcuts
  useKeyboardShortcuts({
    currentDocument,
    title,
    content,
    setTitle,
    setContent,
    setCurrentDocument,
    setCompileResult,
    setHasUnsavedChanges,
    saveDocument,
    handleCompile,
    handleNewDocument,
  });

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