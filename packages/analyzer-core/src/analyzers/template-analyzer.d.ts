import { FeatureEvidence } from '../types';
export declare class TemplateAnalyzer {
    analyze(filePath: string, content: string): FeatureEvidence[];
    private visitNodes;
    private analyzeElement;
    private getElementFeatures;
    private createEvidence;
}
