export const FEATURE_ID_REGISTRY: Map<string, string> = new Map([
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

export function getFeatureId(constructName: string): string | undefined {
  return FEATURE_ID_REGISTRY.get(constructName);
}

export function getAllFeatures(): Array<{ construct: string; featureId: string }> {
  return Array.from(FEATURE_ID_REGISTRY.entries()).map(([construct, featureId]) => ({
    construct,
    featureId
  }));
}