import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { AnalysisReport, AnalyzerOptions, FeatureEvidence, Diagnostic } from './types';
import { TSAnalyzer } from './analyzers/ts-analyzer';
import { TemplateAnalyzer } from './analyzers/template-analyzer';
import { CSSAnalyzer } from './analyzers/css-analyzer';
import { BaselineProvider } from './baseline-provider';
import { FeatureMapper } from './feature-mapper';

export class AngularBaselineAnalyzer {
  private tsAnalyzer: TSAnalyzer;
  private templateAnalyzer: TemplateAnalyzer;
  private cssAnalyzer: CSSAnalyzer;
  private baselineProvider: BaselineProvider;
  private featureMapper: FeatureMapper;

  constructor() {
    this.tsAnalyzer = new TSAnalyzer();
    this.templateAnalyzer = new TemplateAnalyzer();
    this.cssAnalyzer = new CSSAnalyzer();
    this.baselineProvider = new BaselineProvider();
    this.featureMapper = new FeatureMapper(this.baselineProvider);
  }

  async analyze(options: AnalyzerOptions): Promise<AnalysisReport> {
    const files = options.files || await this.findFiles(options.projectRoot);
    const evidence: FeatureEvidence[] = [];

    // Process files concurrently with controlled concurrency
    const maxConcurrency = options.maxConcurrency || require('os').cpus().length;
    const batches = this.chunkArray(files, maxConcurrency);

    for (const batch of batches) {
      const batchPromises = batch.map(file => this.analyzeFile(file, options));
      const batchResults = await Promise.all(batchPromises);
      evidence.push(...batchResults.flat());
    }

    // Map evidence to diagnostics
    const diagnostics = this.featureMapper.mapEvidenceToDiagnostics(evidence, options.config);

    // Generate summary
    const summary = {
      total: diagnostics.length,
      errors: diagnostics.filter(d => d.severity === 'error').length,
      warnings: diagnostics.filter(d => d.severity === 'warn').length,
      infos: diagnostics.filter(d => d.severity === 'info').length
    };

    return {
      summary,
      evidence,
      diagnostics,
      config: options.config
    };
  }

  private async findFiles(projectRoot: string): Promise<string[]> {
    const patterns = [
      'src/**/*.ts',
      'src/**/*.html',
      'src/**/*.css',
      'src/**/*.scss'
    ];

    const allFiles: string[] = [];

    for (const pattern of patterns) {
      try {
        const files = await glob(pattern, {
          cwd: projectRoot,
          absolute: true,
          ignore: [
            '**/node_modules/**',
            '**/dist/**',
            '**/*.spec.ts',
            '**/*.test.ts'
          ]
        });
        allFiles.push(...files);
      } catch (error) {
        console.warn(`Failed to find files with pattern ${pattern}:`, error);
      }
    }

    return [...new Set(allFiles)]; // Remove duplicates
  }

  private async analyzeFile(filePath: string, options: AnalyzerOptions): Promise<FeatureEvidence[]> {
    try {
      // Check file size limit
      if (options.maxFileSize) {
        const stats = await fs.promises.stat(filePath);
        if (stats.size > options.maxFileSize) {
          console.warn(`Skipping large file ${filePath} (${stats.size} bytes)`);
          return [];
        }
      }

      const content = await fs.promises.readFile(filePath, 'utf8');
      const ext = path.extname(filePath).toLowerCase();

      switch (ext) {
        case '.ts':
          return this.tsAnalyzer.analyze(filePath, content);
        case '.html':
          return this.templateAnalyzer.analyze(filePath, content);
        case '.css':
        case '.scss':
          return this.cssAnalyzer.analyze(filePath, content);
        default:
          return [];
      }
    } catch (error) {
      console.warn(`Failed to analyze file ${filePath}:`, error);
      return [];
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // Validation method to check feature registry against web-features
  validateFeatureRegistry(): { valid: string[]; invalid: string[] } {
    const { getAllFeatures } = require('./feature-registry');
    const features = getAllFeatures();
    const featureIds = features.map(f => f.featureId);

    return this.baselineProvider.validateFeatureIds(featureIds);
  }
}