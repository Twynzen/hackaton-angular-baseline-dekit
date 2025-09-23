import { parseTemplate, TmplAstElement, TmplAstTextAttribute } from '@angular/compiler';
import { FeatureEvidence } from '../types';
import { getFeatureId } from '../feature-registry';

export class TemplateAnalyzer {
  analyze(filePath: string, content: string): FeatureEvidence[] {
    const evidence: FeatureEvidence[] = [];

    try {
      const parsed = parseTemplate(content, filePath, {
        preserveWhitespaces: false,
        collectCommentNodes: false
      });

      if (parsed.errors.length > 0) {
        console.warn(`Template parsing errors in ${filePath}:`, parsed.errors);
      }

      this.visitNodes(parsed.nodes, evidence, filePath, content);

    } catch (error) {
      console.warn(`Failed to parse Angular template ${filePath}:`, error);
    }

    return evidence;
  }

  private visitNodes(nodes: any[], evidence: FeatureEvidence[], filePath: string, content: string): void {
    for (const node of nodes) {
      if (node instanceof TmplAstElement) {
        this.analyzeElement(node, evidence, filePath, content);
      }

      // Recursively visit child nodes
      if (node.children) {
        this.visitNodes(node.children, evidence, filePath, content);
      }
    }
  }

  private analyzeElement(element: TmplAstElement, evidence: FeatureEvidence[], filePath: string, content: string): void {
    // Check for HTML attributes that map to web features
    element.attributes.forEach((attr: TmplAstTextAttribute) => {
      const featureId = getFeatureId(attr.name);
      if (featureId) {
        evidence.push(this.createEvidence(
          attr,
          filePath,
          `${attr.name}="${attr.value}"`,
          featureId,
          content
        ));
      }
    });

    // Check for specific elements that might indicate feature usage
    const elementFeatures = this.getElementFeatures(element.name);
    elementFeatures.forEach(({ code, featureId }) => {
      evidence.push(this.createEvidence(
        element,
        filePath,
        code,
        featureId,
        content
      ));
    });

    // Check for Angular-specific attributes
    element.inputs.forEach((input: any) => {
      if (input.name === 'popover') {
        const featureId = getFeatureId('popover');
        if (featureId) {
          evidence.push(this.createEvidence(
            input,
            filePath,
            `[popover]="${input.value}"`,
            featureId,
            content
          ));
        }
      }
    });
  }

  private getElementFeatures(elementName: string): Array<{ code: string; featureId: string }> {
    const features: Array<{ code: string; featureId: string }> = [];

    // Check for specific HTML elements that indicate feature usage
    if (elementName === 'dialog') {
      const featureId = getFeatureId('dialog');
      if (featureId) {
        features.push({ code: `<${elementName}>`, featureId });
      }
    }

    return features;
  }

  private createEvidence(
    node: any,
    filePath: string,
    code: string,
    featureId: string,
    content: string
  ): FeatureEvidence {
    // Calculate line and column from source span
    const lines = content.substring(0, node.sourceSpan?.start.offset || 0).split('\n');
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;

    const endLines = content.substring(0, node.sourceSpan?.end.offset || 0).split('\n');
    const endLine = endLines.length;
    const endCol = endLines[endLines.length - 1].length + 1;

    return {
      file: filePath,
      lang: 'html',
      range: {
        start: { line, col },
        end: { line: endLine, col: endCol }
      },
      code,
      featureId,
      meta: {
        elementName: node.name || 'unknown',
        attributeName: node.name
      }
    };
  }
}