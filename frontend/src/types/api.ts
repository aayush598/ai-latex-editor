export interface Document {
  id: number;
  title: string;
  content: string;
}

export interface DocumentInput {
  title: string;
  content: string;
}

export interface CompileResponse {
  pdf_base64: string;
  error_log: string;
}

export interface AIGenerateRequest {
  prompt: string;
}

export interface AIGenerateResponse {
  latex: string;
}

export interface AIExplainRequest {
  code: string;
}

export interface AIExplainResponse {
  explanation: string;
}

export interface FixErrorsRequest {
  content: string;
  error_log: string;
}

export interface FixErrorsResponse {
  fixed_content: string;
  explanation: string;
}

export interface BibtexRequest {
  identifier: string;
}

export interface BibtexResponse {
  bibtex: string;
}

export interface CheckBibtexRequest {
  bibtex: string;
}

export interface CheckBibtexResponse {
  cleaned_bibtex: string;
  changes: string;
}

export interface VerifyEquationRequest {
  lhs: string;
  rhs: string;
}

export interface VerifyEquationResponse {
  equivalent: boolean;
  simplified_lhs: string;
  simplified_rhs: string;
}

export interface DeriveEquationRequest {
  expression: string;
}

export interface DeriveEquationResponse {
  steps: string[];
  final_result: string;
}

export interface GenerateTableRequest {
  csv: string;
  delimiter?: string;
  has_header?: boolean;
  align?: string;
  use_booktabs?: boolean;
  max_col_width?: number;
  caption?: string;
  label?: string;
  table_env?: string;
}

export interface GeneratePlotRequest {
  mode: 'data' | 'function';
  title?: string;
  xlabel?: string;
  ylabel?: string;
  width?: string;
  height?: string;
  grid?: boolean;
  legend?: string[];
  series?: number[][][];
  expressions?: string[];
  domain?: number[];
  samples?: number;
}

export interface GenerateDiagramRequest {
  prompt: string;
  style_hints?: string;
  tikz_libs?: string[];
  strict_latex_only?: boolean;
}

export interface LatexResponse {
  latex: string;
}

export interface Comment {
  id: number;
  document_id: number;
  line_number: number;
  comment: string;
}

export interface CommentRequest {
  document_id: number;
  line_number: number;
  comment: string;
}

export interface CommentResponse {
  status: string;
  comment_id: number;
}