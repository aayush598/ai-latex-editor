import { useEffect } from 'react';
import { apiService } from '../services/api';
import type { Document, CompileResponse } from '../types/api';

interface KeyboardShortcutsProps {
  currentDocument: Document | null;
  title: string;
  content: string;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  setCurrentDocument: (doc: Document | null) => void;
  setCompileResult: (res: CompileResponse | null) => void;
  setHasUnsavedChanges: (val: boolean) => void;
  saveDocument: () => void;
  handleCompile: () => void;
  handleNewDocument: () => void;
}

export function useKeyboardShortcuts({
  currentDocument,
  title,
  setTitle,
  setContent,
  setCurrentDocument,
  setCompileResult,
  setHasUnsavedChanges,
  saveDocument,
  handleCompile,
  handleNewDocument,
}: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      // Save (Ctrl/Cmd + S)
      if (ctrlOrCmd && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveDocument();
      }

      // Compile (Ctrl/Cmd + Enter)
      if (ctrlOrCmd && e.key === 'Enter') {
        e.preventDefault();
        handleCompile();
      }

      // New file (Ctrl/Cmd + Shift + N)
      if (ctrlOrCmd && e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewDocument();
      }

      // Rename (F2)
      if (e.key === 'F2') {
        e.preventDefault();
        const newTitle = prompt('Enter new file name:', title);
        if (newTitle) {
          setTitle(newTitle);
          setHasUnsavedChanges(true);
        }
      }

      // Delete (Ctrl/Cmd + Delete)
      if (ctrlOrCmd && e.key === 'Delete') {
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

    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentDocument,
    title,
    saveDocument,
    handleCompile,
    handleNewDocument,
    setTitle,
    setContent,
    setCurrentDocument,
    setCompileResult,
    setHasUnsavedChanges,
  ]);
}
