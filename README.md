# Angular Baseline DevKit

A comprehensive toolkit for analyzing Angular projects for baseline web compatibility, ensuring your code works across all target browsers.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Analyze your Angular project
npx baseline-devkit analyze ./my-angular-app --target widely --output json

# Use with ESLint
npm install @angular-baseline-devkit/eslint-plugin
```

## 🎬 **Quick Demo (Video Ready!)**

Want to see it in action immediately? We have a demo project ready:

```bash
# Switch to demo branch with pre-built problematic code
git checkout demo
cd demo-project

# Run analysis - expect ~15-20 compatibility warnings
npx @angular-baseline-devkit/cli analyze . --target widely
```

**What you'll see:** Warnings about `:has()` selectors, `startViewTransition()`, container queries, and more modern features with browser compatibility info and suggestions.

Perfect for presentations, videos, or testing the tool!

## 📦 MVP Components

This MVP includes:

1. **Core Analysis Engine** (`@angular-baseline-devkit/analyzer-core`)
   - TypeScript/JavaScript API detection
   - Angular template analysis
   - CSS feature detection
   - Baseline compatibility mapping

2. **ESLint Plugin** (`@angular-baseline-devkit/eslint-plugin`)
   - Rule: `baseline/use-baseline`
   - Configurable target support

3. **CLI Tool** (`@angular-baseline-devkit/cli-builder`)
   - Command: `baseline-devkit analyze`
   - JSON report generation
   - Console output

4. **JSON Reporter** (`@angular-baseline-devkit/reporters`)
   - Structured analysis reports
   - Console-friendly output

## 🎯 Supported Features

### TypeScript/JavaScript APIs
- `document.startViewTransition()` - View Transitions API
- `new IntersectionObserver()` - Intersection Observer API
- `navigator.clipboard` - Async Clipboard API
- `new ResizeObserver()` - Resize Observer API

### HTML Attributes
- `popover` - Popover API
- `inert` - Inert attribute
- `loading="lazy"` - Lazy loading

### CSS Features
- `:has()` selector
- `:is()` and `:where()` selectors
- `text-wrap: balance|pretty`
- Container queries (`@container`)
- Modern grid properties

## 🔧 Usage

### CLI Analysis

```bash
# Basic analysis
baseline-devkit analyze

# Specify target
baseline-devkit analyze --target newly
baseline-devkit analyze --target 2023

# Strict mode (treats warnings as errors)
baseline-devkit analyze --strict

# Allow specific features
baseline-devkit analyze --allow "css.selectors.has,api.Document.startViewTransition"
```

### ESLint Integration

Add to your `.eslintrc.js`:

```javascript
module.exports = {
  plugins: ['@angular-baseline-devkit/eslint-plugin'],
  rules: {
    '@angular-baseline-devkit/eslint-plugin/use-baseline': ['error', {
      target: 'widely',
      strict: false
    }]
  }
};
```

### Programmatic Usage

```typescript
import { AngularBaselineAnalyzer } from '@angular-baseline-devkit/analyzer-core';

const analyzer = new AngularBaselineAnalyzer();

const report = await analyzer.analyze({
  config: {
    target: 'widely',
    strict: false
  },
  projectRoot: './my-project'
});

console.log(`Found ${report.summary.total} compatibility issues`);
```

## 📊 Report Format

The JSON report includes:

```json
{
  "timestamp": "2025-01-01T00:00:00.000Z",
  "summary": {
    "total": 5,
    "errors": 1,
    "warnings": 3,
    "infos": 1
  },
  "diagnostics": [
    {
      "severity": "warn",
      "message": "Feature ':has()' has limited browser support",
      "featureId": "css.selectors.has",
      "file": "src/app/app.component.css",
      "range": { "start": { "line": 10, "col": 5 }, "end": { "line": 10, "col": 20 } },
      "suggestions": [
        {
          "title": "Use feature detection or polyfill",
          "note": "Consider using @supports CSS feature detection"
        }
      ]
    }
  ]
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Test specific package
cd packages/analyzer-core && npm test
```

## 🏗️ MVP Architecture

```
angular-baseline-devkit/
├── packages/
│   ├── analyzer-core/       # Core analysis engine
│   ├── eslint-plugin/       # ESLint integration
│   ├── cli-builder/         # CLI tool
│   └── reporters/           # Report generators
├── apps/
│   └── demo-angular/        # Test application
└── docs/                    # Documentation
```

## 🎯 MVP Acceptance Criteria

✅ Analyze TypeScript files for modern Web APIs
✅ Analyze HTML templates for modern attributes
✅ Analyze CSS files for modern selectors/properties
✅ Generate JSON reports with diagnostics
✅ ESLint rule integration
✅ CLI tool with configurable targets
✅ Test fixtures with expected detections

## 🔍 Example Detection

Given this Angular component:

```typescript
// app.component.ts
export class AppComponent {
  startTransition() {
    document.startViewTransition(() => {
      // This will be detected!
    });
  }
}
```

```css
/* app.component.css */
.card:has(.error) {  /* This will be detected! */
  border: red 1px solid;
}

.title {
  text-wrap: balance;  /* This will be detected! */
}
```

The analyzer will detect:
- `document.startViewTransition` → `api.Document.startViewTransition`
- `:has()` selector → `css.selectors.has`
- `text-wrap: balance` → `css.properties.text-wrap`

## 📝 Notes

This is an MVP implementation focusing on core functionality. Future iterations will add:
- VS Code extension
- More comprehensive feature detection
- Integration with Angular CLI builders
- Advanced reporting formats
- CI/CD integration