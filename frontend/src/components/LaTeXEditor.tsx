import React, { useState, useCallback, useRef } from 'react';
import { Play, AlertCircle } from 'lucide-react';

interface LaTeXEditorProps {
  content: string;
  onChange: (content: string) => void;
  onCompile: () => void;
  compiling: boolean;
  hasErrors: boolean;
}

export const LaTeXEditor: React.FC<LaTeXEditorProps> = ({
  content,
  onChange,
  onCompile,
  compiling,
  hasErrors,
}) => {
  const [lineNumbers, setLineNumbers] = useState<number[]>([]);
  const lineRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const updateLineNumbers = useCallback((text: string) => {
    const lines = text.split('\n').length;
    setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1));
  }, []);

  React.useEffect(() => {
    updateLineNumbers(content);
  }, [content, updateLineNumbers]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    onChange(newContent);
    updateLineNumbers(newContent);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newContent =
        content.substring(0, start) + '  ' + content.substring(end);
      onChange(newContent);

      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  // scroll sync
  const handleScroll = () => {
    if (lineRef.current && textRef.current) {
      lineRef.current.scrollTop = textRef.current.scrollTop;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700">LaTeX Editor</h3>
        <div className="flex items-center gap-2">
          {hasErrors && (
            <div className="flex items-center gap-1 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Errors</span>
            </div>
          )}
          <button
            onClick={onCompile}
            disabled={compiling}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              compiling
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {compiling ? (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {compiling ? 'Compiling...' : 'Compile'}
          </button>
        </div>
      </div>

      {/* scrollable editor */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* line numbers */}
        <div
          ref={lineRef}
          className="w-12 bg-gray-100 border-r border-gray-200 text-right overflow-hidden"
        >
          <div className="py-4">
            {lineNumbers.map((num) => (
              <div
                key={num}
                className="px-2 text-xs text-gray-400 leading-6 select-none"
              >
                {num}
              </div>
            ))}
          </div>
        </div>

        {/* textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textRef}
            value={content}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            className="w-full min-h-full p-4 font-mono text-sm border-none outline-none resize-none bg-white"
            placeholder="Start typing your LaTeX document here..."
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
};
