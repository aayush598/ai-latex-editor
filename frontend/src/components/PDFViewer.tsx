import React, { useState, useEffect } from 'react';
import { Download, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';

interface PDFViewerProps {
  pdfBase64: string | null;
  errorLog: string;
  loading: boolean;
  onFixErrors?: () => void;
  fixingErrors?: boolean;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfBase64,
  errorLog,
  loading,
  onFixErrors,
  fixingErrors,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (pdfBase64) {
      // Convert base64 to blob URL for display
      const byteCharacters = atob(pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPdfUrl(null);
    }
  }, [pdfBase64]);

  const downloadPDF = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'document.pdf';
      link.click();
    }
  };

  const hasErrors = errorLog && errorLog.trim() !== '';

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700">PDF Preview</h3>
        {pdfUrl && (
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        )}
      </div>

      <div className="flex-1 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Compiling document...</p>
            </div>
          </div>
        ) : hasErrors ? (
          <div className="p-4 h-full overflow-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h4 className="font-medium text-red-800">Compilation Error</h4>
              </div>
              <p className="text-sm text-red-700 mb-3">
                Your LaTeX document has compilation errors. Would you like AI to help fix them?
              </p>
              {onFixErrors && (
                <button
                  onClick={onFixErrors}
                  disabled={fixingErrors}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    fixingErrors
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {fixingErrors ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {fixingErrors ? 'Fixing...' : 'Fix Errors with AI'}
                </button>
              )}
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-800 mb-2">Error Details:</h5>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-auto max-h-64">
                {errorLog}
              </pre>
            </div>
          </div>
        ) : pdfUrl ? (
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            title="PDF Preview"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Download className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm">Compile your LaTeX document to see the PDF preview</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};