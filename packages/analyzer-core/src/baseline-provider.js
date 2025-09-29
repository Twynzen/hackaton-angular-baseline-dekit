"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaselineProvider = void 0;
const web_features_1 = require("web-features");
class BaselineProvider {
    constructor() {
        this.cache = new Map();
    }
    getBaselineStatus(featureId) {
        if (this.cache.has(featureId)) {
            return this.cache.get(featureId);
        }
        const feature = web_features_1.features[featureId];
        if (!feature) {
            const result = { status: 'unknown' };
            this.cache.set(featureId, result);
            return result;
        }
        let status = 'unknown';
        if (feature.status?.baseline === 'high') {
            status = 'widely';
        }
        else if (feature.status?.baseline === 'low') {
            status = 'newly';
        }
        else if (feature.status?.baseline === false) {
            status = 'limited';
        }
        const result = {
            status,
            supportedBrowsers: feature.status?.supported ? Object.keys(feature.status.supported) : undefined,
            year: feature.status?.baseline_low_date ? new Date(feature.status.baseline_low_date).getFullYear() : undefined
        };
        this.cache.set(featureId, result);
        return result;
    }
    isBaselineSupported(featureId, target) {
        const info = this.getBaselineStatus(featureId);
        if (typeof target === 'number') {
            return info.year ? info.year <= target : false;
        }
        switch (target) {
            case 'widely':
                return info.status === 'widely';
            case 'newly':
                return info.status === 'widely' || info.status === 'newly';
            default:
                return false;
        }
    }
    validateFeatureIds(featureIds) {
        const valid = [];
        const invalid = [];
        for (const featureId of featureIds) {
            if (web_features_1.features[featureId]) {
                valid.push(featureId);
            }
            else {
                invalid.push(featureId);
            }
        }
        return { valid, invalid };
    }
}
exports.BaselineProvider = BaselineProvider;
