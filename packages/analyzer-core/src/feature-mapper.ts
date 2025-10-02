import { FeatureEvidence, Diagnostic, BaselineConfig, BaselineStatus } from './types';
import { BaselineProvider } from './baseline-provider';

export class FeatureMapper {
  constructor(private baselineProvider: BaselineProvider) {}

  async mapEvidenceToDiagnostics(evidence: FeatureEvidence[], config: BaselineConfig): Promise<Diagnostic[]> {
    const diagnostics: Diagnostic[] = [];

    for (const item of evidence) {
      // Skip if feature is in allow list
      if (config.allow?.includes(item.featureId)) {
        continue;
      }

      const baselineInfo = await this.baselineProvider.getBaselineStatus(item.featureId);
      const isSupported = await this.baselineProvider.isBaselineSupported(item.featureId, config.target);

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

  private getSeverity(status: BaselineStatus, config: BaselineConfig): 'error' | 'warn' | 'info' {
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

  private createMessage(featureId: string, status: BaselineStatus, target: 'widely' | 'newly' | number): string {
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

  private getSuggestions(featureId: string, status: BaselineStatus): Array<{ title: string; code?: string; note?: string }> {
    const suggestions: Array<{ title: string; code?: string; note?: string }> = [];

    // Provide specific suggestions based on feature category and ID

    // CSS SELECTORS
    if (featureId === 'css.selectors.has') {
      suggestions.push({
        title: 'Use @supports feature detection',
        code: '@supports selector(:has(*)) { /* your styles */ }',
        note: 'Wrap :has() selectors in @supports for graceful degradation'
      });
    } else if (featureId === 'css.selectors.focus-visible') {
      suggestions.push({
        title: 'Use :focus as fallback',
        code: ':focus { /* fallback */ }\n:focus-visible { /* enhanced */ }',
        note: 'Progressive enhancement with standard :focus'
      });
    }

    // CSS PROPERTIES
    else if (featureId === 'css.properties.text-wrap') {
      suggestions.push({
        title: 'Use overflow-wrap as fallback',
        code: 'overflow-wrap: break-word;\ntext-wrap: balance;',
        note: 'Provide traditional overflow handling'
      });
    } else if (featureId === 'css.properties.aspect-ratio') {
      suggestions.push({
        title: 'Use padding-bottom technique',
        code: 'padding-bottom: 56.25%; /* 16:9 aspect ratio */',
        note: 'Classic padding hack works in all browsers'
      });
    } else if (featureId === 'css.properties.backdrop-filter') {
      suggestions.push({
        title: 'Provide solid background fallback',
        code: 'background: rgba(255,255,255,0.95);\nbackdrop-filter: blur(10px);',
        note: 'Use semi-transparent background for browsers without backdrop-filter'
      });
    } else if (featureId.startsWith('css.properties.container')) {
      suggestions.push({
        title: 'Use media queries as fallback',
        code: '@media (min-width: 768px) { /* styles */ }',
        note: 'Container queries not widely supported; use viewport-based media queries'
      });
    }

    // JAVASCRIPT APIs - Observers
    else if (featureId === 'api.IntersectionObserver') {
      suggestions.push({
        title: 'Use polyfill or feature detection',
        code: 'if (\'IntersectionObserver\' in window) { /* use it */ }',
        note: 'w3c/IntersectionObserver polyfill available on npm'
      });
    } else if (featureId === 'api.ResizeObserver') {
      suggestions.push({
        title: 'Use resize event as fallback',
        code: 'window.addEventListener(\'resize\', handler);',
        note: 'Less performant but more compatible'
      });
    }

    // JAVASCRIPT APIs - Modern Features
    else if (featureId === 'api.Document.startViewTransition') {
      suggestions.push({
        title: 'Add feature detection',
        code: 'if (\'startViewTransition\' in document) {\n  document.startViewTransition(() => {});\n} else {\n  // instant update\n}',
        note: 'Gracefully degrade to instant updates'
      });
    } else if (featureId === 'api.structuredClone') {
      suggestions.push({
        title: 'Use JSON.parse/stringify fallback',
        code: 'const clone = structuredClone ? structuredClone(obj) : JSON.parse(JSON.stringify(obj));',
        note: 'JSON method works for simple objects'
      });
    } else if (featureId === 'api.Window.requestIdleCallback') {
      suggestions.push({
        title: 'Use setTimeout as fallback',
        code: 'const rIC = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));',
        note: 'setTimeout provides basic deferral'
      });
    }

    // NAVIGATOR APIs
    else if (featureId === 'api.Navigator.clipboard') {
      suggestions.push({
        title: 'Use execCommand as fallback',
        code: 'if (navigator.clipboard) {\n  navigator.clipboard.writeText(text);\n} else {\n  document.execCommand(\'copy\');\n}',
        note: 'execCommand is deprecated but widely supported'
      });
    } else if (featureId === 'api.Navigator.share') {
      suggestions.push({
        title: 'Provide manual share buttons',
        note: 'Show Twitter/Facebook share buttons when Web Share API unavailable'
      });
    }

    // STORAGE APIs
    else if (featureId.includes('localStorage') || featureId.includes('sessionStorage')) {
      suggestions.push({
        title: 'Use try-catch with fallback',
        code: 'try {\n  localStorage.setItem(key, value);\n} catch {\n  // in-memory fallback\n}',
        note: 'Storage can fail in private browsing mode'
      });
    }

    // HTML ELEMENTS & ATTRIBUTES
    else if (featureId === 'html.elements.dialog') {
      suggestions.push({
        title: 'Use dialog polyfill',
        note: 'GoogleChrome/dialog-polyfill provides good compatibility'
      });
    } else if (featureId.includes('popover')) {
      suggestions.push({
        title: 'Use JavaScript show/hide',
        code: 'element.classList.toggle(\'visible\');',
        note: 'Implement popover with CSS classes and JavaScript'
      });
    }

    // FETCH & NETWORK
    else if (featureId === 'api.fetch') {
      suggestions.push({
        title: 'Use fetch polyfill',
        note: 'whatwg-fetch polyfill works in older browsers'
      });
    } else if (featureId === 'api.AbortController') {
      suggestions.push({
        title: 'Handle cancellation manually',
        note: 'Use custom cancellation tokens for older browsers'
      });
    }

    // DEFAULT SUGGESTIONS
    else {
      if (status === 'limited') {
        suggestions.push({
          title: 'Provide fallback or polyfill',
          note: 'This feature has limited browser support. Consider alternatives or progressive enhancement.'
        });
      } else if (status === 'newly') {
        suggestions.push({
          title: 'Use feature detection',
          code: 'if (\'feature\' in object) { /* use it */ }',
          note: 'Wrap usage in feature detection for broader compatibility'
        });
      } else if (status === 'unknown') {
        suggestions.push({
          title: 'Verify browser support',
          note: 'Check MDN or caniuse.com for compatibility information'
        });
      }
    }

    return suggestions;
  }
}