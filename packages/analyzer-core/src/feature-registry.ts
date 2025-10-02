export const FEATURE_ID_REGISTRY: Map<string, string> = new Map([
  // ==========================================
  // JAVASCRIPT/TYPESCRIPT APIs (Observers)
  // ==========================================
  ['IntersectionObserver', 'api.IntersectionObserver'],
  ['ResizeObserver', 'api.ResizeObserver'],
  ['MutationObserver', 'api.MutationObserver'],
  ['PerformanceObserver', 'api.PerformanceObserver'],

  // ==========================================
  // DOM & DOCUMENT APIs
  // ==========================================
  ['document.startViewTransition', 'api.Document.startViewTransition'],
  ['Element.prototype.animate', 'api.Element.animate'],
  ['Element.prototype.scrollIntoView', 'api.Element.scrollIntoView'],
  ['document.querySelector', 'api.Document.querySelector'],
  ['document.querySelectorAll', 'api.Document.querySelectorAll'],
  ['requestIdleCallback', 'api.Window.requestIdleCallback'],
  ['structuredClone', 'api.structuredClone'],
  ['queueMicrotask', 'api.queueMicrotask'],

  // ==========================================
  // WEB STORAGE & DATA APIs
  // ==========================================
  ['navigator.clipboard', 'api.Navigator.clipboard'],
  ['localStorage', 'api.Window.localStorage'],
  ['sessionStorage', 'api.Window.sessionStorage'],
  ['IndexedDB', 'api.IDBFactory'],
  ['Cache', 'api.Cache'],
  ['CacheStorage', 'api.CacheStorage'],

  // ==========================================
  // NAVIGATOR & DEVICE APIs
  // ==========================================
  ['navigator.share', 'api.Navigator.share'],
  ['navigator.vibrate', 'api.Navigator.vibrate'],
  ['navigator.getBattery', 'api.Navigator.getBattery'],
  ['navigator.mediaDevices.getUserMedia', 'api.MediaDevices.getUserMedia'],
  ['navigator.geolocation', 'api.Geolocation'],
  ['navigator.onLine', 'api.Navigator.onLine'],
  ['navigator.serviceWorker', 'api.Navigator.serviceWorker'],

  // ==========================================
  // WEB COMPONENTS & CUSTOM ELEMENTS
  // ==========================================
  ['customElements.define', 'api.CustomElementRegistry.define'],
  ['ShadowRoot', 'api.ShadowRoot'],
  ['HTMLSlotElement', 'api.HTMLSlotElement'],
  ['attachShadow', 'api.Element.attachShadow'],

  // ==========================================
  // FETCH & NETWORK APIs
  // ==========================================
  ['fetch', 'api.fetch'],
  ['Request', 'api.Request'],
  ['Response', 'api.Response'],
  ['Headers', 'api.Headers'],
  ['AbortController', 'api.AbortController'],
  ['WebSocket', 'api.WebSocket'],

  // ==========================================
  // GRAPHICS & CANVAS APIs
  // ==========================================
  ['OffscreenCanvas', 'api.OffscreenCanvas'],
  ['ImageBitmap', 'api.ImageBitmap'],
  ['createImageBitmap', 'api.createImageBitmap'],
  ['requestAnimationFrame', 'api.Window.requestAnimationFrame'],

  // ==========================================
  // AUDIO & VIDEO APIs
  // ==========================================
  ['HTMLMediaElement', 'api.HTMLMediaElement'],
  ['HTMLVideoElement', 'api.HTMLVideoElement'],
  ['HTMLAudioElement', 'api.HTMLAudioElement'],
  ['MediaRecorder', 'api.MediaRecorder'],
  ['AudioContext', 'api.AudioContext'],

  // ==========================================
  // FORM & INPUT APIs
  // ==========================================
  ['FormData', 'api.FormData'],
  ['URLSearchParams', 'api.URLSearchParams'],
  ['ValidityState', 'api.ValidityState'],

  // ==========================================
  // CRYPTO & SECURITY APIs
  // ==========================================
  ['crypto.randomUUID', 'api.Crypto.randomUUID'],
  ['crypto.subtle', 'api.SubtleCrypto'],

  // ==========================================
  // PERFORMANCE & TIMING APIs
  // ==========================================
  ['performance.now', 'api.Performance.now'],
  ['PerformanceNavigationTiming', 'api.PerformanceNavigationTiming'],

  // ==========================================
  // HTML ELEMENTS & ATTRIBUTES
  // ==========================================
  ['popover', 'html.elements.div.popover'],
  ['inert', 'html.global_attributes.inert'],
  ['loading', 'html.elements.img.loading'],
  ['dialog', 'html.elements.dialog'],
  ['details', 'html.elements.details'],
  ['summary', 'html.elements.summary'],
  ['contenteditable', 'html.global_attributes.contenteditable'],
  ['enterkeyhint', 'html.global_attributes.enterkeyhint'],
  ['inputmode', 'html.global_attributes.inputmode'],
  ['hidden', 'html.global_attributes.hidden'],
  ['draggable', 'html.global_attributes.draggable'],

  // ==========================================
  // CSS SELECTORS (Pseudo-classes)
  // ==========================================
  [':has()', 'css.selectors.has'],
  [':is()', 'css.selectors.is'],
  [':where()', 'css.selectors.where'],
  [':not()', 'css.selectors.not'],
  [':focus-visible', 'css.selectors.focus-visible'],
  [':focus-within', 'css.selectors.focus-within'],
  [':placeholder-shown', 'css.selectors.placeholder-shown'],
  [':target', 'css.selectors.target'],
  [':empty', 'css.selectors.empty'],
  [':first-child', 'css.selectors.first-child'],
  [':last-child', 'css.selectors.last-child'],
  [':only-child', 'css.selectors.only-child'],

  // ==========================================
  // CSS LAYOUT PROPERTIES
  // ==========================================
  ['aspect-ratio', 'css.properties.aspect-ratio'],
  ['gap', 'css.properties.gap'],
  ['row-gap', 'css.properties.row-gap'],
  ['column-gap', 'css.properties.column-gap'],
  ['place-items', 'css.properties.place-items'],
  ['place-content', 'css.properties.place-content'],
  ['place-self', 'css.properties.place-self'],
  ['inset', 'css.properties.inset'],
  ['block-size', 'css.properties.block-size'],
  ['inline-size', 'css.properties.inline-size'],
  ['grid-template-areas', 'css.properties.grid-template-areas'],
  ['grid-template-columns', 'css.properties.grid-template-columns'],
  ['grid-template-rows', 'css.properties.grid-template-rows'],

  // ==========================================
  // CSS VISUAL PROPERTIES
  // ==========================================
  ['backdrop-filter', 'css.properties.backdrop-filter'],
  ['mix-blend-mode', 'css.properties.mix-blend-mode'],
  ['clip-path', 'css.properties.clip-path'],
  ['mask-image', 'css.properties.mask-image'],
  ['object-fit', 'css.properties.object-fit'],
  ['object-position', 'css.properties.object-position'],
  ['filter', 'css.properties.filter'],
  ['opacity', 'css.properties.opacity'],

  // ==========================================
  // CSS SCROLLING & OVERFLOW
  // ==========================================
  ['scroll-behavior', 'css.properties.scroll-behavior'],
  ['overscroll-behavior', 'css.properties.overscroll-behavior'],
  ['scroll-snap-type', 'css.properties.scroll-snap-type'],
  ['scroll-snap-align', 'css.properties.scroll-snap-align'],
  ['overflow-anchor', 'css.properties.overflow-anchor'],

  // ==========================================
  // CSS TYPOGRAPHY
  // ==========================================
  ['text-wrap', 'css.properties.text-wrap'],
  ['text-decoration-thickness', 'css.properties.text-decoration-thickness'],
  ['text-underline-offset', 'css.properties.text-underline-offset'],
  ['line-clamp', 'css.properties.line-clamp'],
  ['font-variant-caps', 'css.properties.font-variant-caps'],
  ['font-variant-numeric', 'css.properties.font-variant-numeric'],
  ['text-overflow', 'css.properties.text-overflow'],
  ['word-break', 'css.properties.word-break'],

  // ==========================================
  // CSS CONTAINER QUERIES
  // ==========================================
  ['container-query', 'css.at-rules.container'],
  ['container-type', 'css.properties.container-type'],
  ['container-name', 'css.properties.container-name'],
  ['container', 'css.properties.container'],

  // ==========================================
  // CSS FUNCTIONS
  // ==========================================
  ['clamp()', 'css.types.clamp'],
  ['min()', 'css.types.min'],
  ['max()', 'css.types.max'],
  ['calc()', 'css.types.calc'],
  ['var()', 'css.properties.custom-property'],

  // ==========================================
  // CSS TRANSFORMS & ANIMATIONS
  // ==========================================
  ['transform', 'css.properties.transform'],
  ['translate', 'css.properties.translate'],
  ['rotate', 'css.properties.rotate'],
  ['scale', 'css.properties.scale'],
  ['animation', 'css.properties.animation'],
  ['transition', 'css.properties.transition'],

  // ==========================================
  // CSS MEDIA QUERIES
  // ==========================================
  ['prefers-color-scheme', 'css.at-rules.media.prefers-color-scheme'],
  ['prefers-reduced-motion', 'css.at-rules.media.prefers-reduced-motion'],
  ['prefers-contrast', 'css.at-rules.media.prefers-contrast']
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