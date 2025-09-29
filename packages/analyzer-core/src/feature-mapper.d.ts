import { FeatureEvidence, Diagnostic, BaselineConfig } from './types';
import { BaselineProvider } from './baseline-provider';
export declare class FeatureMapper {
    private baselineProvider;
    constructor(baselineProvider: BaselineProvider);
    mapEvidenceToDiagnostics(evidence: FeatureEvidence[], config: BaselineConfig): Diagnostic[];
    private getSeverity;
    private createMessage;
    private getSuggestions;
}
