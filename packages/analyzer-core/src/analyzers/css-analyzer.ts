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

    // Check for modern pseudo-class selectors
    const modernSelectors = [
      ':has(',
      ':is(',
      ':where(',
      ':not(',
      ':focus-visible',
      ':focus-within',
      ':placeholder-shown',
      ':target',
      ':empty',
      ':first-child',
      ':last-child',
      ':only-child'
    ];

    for (const selector of modernSelectors) {
      if (selectorText.includes(selector)) {
        // Normalize selector format for registry lookup
        const lookupKey = selector.includes('(') ? selector.replace('(', '()') : selector;
        const featureId = getFeatureId(lookupKey);
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

    // Check for modern CSS properties across all categories
    const modernProperties = [
      // Layout
      'aspect-ratio', 'gap', 'row-gap', 'column-gap',
      'place-items', 'place-content', 'place-self',
      'inset', 'block-size', 'inline-size',
      'grid-template-areas', 'grid-template-columns', 'grid-template-rows',

      // Visual
      'backdrop-filter', 'mix-blend-mode', 'clip-path',
      'mask-image', 'object-fit', 'object-position',
      'filter', 'opacity',

      // Scrolling
      'scroll-behavior', 'overscroll-behavior',
      'scroll-snap-type', 'scroll-snap-align', 'overflow-anchor',

      // Typography
      'text-wrap', 'text-decoration-thickness', 'text-underline-offset',
      'line-clamp', 'font-variant-caps', 'font-variant-numeric',
      'text-overflow', 'word-break',

      // Container Queries
      'container-type', 'container-name', 'container',

      // Transforms & Animations
      'transform', 'translate', 'rotate', 'scale',
      'animation', 'transition'
    ];

    if (modernProperties.includes(property)) {
      const featureId = getFeatureId(property);
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

    // Check for CSS functions in values
    const cssFunctions = ['clamp(', 'min(', 'max(', 'calc(', 'var('];
    for (const func of cssFunctions) {
      if (value.includes(func)) {
        const featureId = getFeatureId(func + ')');
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
  }

  private analyzeAtRule(node: any, evidence: FeatureEvidence[], filePath: string, content: string): void {
    const ruleName = node.name;

    // Check for container queries
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

    // Check for media query features
    if (ruleName === 'media' && node.prelude) {
      const preludeText = generate(node.prelude);
      const mediaFeatures = [
        'prefers-color-scheme',
        'prefers-reduced-motion',
        'prefers-contrast'
      ];

      for (const feature of mediaFeatures) {
        if (preludeText.includes(feature)) {
          const featureId = getFeatureId(feature);
          if (featureId) {
            evidence.push(this.createEvidence(
              node,
              filePath,
              `@media (${feature})`,
              featureId,
              content
            ));
          }
        }
      }
    }
  }

  private analyzeWithPostCSS(root: postcss.Root, evidence: FeatureEvidence[], filePath: string, content: string): void {
    // Analyze selectors
    root.walkRules(rule => {
      const modernSelectors = [
        ':has(', ':is(', ':where(', ':not(',
        ':focus-visible', ':focus-within', ':placeholder-shown',
        ':target', ':empty'
      ];

      for (const selector of modernSelectors) {
        if (rule.selector.includes(selector)) {
          const lookupKey = selector.includes('(') ? selector.replace('(', '()') : selector;
          const featureId = getFeatureId(lookupKey);
          if (featureId) {
            evidence.push({
              file: filePath,
              lang: 'css',
              range: this.getPositionFromPostCSS(rule, content),
              code: rule.selector,
              featureId,
              meta: { type: 'selector', selector: rule.selector }
            });
          }
        }
      }
    });

    // Analyze declarations
    root.walkDecls(decl => {
      const modernProperties = [
        'aspect-ratio', 'gap', 'row-gap', 'column-gap',
        'place-items', 'place-content', 'inset',
        'backdrop-filter', 'mix-blend-mode', 'clip-path',
        'scroll-behavior', 'overscroll-behavior',
        'text-wrap', 'line-clamp',
        'container-type', 'container-name', 'container',
        'translate', 'rotate', 'scale'
      ];

      if (modernProperties.includes(decl.prop)) {
        const featureId = getFeatureId(decl.prop);
        if (featureId) {
          evidence.push({
            file: filePath,
            lang: 'css',
            range: this.getPositionFromPostCSS(decl, content),
            code: `${decl.prop}: ${decl.value}`,
            featureId,
            meta: { type: 'declaration', property: decl.prop, value: decl.value }
          });
        }
      }

      // Check for CSS functions
      const cssFunctions = ['clamp(', 'min(', 'max(', 'calc(', 'var('];
      for (const func of cssFunctions) {
        if (decl.value.includes(func)) {
          const featureId = getFeatureId(func + ')');
          if (featureId) {
            evidence.push({
              file: filePath,
              lang: 'css',
              range: this.getPositionFromPostCSS(decl, content),
              code: `${decl.prop}: ${decl.value}`,
              featureId,
              meta: { type: 'function', function: func }
            });
          }
        }
      }
    });

    // Analyze at-rules
    root.walkAtRules('container', rule => {
      const featureId = getFeatureId('container-query');
      if (featureId) {
        evidence.push({
          file: filePath,
          lang: 'css',
          range: this.getPositionFromPostCSS(rule, content),
          code: `@container ${rule.params}`,
          featureId,
          meta: { type: 'at-rule', name: 'container', params: rule.params }
        });
      }
    });

    // Analyze media queries
    root.walkAtRules('media', rule => {
      const mediaFeatures = ['prefers-color-scheme', 'prefers-reduced-motion', 'prefers-contrast'];
      for (const feature of mediaFeatures) {
        if (rule.params.includes(feature)) {
          const featureId = getFeatureId(feature);
          if (featureId) {
            evidence.push({
              file: filePath,
              lang: 'css',
              range: this.getPositionFromPostCSS(rule, content),
              code: `@media (${feature})`,
              featureId,
              meta: { type: 'media-feature', feature }
            });
          }
        }
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