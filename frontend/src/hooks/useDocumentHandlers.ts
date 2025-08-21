import { useState, useCallback } from 'react';
import { apiService } from '../services/api';
import type { Document, CompileResponse } from '../types/api';
import { NEW_DOCUMENT_TEMPLATE } from '../constants/newDocumentTemplate';

export function useDocumentHandlers() {
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Untitled Document');
  const [compileResult, setCompileResult] = useState<CompileResponse | null>(null);
  const [compiling, setCompiling] = useState(false);
  const [fixingErrors, setFixingErrors] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
    setContent(NEW_DOCUMENT_TEMPLATE);
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
    const timeout = setTimeout(() => saveDocument(), 2000);
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
      const result = await apiService.fixErrors({ content, error_log: compileResult.error_log });
      setContent(result.fixed_content);
      setHasUnsavedChanges(true);
      setTimeout(() => handleCompile(), 500);
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
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + code.length;
      }, 0);
    } else {
      setContent(prev => prev + '\n\n' + code);
      setHasUnsavedChanges(true);
    }
  };

  return {
    state: {
      currentDocument,
      content,
      title,
      compileResult,
      compiling,
      fixingErrors,
      hasUnsavedChanges,
    },
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
  };
}
