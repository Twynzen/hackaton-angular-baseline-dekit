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
exports.CSSAnalyzer = void 0;
const postcss = __importStar(require("postcss"));
const css_tree_1 = require("css-tree");
const feature_registry_1 = require("../feature-registry");
class CSSAnalyzer {
    analyze(filePath, content) {
        const evidence = [];
        try {
            // Use css-tree for parsing and analysis
            const ast = (0, css_tree_1.parse)(content, {
                parseValue: false,
                parseAtrulePrelude: false
            });
            (0, css_tree_1.walk)(ast, (node, item, list) => {
                this.analyzeNode(node, evidence, filePath, content);
            });
        }
        catch (error) {
            console.warn(`Failed to parse CSS file ${filePath}:`, error);
            // Fallback to PostCSS for better error handling
            try {
                const root = postcss.parse(content);
                this.analyzeWithPostCSS(root, evidence, filePath, content);
            }
            catch (postcssError) {
                console.warn(`PostCSS also failed to parse ${filePath}:`, postcssError);
            }
        }
        return evidence;
    }
    analyzeNode(node, evidence, filePath, content) {
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
    analyzeSelector(node, evidence, filePath, content) {
        const selectorText = (0, css_tree_1.generate)(node);
        // Check for modern selectors
        const modernSelectors = [':has(', ':is(', ':where(', ':not('];
        for (const selector of modernSelectors) {
            if (selectorText.includes(selector)) {
                const featureId = (0, feature_registry_1.getFeatureId)(selector.replace('(', '()'));
                if (featureId) {
                    evidence.push(this.createEvidence(node, filePath, selectorText, featureId, content));
                }
            }
        }
    }
    analyzeDeclaration(node, evidence, filePath, content) {
        const property = node.property;
        const value = (0, css_tree_1.generate)(node.value);
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
            const featureId = (0, feature_registry_1.getFeatureId)(featureKey);
            if (featureId) {
                evidence.push(this.createEvidence(node, filePath, `${property}: ${value}`, featureId, content));
            }
        }
    }
    analyzeAtRule(node, evidence, filePath, content) {
        const ruleName = node.name;
        // Check for modern at-rules
        if (ruleName === 'container') {
            const featureId = (0, feature_registry_1.getFeatureId)('container-query');
            if (featureId) {
                const ruleText = `@${ruleName}`;
                evidence.push(this.createEvidence(node, filePath, ruleText, featureId, content));
            }
        }
    }
    analyzeWithPostCSS(root, evidence, filePath, content) {
        root.walkRules(rule => {
            // Analyze selectors
            if (rule.selector.includes(':has(') || rule.selector.includes(':is(') || rule.selector.includes(':where(')) {
                const selectorFeatures = [':has()', ':is()', ':where()'];
                for (const selector of selectorFeatures) {
                    if (rule.selector.includes(selector.replace('()', '('))) {
                        const featureId = (0, feature_registry_1.getFeatureId)(selector);
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
                const featureId = (0, feature_registry_1.getFeatureId)(decl.prop);
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
            const featureId = (0, feature_registry_1.getFeatureId)('container-query');
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
    createEvidence(node, filePath, code, featureId, content) {
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
    getPositionFromNode(node, content) {
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
    getPositionFromPostCSS(node, content) {
        const start = node.source?.start || { line: 1, column: 1 };
        const end = node.source?.end || { line: 1, column: 1 };
        return {
            start: { line: start.line, col: start.column },
            end: { line: end.line, col: end.column }
        };
    }
}
exports.CSSAnalyzer = CSSAnalyzer;
