import * as postcss from 'postcss';
import { parse, walk, generate } from 'css-tree';
import { FeatureEvidence } from '../types';
import { getFeatureId } from '../feature-registry';

export class CSSAnalyzer {
  analyze(filePath: string, content: string): FeatureEvidence[] {
    const evidence: FeatureEvidence[] = [];

    try {
      // Use css-tree for parsing and analysis
      const ast = parse(content, {
        parseValue: false,
        parseAtrulePrelude: false
      });

      walk(ast, (node, item, list) => {
        this.analyzeNode(node, evidence, filePath, content);
      });

    } catch (error) {
      console.warn(`Failed to parse CSS file ${filePath}:`, error);

      // Fallback to PostCSS for better error handling
      try {
        const root = postcss.parse(content);
        this.analyzeWithPostCSS(root, evidence, filePath, content);
      } catch (postcssError) {
        console.warn(`PostCSS also failed to parse ${filePath}:`, postcssError);
      }
    }

    return evidence;
  }

  private analyzeNode(node: any, evidence: FeatureEvidence[], filePath: string, content: string): void {
    switch (node.type) {
      case 'Selector':
        this.analyzeSelector(node, evidence, filePath, content);
        break;
      case 'Declaration':
        this.analyzeDeclaration(node, evidence, filePath, content);
        break;
      case 'Atrule':
        this.analyzeAtRule(node, evidence, filePath, content);
        break;
    }
  }

  private analyzeSelector(node: any, evidence: FeatureEvidence[], filePath: string, content: string): void {
    const selectorText = generate(node);

    // Check for modern selectors
    const modernSelectors = [':has(', ':is(', ':where(', ':not('];

    for (const selector of modernSelectors) {
      if (selectorText.includes(selector)) {
        const featureId = getFeatureId(selector.replace('(', '()'));
        if (featureId) {
          evidence.push(this.createEvidence(
            node,
            filePath,
            selectorText,
            featureId,
            content
          ));
        }
      }
    }
  }

  private analyzeDeclaration(node: any, evidence: FeatureEvidence[], filePath: string, content: string): void {
    const property = node.property;
    const value = generate(node.value);

    // Check for modern CSS properties
    const modernProperties = [
      'text-wrap',
      'aspect-ratio',
      'gap',
      'grid-template-areas',
      'container-type',
      'container-name',
      'container'
    ];

    if (modernProperties.includes(property)) {
      let featureKey = property;

      // Special handling for specific property-value combinations
      if (property === 'text-wrap' && value.includes('balance')) {
        featureKey = 'text-wrap';
      }

      const featureId = getFeatureId(featureKey);
      if (featureId) {
        evidence.push(this.createEvidence(
          node,
          filePath,
          `${property}: ${value}`,
          featureId,
          content
        ));
      }
    }
  }

  private analyzeAtRule(node: any, evidence: FeatureEvidence[], filePath: string, content: string): void {
    const ruleName = node.name;

    // Check for modern at-rules
    if (ruleName === 'container') {
      const featureId = getFeatureId('container-query');
      if (featureId) {
        const ruleText = `@${ruleName}`;
        evidence.push(this.createEvidence(
          node,
          filePath,
          ruleText,
          featureId,
          content
        ));
      }
    }
  }

  private analyzeWithPostCSS(root: postcss.Root, evidence: FeatureEvidence[], filePath: string, content: string): void {
    root.walkRules(rule => {
      // Analyze selectors
      if (rule.selector.includes(':has(') || rule.selector.includes(':is(') || rule.selector.includes(':where(')) {
        const selectorFeatures = [':has()', ':is()', ':where()'];

        for (const selector of selectorFeatures) {
          if (rule.selector.includes(selector.replace('()', '('))) {
            const featureId = getFeatureId(selector);
            if (featureId) {
              evidence.push({
                file: filePath,
                lang: 'css',
                range: this.getPositionFromPostCSS(rule, content),
                code: rule.selector,
                featureId,
                meta: {
                  type: 'selector',
                  selector: rule.selector
                }
              });
            }
          }
        }
      }
    });

    root.walkDecls(decl => {
      const modernProperties = ['text-wrap', 'aspect-ratio', 'gap', 'grid-template-areas'];

      if (modernProperties.includes(decl.prop)) {
        const featureId = getFeatureId(decl.prop);
        if (featureId) {
          evidence.push({
            file: filePath,
            lang: 'css',
            range: this.getPositionFromPostCSS(decl, content),
            code: `${decl.prop}: ${decl.value}`,
            featureId,
            meta: {
              type: 'declaration',
              property: decl.prop,
              value: decl.value
            }
          });
        }
      }
    });

    root.walkAtRules('container', rule => {
      const featureId = getFeatureId('container-query');
      if (featureId) {
        evidence.push({
          file: filePath,
          lang: 'css',
          range: this.getPositionFromPostCSS(rule, content),
          code: `@container ${rule.params}`,
          featureId,
          meta: {
            type: 'at-rule',
            name: 'container',
            params: rule.params
          }
        });
      }
    });
  }

  private createEvidence(
    node: any,
    filePath: string,
    code: string,
    featureId: string,
    content: string
  ): FeatureEvidence {
    const position = this.getPositionFromNode(node, content);

    return {
      file: filePath,
      lang: 'css',
      range: position,
      code,
      featureId,
      meta: {
        nodeType: node.type
      }
    };
  }

  private getPositionFromNode(node: any, content: string): { start: { line: number; col: number }; end: { line: number; col: number } } {
    // css-tree nodes have location information
    if (node.loc) {
      return {
        start: { line: node.loc.start.line, col: node.loc.start.column },
        end: { line: node.loc.end.line, col: node.loc.end.column }
      };
    }

    // Fallback to line 1, column 1
    return {
      start: { line: 1, col: 1 },
      end: { line: 1, col: 1 }
    };
  }

  private getPositionFromPostCSS(node: postcss.Node, content: string): { start: { line: number; col: number }; end: { line: number; col: number } } {
    const start = node.source?.start || { line: 1, column: 1 };
    const end = node.source?.end || { line: 1, column: 1 };

    return {
      start: { line: start.line, col: start.column },
      end: { line: end.line, col: end.column }
    };
  }
}