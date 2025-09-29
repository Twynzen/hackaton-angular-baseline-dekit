export declare const FEATURE_ID_REGISTRY: Map<string, string>;
export declare function getFeatureId(constructName: string): string | undefined;
export declare function getAllFeatures(): Array<{
    construct: string;
    featureId: string;
}>;
