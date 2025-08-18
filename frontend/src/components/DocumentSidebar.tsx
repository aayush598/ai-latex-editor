import React, { useState, useEffect } from 'react';
import { File, Plus, Search, Trash2, Edit3, Loader2 } from 'lucide-react';
import { apiService } from '../services/api';
import type { Document } from '../types/api';

interface DocumentSidebarProps {
  currentDocument: Document | null;
  onSelectDocument: (document: Document) => void;
  onNewDocument: () => void;
}

export const DocumentSidebar: React.FC<DocumentSidebarProps> = ({
  currentDocument,
  onSelectDocument,
  onNewDocument,
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTitle, setEditingTitle] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const docs = await apiService.getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (docId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await apiService.deleteDocument(docId);
      setDocuments(docs => docs.filter(doc => doc.id !== docId));
      if (currentDocument?.id === docId) {
        onNewDocument();
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const handleRenameDocument = async (docId: number, title: string) => {
    try {
      const doc = documents.find(d => d.id === docId);
      if (!doc) return;

      const updated = await apiService.updateDocument(docId, {
        title,
        content: doc.content,
      });
      
      setDocuments(docs => docs.map(d => d.id === docId ? updated : d));
      setEditingTitle(null);
    } catch (error) {
      console.error('Failed to rename document:', error);
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="w-80 bg-gray-50 border-r border-gray-200 p-4 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
          <button
            onClick={onNewDocument}
            className="ml-auto p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredDocuments.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? 'No documents found' : 'No documents yet'}
          </div>
        ) : (
          <div className="p-2">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  currentDocument?.id === doc.id
                    ? 'bg-blue-100 text-blue-900'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => onSelectDocument(doc)}
              >
                <File className="w-4 h-4 flex-shrink-0 text-gray-400" />
                
                {editingTitle === doc.id ? (
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onBlur={() => handleRenameDocument(doc.id, newTitle)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRenameDocument(doc.id, newTitle);
                      } else if (e.key === 'Escape') {
                        setEditingTitle(null);
                      }
                    }}
                    className="flex-1 bg-white border border-blue-300 rounded px-2 py-1 text-sm"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="flex-1 text-sm font-medium truncate">
                    {doc.title}
                  </span>
                )}

                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTitle(doc.id);
                      setNewTitle(doc.title);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600 rounded"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteDocument(doc.id, e)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};