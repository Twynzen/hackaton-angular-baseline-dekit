"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateAnalyzer = void 0;
const compiler_1 = require("@angular/compiler");
const feature_registry_1 = require("../feature-registry");
class TemplateAnalyzer {
    analyze(filePath, content) {
        const evidence = [];
        try {
            const parsed = (0, compiler_1.parseTemplate)(content, filePath, {
                preserveWhitespaces: false,
                collectCommentNodes: false
            });
            if (parsed.errors.length > 0) {
                console.warn(`Template parsing errors in ${filePath}:`, parsed.errors);
            }
            this.visitNodes(parsed.nodes, evidence, filePath, content);
        }
        catch (error) {
            console.warn(`Failed to parse Angular template ${filePath}:`, error);
        }
        return evidence;
    }
    visitNodes(nodes, evidence, filePath, content) {
        for (const node of nodes) {
            if (node instanceof compiler_1.TmplAstElement) {
                this.analyzeElement(node, evidence, filePath, content);
            }
            // Recursively visit child nodes
            if (node.children) {
                this.visitNodes(node.children, evidence, filePath, content);
            }
        }
    }
    analyzeElement(element, evidence, filePath, content) {
        // Check for HTML attributes that map to web features
        element.attributes.forEach((attr) => {
            const featureId = (0, feature_registry_1.getFeatureId)(attr.name);
            if (featureId) {
                evidence.push(this.createEvidence(attr, filePath, `${attr.name}="${attr.value}"`, featureId, content));
            }
        });
        // Check for specific elements that might indicate feature usage
        const elementFeatures = this.getElementFeatures(element.name);
        elementFeatures.forEach(({ code, featureId }) => {
            evidence.push(this.createEvidence(element, filePath, code, featureId, content));
        });
        // Check for Angular-specific attributes
        element.inputs.forEach((input) => {
            if (input.name === 'popover') {
                const featureId = (0, feature_registry_1.getFeatureId)('popover');
                if (featureId) {
                    evidence.push(this.createEvidence(input, filePath, `[popover]="${input.value}"`, featureId, content));
                }
            }
        });
    }
    getElementFeatures(elementName) {
        const features = [];
        // Check for specific HTML elements that indicate feature usage
        if (elementName === 'dialog') {
            const featureId = (0, feature_registry_1.getFeatureId)('dialog');
            if (featureId) {
                features.push({ code: `<${elementName}>`, featureId });
            }
        }
        return features;
    }
    createEvidence(node, filePath, code, featureId, content) {
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
exports.TemplateAnalyzer = TemplateAnalyzer;
