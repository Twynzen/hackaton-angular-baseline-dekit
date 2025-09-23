export type BaselineStatus = 'widely' | 'newly' | 'limited' | 'unknown';

export interface FeatureEvidence {
  file: string;
  lang: 'ts' | 'html' | 'css';
  range: {
    start: { line: number; col: number };
    end: { line: number; col: number };
  };
  code: string;
  featureId: string;
  meta?: Record<string, any>;
}

export interface Diagnostic {
  severity: 'error' | 'warn' | 'info';
  message: string;
  featureId: string;
  baseline: BaselineStatus;
  file: string;
  range: FeatureEvidence['range'];
  suggestions?: Array<{
    title: string;
    code?: string;
    note?: string;
  }>;
}

export interface BaselineConfig {
  target: 'widely' | 'newly' | number;
  strict?: boolean;
  allow?: string[];
}

export interface AnalysisReport {
  summary: {
    total: number;
    errors: number;
    warnings: number;
    infos: number;
  };
  evidence: FeatureEvidence[];
  diagnostics: Diagnostic[];
  config: BaselineConfig;
}

export interface AnalyzerOptions {
  config: BaselineConfig;
  projectRoot: string;
  files?: string[];
  maxConcurrency?: number;
  maxFileSize?: number;
}