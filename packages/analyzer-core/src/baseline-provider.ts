import features from 'web-features';
import { BaselineStatus } from './types';

export interface BaselineInfo {
  status: BaselineStatus;
  supportedBrowsers?: string[];
  year?: number;
}

export class BaselineProvider {
  private cache = new Map<string, BaselineInfo>();

  getBaselineStatus(featureId: string): BaselineInfo {
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

  isBaselineSupported(featureId: string, target: 'widely' | 'newly' | number): boolean {
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

  validateFeatureIds(featureIds: string[]): { valid: string[]; invalid: string[] } {
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