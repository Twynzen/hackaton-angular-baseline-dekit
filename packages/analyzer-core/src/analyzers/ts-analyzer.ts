import { Project, SyntaxKind, Node, PropertyAccessExpression, NewExpression, CallExpression } from 'ts-morph';
import { FeatureEvidence } from '../types';
import { getFeatureId } from '../feature-registry';

export class TSAnalyzer {
  private project: Project;

  constructor() {
    this.project = new Project({
      useInMemoryFileSystem: true,
      compilerOptions: {
        target: 1, // ES5
        allowJs: true
      }
    });
  }

  analyze(filePath: string, content: string): FeatureEvidence[] {
    const evidence: FeatureEvidence[] = [];

    try {
      const sourceFile = this.project.createSourceFile(filePath, content, { overwrite: true });

      // Analyze property access expressions (e.g., document.startViewTransition)
      sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression).forEach(node => {
        const fullText = this.getFullPropertyAccess(node);
        const featureId = getFeatureId(fullText);

        if (featureId) {
          evidence.push(this.createEvidence(node, filePath, fullText, featureId));
        }
      });

      // Analyze new expressions (e.g., new IntersectionObserver)
      sourceFile.getDescendantsOfKind(SyntaxKind.NewExpression).forEach(node => {
        const expression = node.getExpression();
        if (Node.isIdentifier(expression)) {
          const constructorName = expression.getText();
          const featureId = getFeatureId(constructorName);

          if (featureId) {
            evidence.push(this.createEvidence(node, filePath, constructorName, featureId));
          }
        }
      });

      // Analyze standalone identifiers (e.g., fetch, structuredClone, requestIdleCallback)
      sourceFile.getDescendantsOfKind(SyntaxKind.Identifier).forEach(node => {
        const identifierName = node.getText();

        // Check for global functions and APIs
        const globalAPIs = [
          'fetch', 'Request', 'Response', 'Headers', 'AbortController',
          'FormData', 'URLSearchParams',
          'structuredClone', 'queueMicrotask', 'requestIdleCallback',
          'requestAnimationFrame', 'createImageBitmap',
          'OffscreenCanvas', 'ImageBitmap', 'WebSocket',
          'PerformanceObserver', 'ValidityState',
          'localStorage', 'sessionStorage', 'IndexedDB',
          'Cache', 'CacheStorage',
          'MediaRecorder', 'AudioContext',
          'HTMLMediaElement', 'HTMLVideoElement', 'HTMLAudioElement',
          'ShadowRoot', 'HTMLSlotElement'
        ];

        if (globalAPIs.includes(identifierName)) {
          const featureId = getFeatureId(identifierName);
          if (featureId) {
            // Only add if it's actually used (not just a type reference)
            const parent = node.getParent();
            if (parent && !Node.isTypeReference(parent)) {
              evidence.push(this.createEvidence(node, filePath, identifierName, featureId));
            }
          }
        }
      });

      // Analyze call expressions (e.g., customElements.define())
      sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).forEach(node => {
        const expression = node.getExpression();
        if (Node.isPropertyAccessExpression(expression)) {
          const fullAccess = this.getFullPropertyAccess(expression);
          const featureId = getFeatureId(fullAccess);

          if (featureId) {
            evidence.push(this.createEvidence(node, filePath, fullAccess, featureId));
          }
        }
      });

      // Analyze inline Angular templates and styles
      this.analyzeInlineComponents(sourceFile, filePath, evidence);

    } catch (error) {
      console.warn(`Failed to analyze TypeScript file ${filePath}:`, error);
    }

    return evidence;
  }

  private getFullPropertyAccess(node: PropertyAccessExpression): string {
    const parts: string[] = [];
    let current: Node = node;

    while (Node.isPropertyAccessExpression(current)) {
      parts.unshift(current.getName());
      current = current.getExpression();
    }

    if (Node.isIdentifier(current)) {
      parts.unshift(current.getText());
    }

    return parts.join('.');
  }

  private analyzeInlineComponents(sourceFile: any, filePath: string, evidence: FeatureEvidence[]): void {
    // Find @Component decorators
    sourceFile.getClasses().forEach((classNode: any) => {
      const componentDecorator = classNode.getDecorator('Component');
      if (!componentDecorator) return;

      const arg = componentDecorator.getArguments()[0];
      if (arg?.getKind() === SyntaxKind.ObjectLiteralExpression) {
        // Check for inline template
        const templateProp = arg.getProperty('template');
        if (templateProp && Node.isPropertyAssignment(templateProp)) {
          const initializer = templateProp.getInitializer();
          if (Node.isStringLiteral(initializer)) {
            const templateContent = initializer.getLiteralValue();
            // TODO: Analyze HTML content - this would need the TemplateAnalyzer
            // For now, we'll skip inline template analysis in MVP
          }
        }

        // Check for inline styles
        const stylesProp = arg.getProperty('styles');
        if (stylesProp && Node.isPropertyAssignment(stylesProp)) {
          const initializer = stylesProp.getInitializer();
          if (Node.isArrayLiteralExpression(initializer)) {
            initializer.getElements().forEach(element => {
              if (Node.isStringLiteral(element)) {
                const styleContent = element.getLiteralValue();
                // TODO: Analyze CSS content - this would need the CSSAnalyzer
                // For now, we'll skip inline style analysis in MVP
              }
            });
          }
        }
      }
    });
  }

  private createEvidence(node: Node, filePath: string, code: string, featureId: string): FeatureEvidence {
    const start = node.getStart();
    const end = node.getEnd();
    const sourceFile = node.getSourceFile();

    const startPos = sourceFile.getLineAndColumnAtPos(start);
    const endPos = sourceFile.getLineAndColumnAtPos(end);

    return {
      file: filePath,
      lang: 'ts',
      range: {
        start: { line: startPos.line, col: startPos.column },
        end: { line: endPos.line, col: endPos.column }
      },
      code: node.getText(),
      featureId,
      meta: {
        constructName: code,
        nodeKind: node.getKindName()
      }
    };
  }
}