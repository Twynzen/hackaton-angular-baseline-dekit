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
    const { summary, diagnostics, config } = report;

    let output = '';

    // Header with fancy border
    output += '\\n╔════════════════════════════════════════════════════════════════╗\\n';
    output += '║     📊 Angular Baseline Compatibility Analysis Report      ║\\n';
    output += '╚════════════════════════════════════════════════════════════════╝\\n\\n';

    // Configuration Info
    output += `⚙️  Configuration:\\n`;
    output += `   Target:  ${typeof config.target === 'number' ? config.target : config.target.toUpperCase()}\\n`;
    output += `   Mode:    ${config.strict ? 'STRICT' : 'STANDARD'}\\n`;
    if (config.allow && config.allow.length > 0) {
      output += `   Allowed: ${config.allow.slice(0, 3).join(', ')}${config.allow.length > 3 ? '...' : ''}\\n`;
    }
    output += '\\n';

    // Summary with visual indicators
    output += `📈 Summary:\\n`;
    output += `   ┌─────────────────────────────────────┐\\n`;
    output += `   │  Total Issues:   ${this.padRight(summary.total.toString(), 18)}│\\n`;
    output += `   │  🔴 Errors:      ${this.padRight(summary.errors.toString(), 18)}│\\n`;
    output += `   │  🟡 Warnings:    ${this.padRight(summary.warnings.toString(), 18)}│\\n`;
    output += `   │  ℹ️  Info:        ${this.padRight(summary.infos.toString(), 18)}│\\n`;
    output += `   └─────────────────────────────────────┘\\n\\n`;

    if (diagnostics.length === 0) {
      output += '┌────────────────────────────────────────────────────────────┐\\n';
      output += '│  ✅ Excellent! No compatibility issues found!             │\\n';
      output += '│  Your code is compatible with the target baseline.        │\\n';
      output += '└────────────────────────────────────────────────────────────┘\\n';
      return output;
    }

    // Group diagnostics by file and severity
    const groupedDiagnostics = this.groupDiagnosticsByFile(diagnostics);
    const sortedFiles = Object.keys(groupedDiagnostics).sort();

    output += `🔍 Detailed Findings:\\n`;
    output += `${'='.repeat(64)}\\n\\n`;

    for (const filePath of sortedFiles) {
      const fileDiagnostics = groupedDiagnostics[filePath];

      // File header with issue count
      const errorCount = fileDiagnostics.filter(d => d.severity === 'error').length;
      const warnCount = fileDiagnostics.filter(d => d.severity === 'warn').length;
      const infoCount = fileDiagnostics.filter(d => d.severity === 'info').length;

      output += `📄 ${filePath}\\n`;
      output += `   Issues: ${errorCount} errors, ${warnCount} warnings, ${infoCount} info\\n`;
      output += `   ${'-'.repeat(60)}\\n`;

      // Sort diagnostics by line number
      const sortedDiagnostics = fileDiagnostics.sort((a, b) =>
        a.range.start.line - b.range.start.line
      );

      for (const diagnostic of sortedDiagnostics) {
        const icon = this.getSeverityIcon(diagnostic.severity);
        const location = `Line ${diagnostic.range.start.line}:${diagnostic.range.start.col}`;
        const featureName = diagnostic.featureId.split('.').pop() || diagnostic.featureId;

        output += `\\n   ${icon} ${location}\\n`;
        output += `      Feature: ${featureName} [${diagnostic.baseline}]\\n`;
        output += `      ${diagnostic.message}\\n`;

        if (diagnostic.suggestions && diagnostic.suggestions.length > 0) {
          const suggestion = diagnostic.suggestions[0];
          output += `\\n      💡 Suggestion: ${suggestion.title}\\n`;

          if (suggestion.code) {
            // Format code with indentation
            const codeLines = suggestion.code.split('\\n');
            output += `         Code example:\\n`;
            codeLines.forEach((line: string) => {
              output += `         ${line}\\n`;
            });
          }

          if (suggestion.note) {
            output += `         Note: ${suggestion.note}\\n`;
          }
        }
      }
      output += '\\n';
    }

    // Footer with recommendations
    output += `${'='.repeat(64)}\\n\\n`;
    output += `📚 Resources:\\n`;
    output += `   • MDN Web Docs: https://developer.mozilla.org\\n`;
    output += `   • Can I Use: https://caniuse.com\\n`;
    output += `   • Baseline Status: https://web.dev/baseline\\n\\n`;

    if (summary.errors > 0 || (config.strict && summary.warnings > 0)) {
      output += `❌ Analysis failed: ${summary.errors} errors found${config.strict ? ' (strict mode)' : ''}\\n`;
    } else if (summary.warnings > 0) {
      output += `⚠️  Analysis completed with warnings. Review before deployment.\\n`;
    } else {
      output += `✅ Analysis completed successfully!\\n`;
    }

    return output;
  }

  private padRight(str: string, length: number): string {
    return str + ' '.repeat(Math.max(0, length - str.length));
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