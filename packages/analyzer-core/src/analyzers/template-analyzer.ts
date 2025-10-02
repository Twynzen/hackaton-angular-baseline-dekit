import { FeatureEvidence } from '../types.js';
import { getFeatureId } from '../feature-registry.js';

let angularCompiler: any = null;

async function loadAngularCompiler() {
  if (!angularCompiler) {
    // Use Function constructor to prevent TypeScript from transforming import()
    const dynamicImport = new Function('specifier', 'return import(specifier)');
    angularCompiler = await dynamicImport('@angular/compiler');
  }
  return angularCompiler;
}

export class TemplateAnalyzer {
  async analyze(filePath: string, content: string): Promise<FeatureEvidence[]> {
    const evidence: FeatureEvidence[] = [];

    try {
      const compiler = await loadAngularCompiler();
      const { parseTemplate, TmplAstElement } = compiler;

      const parsed = parseTemplate(content, filePath, {
        preserveWhitespaces: false,
        collectCommentNodes: false
      });

      if (parsed.errors && parsed.errors.length > 0) {
        console.warn(`Template parsing errors in ${filePath}:`, parsed.errors);
      }

      this.visitNodes(parsed.nodes, evidence, filePath, content, TmplAstElement);

    } catch (error) {
      console.warn(`Failed to parse Angular template ${filePath}:`, error);
    }

    return evidence;
  }

  private visitNodes(nodes: any[], evidence: FeatureEvidence[], filePath: string, content: string, TmplAstElement: any): void {
    for (const node of nodes) {
      if (node instanceof TmplAstElement) {
        this.analyzeElement(node, evidence, filePath, content);
      }

      // Recursively visit child nodes
      if (node.children) {
        this.visitNodes(node.children, evidence, filePath, content, TmplAstElement);
      }
    }
  }

  private analyzeElement(element: any, evidence: FeatureEvidence[], filePath: string, content: string): void {
    // Check for HTML global attributes that map to web features
    const modernAttributes = [
      'popover', 'inert', 'loading', 'contenteditable',
      'enterkeyhint', 'inputmode', 'hidden', 'draggable'
    ];

    element.attributes.forEach((attr: any) => {
      if (modernAttributes.includes(attr.name)) {
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
      }
    });

    // Check for specific HTML5 elements
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

    // Check for Angular property bindings with modern attributes
    element.inputs.forEach((input: any) => {
      if (modernAttributes.includes(input.name)) {
        const featureId = getFeatureId(input.name);
        if (featureId) {
          evidence.push(this.createEvidence(
            input,
            filePath,
            `[${input.name}]="${input.value}"`,
            featureId,
            content
          ));
        }
      }
    });
  }

  private getElementFeatures(elementName: string): Array<{ code: string; featureId: string }> {
    const features: Array<{ code: string; featureId: string }> = [];

    // Map of modern HTML5 elements to feature IDs
    const modernElements = [
      'dialog', 'details', 'summary'
    ];

    if (modernElements.includes(elementName)) {
      const featureId = getFeatureId(elementName);
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