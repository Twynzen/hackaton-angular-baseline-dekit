import { FeatureEvidence } from '../types';
export declare class CSSAnalyzer {
    analyze(filePath: string, content: string): FeatureEvidence[];
    private analyzeNode;
    private analyzeSelector;
    private analyzeDeclaration;
    private analyzeAtRule;
    private analyzeWithPostCSS;
    private createEvidence;
    private getPositionFromNode;
    private getPositionFromPostCSS;
}
