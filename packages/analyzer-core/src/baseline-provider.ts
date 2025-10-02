import { BaselineStatus } from './types.js';

export interface BaselineInfo {
  status: BaselineStatus;
  supportedBrowsers?: string[];
  year?: number;
}

let features: any = null;

async function loadWebFeatures() {
  if (!features) {
    // Use Function constructor to prevent TypeScript from transforming import()
    const dynamicImport = new Function('specifier', 'return import(specifier)');
    const mod = await dynamicImport('web-features');
    features = mod.default || mod;
  }
  return features;
}

export class BaselineProvider {
  private cache = new Map<string, BaselineInfo>();
  private featuresLoaded = false;

  async ensureFeaturesLoaded() {
    if (!this.featuresLoaded) {
      await loadWebFeatures();
      this.featuresLoaded = true;
    }
  }

  async getBaselineStatus(featureId: string): Promise<BaselineInfo> {
    await this.ensureFeaturesLoaded();

    if (this.cache.has(featureId)) {
      return this.cache.get(featureId)!;
    }

    const feature = features[featureId];
    if (!feature) {
      const result = { status: 'unknown' as BaselineStatus };
      this.cache.set(featureId, result);
      return result;
    }

    let status: BaselineStatus = 'unknown';

    if (feature.status?.baseline === 'high') {
      status = 'widely';
    } else if (feature.status?.baseline === 'low') {
      status = 'newly';
    } else if (feature.status?.baseline === false) {
      status = 'limited';
    }

    const result: BaselineInfo = {
      status,
      supportedBrowsers: feature.status?.support ? Object.keys(feature.status.support) : undefined,
      year: feature.status?.baseline_low_date ? new Date(feature.status.baseline_low_date).getFullYear() : undefined
    };

    this.cache.set(featureId, result);
    return result;
  }

  async isBaselineSupported(featureId: string, target: 'widely' | 'newly' | number): Promise<boolean> {
    const info = await this.getBaselineStatus(featureId);

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

  async validateFeatureIds(featureIds: string[]): Promise<{ valid: string[]; invalid: string[] }> {
    await this.ensureFeaturesLoaded();

    const valid: string[] = [];
    const invalid: string[] = [];

    for (const featureId of featureIds) {
      if (features[featureId]) {
        valid.push(featureId);
      } else {
        invalid.push(featureId);
      }
    }

    return { valid, invalid };
  }
}