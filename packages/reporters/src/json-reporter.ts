import * as fs from 'fs';
import * as path from 'path';
import { AnalysisReport } from '@angular-baseline-devkit/analyzer-core';

export interface ReporterOptions {
  outputPath: string;
  projectRoot?: string;
}

export class JsonReporter {
  async generateReport(report: AnalysisReport, options: ReporterOptions): Promise<void> {
    const outputDir = path.dirname(options.outputPath);

    // Ensure output directory exists
    await fs.promises.mkdir(outputDir, { recursive: true });

    // Generate the JSON report
    const jsonReport = {
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      summary: report.summary,
      config: report.config,
      diagnostics: report.diagnostics.map(diagnostic => ({
        ...diagnostic,
        file: this.relativizePath(diagnostic.file, options.projectRoot)
      })),
      evidence: report.evidence.map(evidence => ({
        ...evidence,
        file: this.relativizePath(evidence.file, options.projectRoot)
      }))
    };

    // Write to file
    await fs.promises.writeFile(
      options.outputPath,
      JSON.stringify(jsonReport, null, 2),
      'utf8'
    );
  }

  async generateConsoleOutput(report: AnalysisReport): Promise<string> {
    const { summary, diagnostics } = report;

    let output = '\\n📊 Angular Baseline Analysis Report\\n';
    output += '=====================================\\n\\n';

    // Summary
    output += `📈 Summary:\\n`;
    output += `  Total issues: ${summary.total}\\n`;
    output += `  🔴 Errors: ${summary.errors}\\n`;
    output += `  🟡 Warnings: ${summary.warnings}\\n`;
    output += `  ℹ️  Info: ${summary.infos}\\n\\n`;

    if (diagnostics.length === 0) {
      output += '✅ No baseline compatibility issues found!\\n';
      return output;
    }

    // Group diagnostics by file
    const groupedDiagnostics = this.groupDiagnosticsByFile(diagnostics);

    for (const [filePath, fileDiagnostics] of Object.entries(groupedDiagnostics)) {
      output += `📄 ${filePath}\\n`;

      for (const diagnostic of fileDiagnostics) {
        const icon = this.getSeverityIcon(diagnostic.severity);
        const location = `${diagnostic.range.start.line}:${diagnostic.range.start.col}`;

        output += `  ${icon} ${location} - ${diagnostic.message}\\n`;

        if (diagnostic.suggestions && diagnostic.suggestions.length > 0) {
          output += `     💡 ${diagnostic.suggestions[0].title}\\n`;
          if (diagnostic.suggestions[0].note) {
            output += `        ${diagnostic.suggestions[0].note}\\n`;
          }
        }
      }
      output += '\\n';
    }

    return output;
  }

  private relativizePath(filePath: string, projectRoot?: string): string {
    if (!projectRoot) return filePath;
    return path.relative(projectRoot, filePath);
  }

  private groupDiagnosticsByFile(diagnostics: any[]): Record<string, any[]> {
    return diagnostics.reduce((groups, diagnostic) => {
      const file = diagnostic.file;
      if (!groups[file]) {
        groups[file] = [];
      }
      groups[file].push(diagnostic);
      return groups;
    }, {} as Record<string, any[]>);
  }

  private getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'error': return '🔴';
      case 'warn': return '🟡';
      case 'info': return 'ℹ️';
      default: return '⚪';
    }
  }
}