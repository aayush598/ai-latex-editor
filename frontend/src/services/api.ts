// frontend/src/services/api.ts
const API_BASE = 'https://ai-latex-editor.onrender.com';

class ApiService {
  private getToken(): string | null {
    // token is the supabase_uid stored in localStorage
    return localStorage.getItem('supabase_uid');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;

    // default headers
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // include auth header if token present
    const token = this.getToken();
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    // merge headers (options.headers may be undefined)
    const mergedHeaders = {
      ...defaultHeaders,
      ...(options.headers as Record<string, string> | undefined),
    };

    const config: RequestInit = {
      mode: 'cors',
      headers: mergedHeaders,
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // If unauthorized, clear stored session and redirect to login
      if (response.status === 401) {
        // remove stored uid
        localStorage.removeItem('supabase_uid');
        // redirect to frontend root so Login component shows
        try { window.location.href = '/'; } catch (e) {}
        throw new Error('Unauthorized — session cleared. Please sign in again.');
      }

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = Array.isArray(errorData.detail)
              ? errorData.detail.map((e: any) => (e.msg ? e.msg : JSON.stringify(e))).join(', ')
              : errorData.detail;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // If we can't parse response JSON, keep generic message
        }
        throw new Error(errorMessage);
      }

      // Some endpoints return empty bodies (DELETE). Try to parse JSON safely
      const text = await response.text();
      return text ? JSON.parse(text) : ({} as T);
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Health check
  async health(): Promise<string> {
    return this.request<string>('/health');
  }

  // Document operations
  async getDocuments(): Promise<import('../types/api').Document[]> {
    return this.request<import('../types/api').Document[]>('/documents/');
  }

  async getDocument(id: number): Promise<import('../types/api').Document> {
    return this.request<import('../types/api').Document>(`/documents/${id}`);
  }

  async createDocument(data: import('../types/api').DocumentInput): Promise<import('../types/api').Document> {
    return this.request<import('../types/api').Document>('/documents/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDocument(id: number, data: import('../types/api').DocumentInput): Promise<import('../types/api').Document> {
    return this.request<import('../types/api').Document>(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDocument(id: number): Promise<string> {
    return this.request<string>(`/documents/${id}`, {
      method: 'DELETE',
    });
  }

  // Compilation
  async compileDocument(
    content: string
  ): Promise<import('../types/api').CompileResponse> {
    const result = await this.request<import('../types/api').CompileResponse>(
      '/compile/',
      {
        method: 'POST',
        body: JSON.stringify({ content }),
      }
    );

    // Log similar to index.ts
    console.log("✅ API Response:");
    console.log("PDF Base64:", result.pdf_base64?.slice(0, 100) + "...");
    console.log("Error Log:", result.error_log || "No errors");

    return result;
  }

  async fixErrors(data: import('../types/api').FixErrorsRequest): Promise<import('../types/api').FixErrorsResponse> {
    return this.request<import('../types/api').FixErrorsResponse>('/compile/fix-errors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // AI features
  async generateLatex(prompt: string): Promise<import('../types/api').AIGenerateResponse> {
    return this.request<import('../types/api').AIGenerateResponse>('/ai/generate-latex', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  }

  async explainLatex(code: string): Promise<import('../types/api').AIExplainResponse> {
    return this.request<import('../types/api').AIExplainResponse>('/ai/explain-latex', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  // References
  async fetchBibtex(identifier: string): Promise<import('../types/api').BibtexResponse> {
    return this.request<import('../types/api').BibtexResponse>('/references/fetch-bibtex', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    });
  }

  async checkBibtex(bibtex: string): Promise<import('../types/api').CheckBibtexResponse> {
    return this.request<import('../types/api').CheckBibtexResponse>('/references/check-bibtex', {
      method: 'POST',
      body: JSON.stringify({ bibtex }),
    });
  }

  // Math intelligence
  async verifyEquation(lhs: string, rhs: string): Promise<import('../types/api').VerifyEquationResponse> {
    return this.request<import('../types/api').VerifyEquationResponse>('/math/verify-equation', {
      method: 'POST',
      body: JSON.stringify({ lhs, rhs }),
    });
  }

  async deriveEquation(expression: string): Promise<import('../types/api').DeriveEquationResponse> {
    return this.request<import('../types/api').DeriveEquationResponse>('/math/derive-equation', {
      method: 'POST',
      body: JSON.stringify({ expression }),
    });
  }

  async checkUnits(expression: string): Promise<{ consistent: boolean; details: string }> {
    return this.request<{ consistent: boolean; details: string }>('/math/check-units', {
      method: 'POST',
      body: JSON.stringify({ expression }),
    });
  }
  // Figures and tables
  async generateTable(data: import('../types/api').GenerateTableRequest): Promise<import('../types/api').LatexResponse> {
    return this.request<import('../types/api').LatexResponse>('/figures/generate-table', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generatePlot(data: import('../types/api').GeneratePlotRequest): Promise<import('../types/api').LatexResponse> {
    return this.request<import('../types/api').LatexResponse>('/figures/generate-plot', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateDiagram(data: import('../types/api').GenerateDiagramRequest): Promise<import('../types/api').LatexResponse> {
    return this.request<import('../types/api').LatexResponse>('/figures/generate-diagram', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Accessibility
  async addAltText(figureCode: string, context?: string, maxLength?: number): Promise<{ alt_text: string }> {
    return this.request<{ alt_text: string }>('/accessibility/add-alt-text', {
      method: 'POST',
      body: JSON.stringify({ 
        figure_code: figureCode, 
        context: context || '',
        max_length: maxLength || 200
      }),
    });
  }

  async checkColor(colors: string[], paletteType?: string): Promise<{ compliant: boolean; issues: string[] }> {
    return this.request<{ compliant: boolean; issues: string[] }>('/accessibility/check-color', {
      method: 'POST',
      body: JSON.stringify({ 
        colors,
        palette_type: paletteType || 'all'
      }),
    });
  }

  async checkTemplate(latexCode: string, template?: string): Promise<{ compliant: boolean; issues: string[] }> {
    return this.request<{ compliant: boolean; issues: string[] }>('/accessibility/check-template', {
      method: 'POST',
      body: JSON.stringify({ 
        latex_code: latexCode,
        template: template || 'ieee'
      }),
    });
  }

  // Collaboration
  async getDiff(oldText: string, newText: string): Promise<{ diff: string }> {
    return this.request<{ diff: string }>('/collaboration/diff', {
      method: 'POST',
      body: JSON.stringify({ old_text: oldText, new_text: newText }),
    });
  }

  async mergeVersions(baseText: string, versionA: string, versionB: string, strategy?: string): Promise<{ merged_text: string; conflicts: any[] }> {
    return this.request<{ merged_text: string; conflicts: any[] }>('/collaboration/merge', {
      method: 'POST',
      body: JSON.stringify({ 
        base_text: baseText,
        version_a: versionA,
        version_b: versionB,
        strategy: strategy || 'ai'
      }),
    });
  }

  async summarizeChanges(oldText: string, newText: string): Promise<{ summary: string }> {
    return this.request<{ summary: string }>('/collaboration/summarize-changes', {
      method: 'POST',
      body: JSON.stringify({ old_text: oldText, new_text: newText }),
    });
  }
  // Comments
  async addComment(data: import('../types/api').CommentRequest): Promise<import('../types/api').CommentResponse> {
    return this.request<import('../types/api').CommentResponse>('/collaboration/comment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getComments(documentId: number): Promise<string> {
    return this.request<string>(`/collaboration/comments/${documentId}`);
  }

  async deleteComment(commentId: number): Promise<string> {
    return this.request<string>(`/collaboration/comment/${commentId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();