import { FeatureEvidence } from '../types';
export declare class TSAnalyzer {
    private project;
    constructor();
    analyze(filePath: string, content: string): FeatureEvidence[];
    private getFullPropertyAccess;
    private analyzeInlineComponents;
    private createEvidence;
}
