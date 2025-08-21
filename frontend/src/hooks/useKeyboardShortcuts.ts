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
  content,
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
      if (!ctrlOrCmd) return;

      // Save
      if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveDocument();
      }

      // Compile
      if (e.key === 'Enter') {
        e.preventDefault();
        handleCompile();
      }

      // New file
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewDocument();
      }

      // Rename
      if (e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        const newTitle = prompt('Enter new file name:', title);
        if (newTitle) {
          setTitle(newTitle);
          setHasUnsavedChanges(true);
        }
      }

      // Delete
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

      // Search
      if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        const query = prompt('Search for file name:');
        if (query) console.log('Searching for file:', query);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentDocument,
    title,
    content,
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
