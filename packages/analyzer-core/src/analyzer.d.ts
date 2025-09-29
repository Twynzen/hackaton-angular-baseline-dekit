import { AnalysisReport, AnalyzerOptions } from './types';
export declare class AngularBaselineAnalyzer {
    private tsAnalyzer;
    private templateAnalyzer;
    private cssAnalyzer;
    private baselineProvider;
    private featureMapper;
    constructor();
    analyze(options: AnalyzerOptions): Promise<AnalysisReport>;
    private findFiles;
    private analyzeFile;
    private chunkArray;
    validateFeatureRegistry(): {
        valid: string[];
        invalid: string[];
    };
}
