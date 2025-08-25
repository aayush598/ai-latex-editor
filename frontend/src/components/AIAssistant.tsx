import React, { useState } from 'react';
import { 
  Wand2, 
  HelpCircle, 
  Calculator, 
  Table, 
  BarChart3, 
  Palette,
  Book,
  Send,
  Loader2,
  Copy,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Shield,
  Users
} from 'lucide-react';
import { apiService } from '../services/api';

interface AIAssistantProps {
  onInsertCode: (code: string) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ onInsertCode }) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'explain' | 'math' | 'figures' | 'references' | 'accessibility' | 'collaboration'>('generate');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Form states
  const [prompt, setPrompt] = useState('');
  const [codeToExplain, setCodeToExplain] = useState('');
  const [mathExpression, setMathExpression] = useState('');
  const [unitsExpression, setUnitsExpression] = useState('');
  const [lhs, setLhs] = useState('');
  const [rhs, setRhs] = useState('');
  const [csvData, setCsvData] = useState('');
  const [plotData, setPlotData] = useState('');
  const [diagramPrompt, setDiagramPrompt] = useState('');
  const [bibtexId, setBibtexId] = useState('');
  const [figureCode, setFigureCode] = useState('');
  const [colors, setColors] = useState('');
  const [templateCode, setTemplateCode] = useState('');
  const [oldText, setOldText] = useState('');
  const [newText, setNewText] = useState('');

  const clearStates = () => {
    setResult('');
    setError('');
    setCopied(false);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    clearStates();
    
    try {
      const response = await apiService.generateLatex(prompt);
      setResult(response.latex);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate LaTeX');
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async () => {
    if (!codeToExplain.trim()) return;
    
    setLoading(true);
    clearStates();
    
    try {
      const response = await apiService.explainLatex(codeToExplain);
      setResult(response.explanation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to explain LaTeX');
    } finally {
      setLoading(false);
    }
  };

  const handleDeriveEquation = async () => {
    if (!mathExpression.trim()) return;
    
    setLoading(true);
    clearStates();
    
    try {
      const response = await apiService.deriveEquation(mathExpression);
      const resultText = `Steps:\n${response.steps.join('\n')}\n\nFinal Result: ${response.final_result}`;
      setResult(resultText);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to derive equation');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckUnits = async () => {
    if (!unitsExpression.trim()) return;
    
    setLoading(true);
    clearStates();
    
    try {
      const response = await apiService.checkUnits(unitsExpression);
      const resultText = `Units Consistent: ${response.consistent ? 'Yes' : 'No'}\nDetails: ${response.details}`;
      setResult(resultText);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check units');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEquation = async () => {
    if (!lhs.trim() || !rhs.trim()) return;
    
    setLoading(true);
    clearStates();
    
    try {
      const response = await apiService.verifyEquation(lhs, rhs);
      const resultText = `Equivalent: ${response.equivalent ? 'Yes' : 'No'}\nSimplified LHS: ${response.simplified_lhs}\nSimplified RHS: ${response.simplified_rhs}`;
      setResult(resultText);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify equation');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTable = async () => {
    if (!csvData.trim()) return;
    
    setLoading(true);
    clearStates();
    
    try {
      const response = await apiService.generateTable({
        csv: csvData,
        has_header: true,
        use_booktabs: true,
      });
      setResult(response.latex);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate table');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDiagram = async () => {
    if (!diagramPrompt.trim()) return;
    
    setLoading(true);
    clearStates();
    
    try {
      const response = await apiService.generateDiagram({
        prompt: diagramPrompt,
        strict_latex_only: true,
      });
      setResult(response.latex);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate diagram');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchBibtex = async () => {
    if (!bibtexId.trim()) return;
    
    setLoading(true);
    clearStates();
    
    try {
      const response = await apiService.fetchBibtex(bibtexId);
      setResult(response.bibtex);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch BibTeX');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAltText = async () => {
    if (!figureCode.trim()) return;
    
    setLoading(true);
    clearStates();
    
    try {
      const response = await apiService.addAltText(figureCode);
      setResult(response.alt_text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate alt text');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckColor = async () => {
    if (!colors.trim()) return;
    
    setLoading(true);
    clearStates();
    
    try {
      const colorArray = colors.split(',').map(c => c.trim()).filter(c => c);
      const response = await apiService.checkColor(colorArray);
      const resultText = `Color Compliant: ${response.compliant ? 'Yes' : 'No'}\nIssues: ${response.issues.join(', ') || 'None'}`;
      setResult(resultText);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check colors');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckTemplate = async () => {
    if (!templateCode.trim()) return;
    
    setLoading(true);
    clearStates();
    
    try {
      const response = await apiService.checkTemplate(templateCode);
      const resultText = `Template Compliant: ${response.compliant ? 'Yes' : 'No'}\nIssues: ${response.issues.join(', ') || 'None'}`;
      setResult(resultText);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check template');
    } finally {
      setLoading(false);
    }
  };

  const handleGetDiff = async () => {
    if (!oldText.trim() || !newText.trim()) return;
    
    setLoading(true);
    clearStates();
    
    try {
      const response = await apiService.getDiff(oldText, newText);
      setResult(response.diff);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate diff');
    } finally {
      setLoading(false);
    }
  };

  const handleSummarizeChanges = async () => {
    if (!oldText.trim() || !newText.trim()) return;
    
    setLoading(true);
    clearStates();
    
    try {
      const response = await apiService.summarizeChanges(oldText, newText);
      setResult(response.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to summarize changes');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const insertCode = () => {
    onInsertCode(result);
  };

  const tabs = [
    { id: 'generate', label: 'Generate', icon: Wand2 },
    { id: 'explain', label: 'Explain', icon: HelpCircle },
    { id: 'math', label: 'Math', icon: Calculator },
    { id: 'figures', label: 'Figures', icon: BarChart3 },
    { id: 'references', label: 'References', icon: Book },
    { id: 'accessibility', label: 'Accessibility', icon: Shield },
    { id: 'collaboration', label: 'Collaboration', icon: Users },
  ] as const;

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">AI Assistant</h2>
        <div className="flex flex-wrap gap-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id);
                clearStates();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'generate' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe what you want to generate
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., Create a mathematical proof for the Pythagorean theorem..."
                className="w-full h-40 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              Generate LaTeX
            </button>
          </div>
        )}

        {activeTab === 'explain' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LaTeX code to explain
              </label>
              <textarea
                value={codeToExplain}
                onChange={(e) => setCodeToExplain(e.target.value)}
                placeholder="Paste your LaTeX code here..."
                className="w-full h-24 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
            </div>
            <button
              onClick={handleExplain}
              disabled={loading || !codeToExplain.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <HelpCircle className="w-4 h-4" />}
              Explain Code
            </button>
          </div>
        )}

        {activeTab === 'math' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Derive Equation</h3>
              <input
                type="text"
                value={mathExpression}
                onChange={(e) => setMathExpression(e.target.value)}
                placeholder="e.g., x^2 + 2x + 1"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleDeriveEquation}
                disabled={loading || !mathExpression.trim()}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                Derive
              </button>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Check Units</h3>
              <input
                type="text"
                value={unitsExpression}
                onChange={(e) => setUnitsExpression(e.target.value)}
                placeholder="e.g., F = ma (force = mass * acceleration)"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleCheckUnits}
                disabled={loading || !unitsExpression.trim()}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                Check Units
              </button>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Verify Equation</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  value={lhs}
                  onChange={(e) => setLhs(e.target.value)}
                  placeholder="Left-hand side"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={rhs}
                  onChange={(e) => setRhs(e.target.value)}
                  placeholder="Right-hand side"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleVerifyEquation}
                disabled={loading || !lhs.trim() || !rhs.trim()}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Verify
              </button>
            </div>
          </div>
        )}

        {activeTab === 'figures' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Generate Table</h3>
              <textarea
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                placeholder="Name,Age,Score&#10;Alice,25,95&#10;Bob,30,87"
                className="w-full h-20 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
              <button
                onClick={handleGenerateTable}
                disabled={loading || !csvData.trim()}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Table className="w-4 h-4" />}
                Generate Table
              </button>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Generate Diagram</h3>
              <textarea
                value={diagramPrompt}
                onChange={(e) => setDiagramPrompt(e.target.value)}
                placeholder="Describe the diagram you want to create..."
                className="w-full h-20 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleGenerateDiagram}
                disabled={loading || !diagramPrompt.trim()}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Palette className="w-4 h-4" />}
                Generate Diagram
              </button>
            </div>
          </div>
        )}

        {activeTab === 'references' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DOI, arXiv ID, or other identifier
              </label>
              <input
                type="text"
                value={bibtexId}
                onChange={(e) => setBibtexId(e.target.value)}
                placeholder="e.g., 10.1234/example or arXiv:2101.00001"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleFetchBibtex}
                disabled={loading || !bibtexId.trim()}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Book className="w-4 h-4" />}
                Fetch BibTeX
              </button>
            </div>
          </div>
        )}

        {activeTab === 'accessibility' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Generate Alt Text</h3>
              <textarea
                value={figureCode}
                onChange={(e) => setFigureCode(e.target.value)}
                placeholder="Paste your figure LaTeX code here..."
                className="w-full h-20 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
              <button
                onClick={handleAddAltText}
                disabled={loading || !figureCode.trim()}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                Generate Alt Text
              </button>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Check Colors</h3>
              <input
                type="text"
                value={colors}
                onChange={(e) => setColors(e.target.value)}
                placeholder="e.g., #FF0000, #00FF00, #0000FF"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleCheckColor}
                disabled={loading || !colors.trim()}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Palette className="w-4 h-4" />}
                Check Colors
              </button>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Check Template Compliance</h3>
              <textarea
                value={templateCode}
                onChange={(e) => setTemplateCode(e.target.value)}
                placeholder="Paste your LaTeX document here..."
                className="w-full h-20 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
              <button
                onClick={handleCheckTemplate}
                disabled={loading || !templateCode.trim()}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Check Template
              </button>
            </div>
          </div>
        )}

        {activeTab === 'collaboration' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Generate Diff</h3>
              <textarea
                value={oldText}
                onChange={(e) => setOldText(e.target.value)}
                placeholder="Original text..."
                className="w-full h-16 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm mb-2"
              />
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Modified text..."
                className="w-full h-16 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleGetDiff}
                  disabled={loading || !oldText.trim() || !newText.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                  Get Diff
                </button>
                <button
                  onClick={handleSummarizeChanges}
                  disabled={loading || !oldText.trim() || !newText.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                  Summarize
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Error</span>
            </div>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Result</span>
            </div>
            
            <div className="relative">
              <pre className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm whitespace-pre-wrap max-h-64 overflow-auto">
                {result}
              </pre>
              
              <div className="flex gap-2 mt-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                
                {activeTab !== 'explain' && (
                  <button
                    onClick={insertCode}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Insert
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};