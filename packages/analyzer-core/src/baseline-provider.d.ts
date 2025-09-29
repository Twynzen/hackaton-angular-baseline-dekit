import { BaselineStatus } from './types';
export interface BaselineInfo {
    status: BaselineStatus;
    supportedBrowsers?: string[];
    year?: number;
}
export declare class BaselineProvider {
    private cache;
    getBaselineStatus(featureId: string): BaselineInfo;
    isBaselineSupported(featureId: string, target: 'widely' | 'newly' | number): boolean;
    validateFeatureIds(featureIds: string[]): {
        valid: string[];
        invalid: string[];
    };
}
