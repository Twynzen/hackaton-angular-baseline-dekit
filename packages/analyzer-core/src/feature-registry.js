"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllFeatures = exports.getFeatureId = exports.FEATURE_ID_REGISTRY = void 0;
exports.FEATURE_ID_REGISTRY = new Map([
    // TypeScript/JavaScript APIs
    ['IntersectionObserver', 'api.IntersectionObserver'],
    ['document.startViewTransition', 'api.Document.startViewTransition'],
    ['navigator.clipboard', 'api.Navigator.clipboard'],
    ['Element.prototype.animate', 'api.Element.animate'],
    ['ResizeObserver', 'api.ResizeObserver'],
    ['MutationObserver', 'api.MutationObserver'],
    // HTML attributes
    ['popover', 'html.elements.div.popover'],
    ['inert', 'html.global_attributes.inert'],
    ['loading', 'html.elements.img.loading'],
    // CSS selectors
    [':has()', 'css.selectors.has'],
    [':is()', 'css.selectors.is'],
    [':where()', 'css.selectors.where'],
    // CSS properties
    ['text-wrap', 'css.properties.text-wrap'],
    ['container-query', 'css.at-rules.container'],
    ['aspect-ratio', 'css.properties.aspect-ratio'],
    ['gap', 'css.properties.gap'],
    ['grid-template-areas', 'css.properties.grid-template-areas']
]);
function getFeatureId(constructName) {
    return exports.FEATURE_ID_REGISTRY.get(constructName);
}
exports.getFeatureId = getFeatureId;
function getAllFeatures() {
    return Array.from(exports.FEATURE_ID_REGISTRY.entries()).map(([construct, featureId]) => ({
        construct,
        featureId
    }));
}
exports.getAllFeatures = getAllFeatures;
