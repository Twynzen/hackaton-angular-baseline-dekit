import { ESLintUtils } from '@typescript-eslint/utils';
import { TSAnalyzer, BaselineProvider, FeatureMapper, BaselineConfig } from '@angular-baseline-devkit/analyzer-core';

const createRule = ESLintUtils.RuleCreator(
  name => `https://github.com/angular-baseline-devkit/eslint-plugin#${name}`
);

export const useBaseline = createRule({
  name: 'use-baseline',
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce baseline-compatible web features usage',
      recommended: 'error'
    },
    fixable: undefined,
    schema: [
      {
        type: 'object',
        properties: {
          target: {
            oneOf: [
              { enum: ['widely', 'newly'] },
              { type: 'number', minimum: 2020 }
            ]
          },
          strict: {
            type: 'boolean'
          },
          allow: {
            type: 'array',
            items: { type: 'string' }
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      baselineViolation: '{{message}}',
      baselineViolationWithSuggestion: '{{message}}. {{suggestion}}'
    }
  },
  defaultOptions: [{ target: 'widely' }],
  create(context, [options]) {
    const config: BaselineConfig = {
      target: options.target || 'widely',
      strict: options.strict || false,
      allow: options.allow || []
    };

    const tsAnalyzer = new TSAnalyzer();
    const baselineProvider = new BaselineProvider();
    const featureMapper = new FeatureMapper(baselineProvider);

    return {
      Program(node) {
        try {
          const sourceCode = context.getSourceCode();
          const filename = context.getFilename();
          const text = sourceCode.getText();

          // Analyze the current file
          const evidence = tsAnalyzer.analyze(filename, text);
          const diagnostics = featureMapper.mapEvidenceToDiagnostics(evidence, config);

          // Report each diagnostic as an ESLint error/warning
          for (const diagnostic of diagnostics) {
            const loc = {
              start: {
                line: diagnostic.range.start.line,
                column: diagnostic.range.start.col
              },
              end: {
                line: diagnostic.range.end.line,
                column: diagnostic.range.end.col
              }
            };

            let message = diagnostic.message;
            if (diagnostic.suggestions && diagnostic.suggestions.length > 0) {
              const suggestion = diagnostic.suggestions[0];
              message += `. Suggestion: ${suggestion.title}`;
              if (suggestion.note) {
                message += ` (${suggestion.note})`;
              }
            }

            context.report({
              node,
              loc,
              messageId: diagnostic.suggestions?.length
                ? 'baselineViolationWithSuggestion'
                : 'baselineViolation',
              data: {
                message: diagnostic.message,
                suggestion: diagnostic.suggestions?.[0]?.title || ''
              }
            });
          }
        } catch (error) {
          // Silently ignore analysis errors in ESLint context
          console.warn('ESLint baseline rule analysis failed:', error);
        }
      }
    };
  }
});