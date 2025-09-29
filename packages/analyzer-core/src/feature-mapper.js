"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureMapper = void 0;
class FeatureMapper {
    constructor(baselineProvider) {
        this.baselineProvider = baselineProvider;
    }
    mapEvidenceToDiagnostics(evidence, config) {
        const diagnostics = [];
        for (const item of evidence) {
            // Skip if feature is in allow list
            if (config.allow?.includes(item.featureId)) {
                continue;
            }
            const baselineInfo = this.baselineProvider.getBaselineStatus(item.featureId);
            const isSupported = this.baselineProvider.isBaselineSupported(item.featureId, config.target);
            if (!isSupported) {
                const severity = this.getSeverity(baselineInfo.status, config);
                const message = this.createMessage(item.featureId, baselineInfo.status, config.target);
                const suggestions = this.getSuggestions(item.featureId, baselineInfo.status);
                diagnostics.push({
                    severity,
                    message,
                    featureId: item.featureId,
                    baseline: baselineInfo.status,
                    file: item.file,
                    range: item.range,
                    suggestions
                });
            }
        }
        return diagnostics;
    }
    getSeverity(status, config) {
        if (config.strict) {
            return status === 'limited' || status === 'unknown' ? 'error' : 'warn';
        }
        switch (status) {
            case 'limited':
            case 'unknown':
                return 'warn';
            case 'newly':
                return 'info';
            default:
                return 'info';
        }
    }
    createMessage(featureId, status, target) {
        const feature = featureId.split('.').pop() || featureId;
        switch (status) {
            case 'limited':
                return `Feature '${feature}' has limited browser support and is not compatible with target '${target}'`;
            case 'unknown':
                return `Feature '${feature}' has unknown compatibility status`;
            case 'newly':
                if (target === 'widely') {
                    return `Feature '${feature}' is newly available in Baseline but target requires 'widely' available features`;
                }
                return `Feature '${feature}' is newly available but may not be compatible with target '${target}'`;
            default:
                return `Feature '${feature}' may not be compatible with target '${target}'`;
        }
    }
    getSuggestions(featureId, status) {
        const suggestions = [];
        // Provide specific suggestions based on feature
        switch (featureId) {
            case 'css.selectors.has':
                suggestions.push({
                    title: 'Use feature detection or polyfill',
                    note: 'Consider using @supports CSS feature detection or a CSS selector polyfill'
                });
                break;
            case 'css.properties.text-wrap':
                suggestions.push({
                    title: 'Use alternative CSS properties',
                    code: 'white-space: nowrap; /* fallback */',
                    note: 'Consider using traditional text wrapping properties as fallback'
                });
                break;
            case 'api.Document.startViewTransition':
                suggestions.push({
                    title: 'Add feature detection',
                    code: 'if (\'startViewTransition\' in document) { /* use API */ }',
                    note: 'Wrap the API usage in feature detection'
                });
                break;
            case 'api.IntersectionObserver':
                suggestions.push({
                    title: 'Use polyfill',
                    note: 'Consider using the IntersectionObserver polyfill for older browsers'
                });
                break;
            default:
                if (status === 'limited' || status === 'unknown') {
                    suggestions.push({
                        title: 'Consider alternative approaches',
                        note: 'Look for more widely supported alternatives or use progressive enhancement'
                    });
                }
                break;
        }
        return suggestions;
    }
}
exports.FeatureMapper = FeatureMapper;
