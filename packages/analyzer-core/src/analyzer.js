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
exports.AngularBaselineAnalyzer = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const glob_1 = require("glob");
const ts_analyzer_1 = require("./analyzers/ts-analyzer");
const template_analyzer_1 = require("./analyzers/template-analyzer");
const css_analyzer_1 = require("./analyzers/css-analyzer");
const baseline_provider_1 = require("./baseline-provider");
const feature_mapper_1 = require("./feature-mapper");
class AngularBaselineAnalyzer {
    constructor() {
        this.tsAnalyzer = new ts_analyzer_1.TSAnalyzer();
        this.templateAnalyzer = new template_analyzer_1.TemplateAnalyzer();
        this.cssAnalyzer = new css_analyzer_1.CSSAnalyzer();
        this.baselineProvider = new baseline_provider_1.BaselineProvider();
        this.featureMapper = new feature_mapper_1.FeatureMapper(this.baselineProvider);
    }
    async analyze(options) {
        const files = options.files || await this.findFiles(options.projectRoot);
        const evidence = [];
        // Process files concurrently with controlled concurrency
        const maxConcurrency = options.maxConcurrency || require('os').cpus().length;
        const batches = this.chunkArray(files, maxConcurrency);
        for (const batch of batches) {
            const batchPromises = batch.map(file => this.analyzeFile(file, options));
            const batchResults = await Promise.all(batchPromises);
            evidence.push(...batchResults.flat());
        }
        // Map evidence to diagnostics
        const diagnostics = this.featureMapper.mapEvidenceToDiagnostics(evidence, options.config);
        // Generate summary
        const summary = {
            total: diagnostics.length,
            errors: diagnostics.filter(d => d.severity === 'error').length,
            warnings: diagnostics.filter(d => d.severity === 'warn').length,
            infos: diagnostics.filter(d => d.severity === 'info').length
        };
        return {
            summary,
            evidence,
            diagnostics,
            config: options.config
        };
    }
    async findFiles(projectRoot) {
        const patterns = [
            'src/**/*.ts',
            'src/**/*.html',
            'src/**/*.css',
            'src/**/*.scss'
        ];
        const allFiles = [];
        for (const pattern of patterns) {
            try {
                const files = await (0, glob_1.glob)(pattern, {
                    cwd: projectRoot,
                    absolute: true,
                    ignore: [
                        '**/node_modules/**',
                        '**/dist/**',
                        '**/*.spec.ts',
                        '**/*.test.ts'
                    ]
                });
                allFiles.push(...files);
            }
            catch (error) {
                console.warn(`Failed to find files with pattern ${pattern}:`, error);
            }
        }
        return [...new Set(allFiles)]; // Remove duplicates
    }
    async analyzeFile(filePath, options) {
        try {
            // Check file size limit
            if (options.maxFileSize) {
                const stats = await fs.promises.stat(filePath);
                if (stats.size > options.maxFileSize) {
                    console.warn(`Skipping large file ${filePath} (${stats.size} bytes)`);
                    return [];
                }
            }
            const content = await fs.promises.readFile(filePath, 'utf8');
            const ext = path.extname(filePath).toLowerCase();
            switch (ext) {
                case '.ts':
                    return this.tsAnalyzer.analyze(filePath, content);
                case '.html':
                    return this.templateAnalyzer.analyze(filePath, content);
                case '.css':
                case '.scss':
                    return this.cssAnalyzer.analyze(filePath, content);
                default:
                    return [];
            }
        }
        catch (error) {
            console.warn(`Failed to analyze file ${filePath}:`, error);
            return [];
        }
    }
    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
    // Validation method to check feature registry against web-features
    validateFeatureRegistry() {
        const { getAllFeatures } = require('./feature-registry');
        const features = getAllFeatures();
        const featureIds = features.map(f => f.featureId);
        return this.baselineProvider.validateFeatureIds(featureIds);
    }
}
exports.AngularBaselineAnalyzer = AngularBaselineAnalyzer;
