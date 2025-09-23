import { describe, it, expect } from 'vitest';
import { AngularBaselineAnalyzer } from '../src/analyzer';
import { TSAnalyzer } from '../src/analyzers/ts-analyzer';
import { TemplateAnalyzer } from '../src/analyzers/template-analyzer';
import { CSSAnalyzer } from '../src/analyzers/css-analyzer';
import * as path from 'path';

describe('AngularBaselineAnalyzer', () => {
  const analyzer = new AngularBaselineAnalyzer();

  describe('TSAnalyzer', () => {
    const tsAnalyzer = new TSAnalyzer();

    it('should detect IntersectionObserver usage', () => {
      const code = `
        const observer = new IntersectionObserver((entries) => {
          // callback logic
        });
      `;

      const evidence = tsAnalyzer.analyze('test.ts', code);
      expect(evidence).toHaveLength(1);
      expect(evidence[0].featureId).toBe('api.IntersectionObserver');
      expect(evidence[0].lang).toBe('ts');
    });

    it('should detect document.startViewTransition usage', () => {
      const code = `
        document.startViewTransition(() => {
          // transition logic
        });
      `;

      const evidence = tsAnalyzer.analyze('test.ts', code);
      expect(evidence).toHaveLength(1);
      expect(evidence[0].featureId).toBe('api.Document.startViewTransition');
    });
  });

  describe('CSSAnalyzer', () => {
    const cssAnalyzer = new CSSAnalyzer();

    it('should detect :has() selector usage', () => {
      const css = `
        .card:has(.error) {
          border: 1px solid red;
        }
      `;

      const evidence = cssAnalyzer.analyze('test.css', css);
      expect(evidence.length).toBeGreaterThan(0);

      const hasEvidence = evidence.find(e => e.featureId === 'css.selectors.has');
      expect(hasEvidence).toBeDefined();
      expect(hasEvidence?.lang).toBe('css');
    });

    it('should detect text-wrap property usage', () => {
      const css = `
        .title {
          text-wrap: balance;
        }
      `;

      const evidence = cssAnalyzer.analyze('test.css', css);
      expect(evidence.length).toBeGreaterThan(0);

      const textWrapEvidence = evidence.find(e => e.featureId === 'css.properties.text-wrap');
      expect(textWrapEvidence).toBeDefined();
      expect(textWrapEvidence?.lang).toBe('css');
    });
  });

  describe('TemplateAnalyzer', () => {
    const templateAnalyzer = new TemplateAnalyzer();

    it('should detect popover attribute usage', () => {
      const html = `
        <div popover="auto">
          Content
        </div>
      `;

      const evidence = templateAnalyzer.analyze('test.html', html);
      expect(evidence.length).toBeGreaterThan(0);

      const popoverEvidence = evidence.find(e => e.featureId === 'html.elements.div.popover');
      expect(popoverEvidence).toBeDefined();
      expect(popoverEvidence?.lang).toBe('html');
    });
  });

  describe('Feature Registry Validation', () => {
    it('should validate feature registry against web-features', () => {
      const result = analyzer.validateFeatureRegistry();
      expect(result.valid).toBeInstanceOf(Array);
      expect(result.invalid).toBeInstanceOf(Array);
    });
  });
});

describe('Integration Tests', () => {
  const analyzer = new AngularBaselineAnalyzer();

  it('should analyze fixtures and generate report', async () => {
    const fixturesPath = path.join(__dirname, 'fixtures');

    const report = await analyzer.analyze({
      config: {
        target: 'widely',
        strict: false
      },
      projectRoot: fixturesPath,
      files: [
        path.join(fixturesPath, 'has.css'),
        path.join(fixturesPath, 'textwrap.css'),
        path.join(fixturesPath, 'observer.ts'),
        path.join(fixturesPath, 'view-transitions.ts')
      ]
    });

    expect(report.evidence.length).toBeGreaterThan(0);
    expect(report.diagnostics.length).toBeGreaterThan(0);
    expect(report.summary.total).toBeGreaterThan(0);
  });
});