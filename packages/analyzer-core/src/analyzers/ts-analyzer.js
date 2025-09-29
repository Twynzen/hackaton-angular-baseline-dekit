"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TSAnalyzer = void 0;
const ts_morph_1 = require("ts-morph");
const feature_registry_1 = require("../feature-registry");
class TSAnalyzer {
    constructor() {
        this.project = new ts_morph_1.Project({
            useInMemoryFileSystem: true,
            compilerOptions: {
                target: 1,
                allowJs: true
            }
        });
    }
    analyze(filePath, content) {
        const evidence = [];
        try {
            const sourceFile = this.project.createSourceFile(filePath, content, { overwrite: true });
            // Analyze property access expressions (e.g., document.startViewTransition)
            sourceFile.getDescendantsOfKind(ts_morph_1.SyntaxKind.PropertyAccessExpression).forEach(node => {
                const fullText = this.getFullPropertyAccess(node);
                const featureId = (0, feature_registry_1.getFeatureId)(fullText);
                if (featureId) {
                    evidence.push(this.createEvidence(node, filePath, fullText, featureId));
                }
            });
            // Analyze new expressions (e.g., new IntersectionObserver)
            sourceFile.getDescendantsOfKind(ts_morph_1.SyntaxKind.NewExpression).forEach(node => {
                const expression = node.getExpression();
                if (ts_morph_1.Node.isIdentifier(expression)) {
                    const constructorName = expression.getText();
                    const featureId = (0, feature_registry_1.getFeatureId)(constructorName);
                    if (featureId) {
                        evidence.push(this.createEvidence(node, filePath, constructorName, featureId));
                    }
                }
            });
            // Analyze inline Angular templates and styles
            this.analyzeInlineComponents(sourceFile, filePath, evidence);
        }
        catch (error) {
            console.warn(`Failed to analyze TypeScript file ${filePath}:`, error);
        }
        return evidence;
    }
    getFullPropertyAccess(node) {
        const parts = [];
        let current = node;
        while (ts_morph_1.Node.isPropertyAccessExpression(current)) {
            parts.unshift(current.getName());
            current = current.getExpression();
        }
        if (ts_morph_1.Node.isIdentifier(current)) {
            parts.unshift(current.getText());
        }
        return parts.join('.');
    }
    analyzeInlineComponents(sourceFile, filePath, evidence) {
        // Find @Component decorators
        sourceFile.getClasses().forEach((classNode) => {
            const componentDecorator = classNode.getDecorator('Component');
            if (!componentDecorator)
                return;
            const arg = componentDecorator.getArguments()[0];
            if (arg?.getKind() === ts_morph_1.SyntaxKind.ObjectLiteralExpression) {
                // Check for inline template
                const templateProp = arg.getProperty('template');
                if (templateProp && ts_morph_1.Node.isPropertyAssignment(templateProp)) {
                    const initializer = templateProp.getInitializer();
                    if (ts_morph_1.Node.isStringLiteral(initializer)) {
                        const templateContent = initializer.getLiteralValue();
                        // TODO: Analyze HTML content - this would need the TemplateAnalyzer
                        // For now, we'll skip inline template analysis in MVP
                    }
                }
                // Check for inline styles
                const stylesProp = arg.getProperty('styles');
                if (stylesProp && ts_morph_1.Node.isPropertyAssignment(stylesProp)) {
                    const initializer = stylesProp.getInitializer();
                    if (ts_morph_1.Node.isArrayLiteralExpression(initializer)) {
                        initializer.getElements().forEach(element => {
                            if (ts_morph_1.Node.isStringLiteral(element)) {
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
    createEvidence(node, filePath, code, featureId) {
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
exports.TSAnalyzer = TSAnalyzer;
