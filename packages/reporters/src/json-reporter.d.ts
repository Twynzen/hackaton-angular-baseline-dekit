import { AnalysisReport } from '@angular-baseline-devkit/analyzer-core';
export interface ReporterOptions {
    outputPath: string;
    projectRoot?: string;
}
export declare class JsonReporter {
    generateReport(report: AnalysisReport, options: ReporterOptions): Promise<void>;
    generateConsoleOutput(report: AnalysisReport): Promise<string>;
    private relativizePath;
    private groupDiagnosticsByFile;
    private getSeverityIcon;
}
