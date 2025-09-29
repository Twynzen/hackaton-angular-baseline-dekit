"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonReporter = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class JsonReporter {
    async generateReport(report, options) {
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
        await fs.promises.writeFile(options.outputPath, JSON.stringify(jsonReport, null, 2), 'utf8');
    }
    async generateConsoleOutput(report) {
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
    relativizePath(filePath, projectRoot) {
        if (!projectRoot)
            return filePath;
        return path.relative(projectRoot, filePath);
    }
    groupDiagnosticsByFile(diagnostics) {
        return diagnostics.reduce((groups, diagnostic) => {
            const file = diagnostic.file;
            if (!groups[file]) {
                groups[file] = [];
            }
            groups[file].push(diagnostic);
            return groups;
        }, {});
    }
    getSeverityIcon(severity) {
        switch (severity) {
            case 'error': return '🔴';
            case 'warn': return '🟡';
            case 'info': return 'ℹ️';
            default: return '⚪';
        }
    }
}
exports.JsonReporter = JsonReporter;
