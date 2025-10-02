import * as fs from 'fs';
import * as path from 'path';
import { AnalysisReport } from '@angular-baseline-devkit/analyzer-core';

export interface HtmlReporterOptions {
  outputPath: string;
  projectRoot?: string;
  projectName?: string;
}

export class HtmlReporter {
  async generateReport(report: AnalysisReport, options: HtmlReporterOptions): Promise<void> {
    const outputDir = path.dirname(options.outputPath);

    // Ensure output directory exists
    await fs.promises.mkdir(outputDir, { recursive: true });

    // Generate HTML content
    const htmlContent = this.generateHtml(report, options);

    // Write to file
    await fs.promises.writeFile(options.outputPath, htmlContent, 'utf8');
  }

  private generateHtml(report: AnalysisReport, options: HtmlReporterOptions): string {
    const { summary, diagnostics, config } = report;
    const projectName = options.projectName || 'Angular Project';
    const timestamp = new Date().toLocaleString();

    // Group diagnostics by severity
    const errors = diagnostics.filter(d => d.severity === 'error');
    const warnings = diagnostics.filter(d => d.severity === 'warn');
    const infos = diagnostics.filter(d => d.severity === 'info');

    // Group by file
    const fileGroups = this.groupByFile(diagnostics);

    // Calculate compatibility score
    const score = this.calculateCompatibilityScore(summary);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Baseline Compatibility Report - ${projectName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
      min-height: 100vh;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      text-align: center;
    }

    .header h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .header .subtitle {
      opacity: 0.9;
      font-size: 0.9rem;
    }

    .score-section {
      padding: 2rem;
      text-align: center;
      background: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
    }

    .score-circle {
      width: 150px;
      height: 150px;
      margin: 0 auto 1rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      font-weight: bold;
      color: white;
      position: relative;
    }

    .score-circle.excellent { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
    .score-circle.good { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
    .score-circle.fair { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
    .score-circle.poor { background: linear-gradient(135deg, #f857a6 0%, #ff5858 100%); }

    .score-label {
      font-size: 1.2rem;
      color: #495057;
      margin-bottom: 0.5rem;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      padding: 2rem;
      background: white;
    }

    .stat-card {
      padding: 1.5rem;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .stat-card.error { background: #fff5f5; border-left: 4px solid #dc3545; }
    .stat-card.warning { background: #fff9f0; border-left: 4px solid #ffc107; }
    .stat-card.info { background: #f0f9ff; border-left: 4px solid #0dcaf0; }
    .stat-card.total { background: #f8f9fa; border-left: 4px solid #6c757d; }

    .stat-number {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }

    .stat-card.error .stat-number { color: #dc3545; }
    .stat-card.warning .stat-number { color: #ffc107; }
    .stat-card.info .stat-number { color: #0dcaf0; }
    .stat-card.total .stat-number { color: #6c757d; }

    .stat-label {
      color: #6c757d;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .config-info {
      padding: 1.5rem 2rem;
      background: #e9ecef;
      border-bottom: 1px solid #dee2e6;
      display: flex;
      justify-content: space-around;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .config-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .config-item .label {
      color: #6c757d;
      font-weight: 600;
    }

    .config-item .value {
      color: #495057;
      background: white;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
    }

    .findings {
      padding: 2rem;
    }

    .findings-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .findings-title {
      font-size: 1.5rem;
      color: #212529;
    }

    .filter-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .filter-btn {
      padding: 0.5rem 1rem;
      border: 1px solid #dee2e6;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;
    }

    .filter-btn:hover {
      background: #f8f9fa;
    }

    .filter-btn.active {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .file-group {
      margin-bottom: 2rem;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      overflow: hidden;
    }

    .file-header {
      background: #f8f9fa;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      user-select: none;
    }

    .file-header:hover {
      background: #e9ecef;
    }

    .file-name {
      font-weight: 600;
      color: #495057;
      font-family: 'Courier New', monospace;
    }

    .file-stats {
      display: flex;
      gap: 1rem;
      font-size: 0.85rem;
    }

    .file-stat {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .diagnostic {
      padding: 1rem;
      border-bottom: 1px solid #dee2e6;
      transition: background 0.2s;
    }

    .diagnostic:last-child {
      border-bottom: none;
    }

    .diagnostic:hover {
      background: #f8f9fa;
    }

    .diagnostic-header {
      display: flex;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }

    .severity-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .severity-badge.error {
      background: #dc3545;
      color: white;
    }

    .severity-badge.warn {
      background: #ffc107;
      color: #000;
    }

    .severity-badge.info {
      background: #0dcaf0;
      color: white;
    }

    .location {
      color: #6c757d;
      font-family: 'Courier New', monospace;
      font-size: 0.85rem;
    }

    .feature-name {
      color: #667eea;
      font-weight: 600;
      margin-left: auto;
    }

    .diagnostic-message {
      color: #495057;
      margin-bottom: 1rem;
      line-height: 1.5;
    }

    .suggestion {
      background: #e7f5ff;
      border-left: 3px solid #0dcaf0;
      padding: 1rem;
      border-radius: 4px;
      margin-top: 1rem;
    }

    .suggestion-title {
      font-weight: 600;
      color: #0a58ca;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .suggestion-code {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      padding: 0.75rem;
      margin-top: 0.5rem;
      font-family: 'Courier New', monospace;
      font-size: 0.85rem;
      overflow-x: auto;
      white-space: pre-wrap;
    }

    .suggestion-note {
      color: #6c757d;
      font-size: 0.9rem;
      margin-top: 0.5rem;
    }

    .footer {
      padding: 2rem;
      text-align: center;
      background: #f8f9fa;
      border-top: 1px solid #dee2e6;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .resources {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-top: 1rem;
    }

    .resources a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }

    .resources a:hover {
      text-decoration: underline;
    }

    .no-issues {
      text-align: center;
      padding: 3rem;
      color: #28a745;
    }

    .no-issues-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .no-issues-text {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .no-issues-subtitle {
      color: #6c757d;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>🎯 Baseline Compatibility Report</h1>
      <div class="subtitle">${projectName} • Generated ${timestamp}</div>
    </div>

    <!-- Compatibility Score -->
    <div class="score-section">
      <div class="score-circle ${this.getScoreClass(score)}">
        ${score}
      </div>
      <div class="score-label">Compatibility Score</div>
      <div style="color: #6c757d; font-size: 0.9rem;">${this.getScoreDescription(score)}</div>
    </div>

    <!-- Statistics -->
    <div class="stats">
      <div class="stat-card total">
        <div class="stat-number">${summary.total}</div>
        <div class="stat-label">Total Issues</div>
      </div>
      <div class="stat-card error">
        <div class="stat-number">${summary.errors}</div>
        <div class="stat-label">Errors</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-number">${summary.warnings}</div>
        <div class="stat-label">Warnings</div>
      </div>
      <div class="stat-card info">
        <div class="stat-number">${summary.infos}</div>
        <div class="stat-label">Info</div>
      </div>
    </div>

    <!-- Configuration -->
    <div class="config-info">
      <div class="config-item">
        <span class="label">Target:</span>
        <span class="value">${typeof config.target === 'number' ? config.target : config.target.toUpperCase()}</span>
      </div>
      <div class="config-item">
        <span class="label">Mode:</span>
        <span class="value">${config.strict ? 'STRICT' : 'STANDARD'}</span>
      </div>
      <div class="config-item">
        <span class="label">Files Analyzed:</span>
        <span class="value">${Object.keys(fileGroups).length}</span>
      </div>
    </div>

    <!-- Findings -->
    ${diagnostics.length === 0 ? this.generateNoIssuesHtml() : this.generateFindingsHtml(fileGroups)}

    <!-- Footer -->
    <div class="footer">
      <div>Generated by Angular Baseline DevKit</div>
      <div class="resources">
        <a href="https://developer.mozilla.org" target="_blank">MDN Web Docs</a>
        <a href="https://caniuse.com" target="_blank">Can I Use</a>
        <a href="https://web.dev/baseline" target="_blank">Web Baseline</a>
      </div>
    </div>
  </div>

  <script>
    // Filter functionality
    function filterDiagnostics(severity) {
      const diagnostics = document.querySelectorAll('.diagnostic');
      diagnostics.forEach(diag => {
        if (severity === 'all') {
          diag.style.display = 'block';
        } else {
          const badge = diag.querySelector('.severity-badge');
          if (badge && badge.classList.contains(severity)) {
            diag.style.display = 'block';
          } else {
            diag.style.display = 'none';
          }
        }
      });

      // Update active button
      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      event.target.classList.add('active');
    }

    // File collapse/expand
    function toggleFile(element) {
      const diagnosticsList = element.nextElementSibling;
      if (diagnosticsList.style.display === 'none') {
        diagnosticsList.style.display = 'block';
      } else {
        diagnosticsList.style.display = 'none';
      }
    }
  </script>
</body>
</html>
    `.trim();
  }

  private generateNoIssuesHtml(): string {
    return `
      <div class="no-issues">
        <div class="no-issues-icon">✅</div>
        <div class="no-issues-text">Excellent! No compatibility issues found!</div>
        <div class="no-issues-subtitle">Your code is compatible with the target baseline.</div>
      </div>
    `;
  }

  private generateFindingsHtml(fileGroups: Record<string, any[]>): string {
    let html = '<div class="findings">';
    html += '<div class="findings-header">';
    html += '<div class="findings-title">🔍 Detailed Findings</div>';
    html += '<div class="filter-buttons">';
    html += '<button class="filter-btn active" onclick="filterDiagnostics(\'all\')">All</button>';
    html += '<button class="filter-btn" onclick="filterDiagnostics(\'error\')">Errors</button>';
    html += '<button class="filter-btn" onclick="filterDiagnostics(\'warn\')">Warnings</button>';
    html += '<button class="filter-btn" onclick="filterDiagnostics(\'info\')">Info</button>';
    html += '</div>';
    html += '</div>';

    for (const [file, diagnostics] of Object.entries(fileGroups)) {
      const errorCount = diagnostics.filter(d => d.severity === 'error').length;
      const warnCount = diagnostics.filter(d => d.severity === 'warn').length;
      const infoCount = diagnostics.filter(d => d.severity === 'info').length;

      html += '<div class="file-group">';
      html += `<div class="file-header" onclick="toggleFile(this)">`;
      html += `<div class="file-name">📄 ${file}</div>`;
      html += '<div class="file-stats">';
      if (errorCount > 0) html += `<div class="file-stat">🔴 ${errorCount}</div>`;
      if (warnCount > 0) html += `<div class="file-stat">🟡 ${warnCount}</div>`;
      if (infoCount > 0) html += `<div class="file-stat">ℹ️ ${infoCount}</div>`;
      html += '</div>';
      html += '</div>';

      html += '<div class="diagnostics-list">';
      for (const diagnostic of diagnostics) {
        html += this.generateDiagnosticHtml(diagnostic);
      }
      html += '</div>';
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  private generateDiagnosticHtml(diagnostic: any): string {
    const featureName = diagnostic.featureId.split('.').pop() || diagnostic.featureId;

    let html = '<div class="diagnostic">';
    html += '<div class="diagnostic-header">';
    html += `<span class="severity-badge ${diagnostic.severity}">${diagnostic.severity}</span>`;
    html += `<span class="location">Line ${diagnostic.range.start.line}:${diagnostic.range.start.col}</span>`;
    html += `<span class="feature-name">${featureName}</span>`;
    html += '</div>';
    html += `<div class="diagnostic-message">${diagnostic.message}</div>`;

    if (diagnostic.suggestions && diagnostic.suggestions.length > 0) {
      const suggestion = diagnostic.suggestions[0];
      html += '<div class="suggestion">';
      html += `<div class="suggestion-title">💡 ${suggestion.title}</div>`;
      if (suggestion.code) {
        html += `<div class="suggestion-code">${this.escapeHtml(suggestion.code)}</div>`;
      }
      if (suggestion.note) {
        html += `<div class="suggestion-note">${suggestion.note}</div>`;
      }
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  private groupByFile(diagnostics: any[]): Record<string, any[]> {
    return diagnostics.reduce((groups, diagnostic) => {
      const file = diagnostic.file;
      if (!groups[file]) {
        groups[file] = [];
      }
      groups[file].push(diagnostic);
      return groups;
    }, {} as Record<string, any[]>);
  }

  private calculateCompatibilityScore(summary: any): number {
    if (summary.total === 0) return 100;

    const errorWeight = 10;
    const warningWeight = 3;
    const infoWeight = 1;

    const totalWeight = (summary.errors * errorWeight) +
                        (summary.warnings * warningWeight) +
                        (summary.infos * infoWeight);

    const score = Math.max(0, 100 - totalWeight);
    return Math.round(score);
  }

  private getScoreClass(score: number): string {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    return 'poor';
  }

  private getScoreDescription(score: number): string {
    if (score >= 90) return 'Excellent compatibility!';
    if (score >= 70) return 'Good compatibility with minor issues';
    if (score >= 50) return 'Fair compatibility, review recommended';
    return 'Poor compatibility, significant issues found';
  }

  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}
