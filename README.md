# Angular Baseline DevKit

> **Prevent browser compatibility issues before they reach production**

A professional-grade toolkit that automatically analyzes Angular projects for web platform compatibility, ensuring your modern code works across all target browsers using official Baseline data.

## 🏆 **Baseline Tooling Hackathon Submission**

**The Problem**: Developers unknowingly use modern web features that break in production browsers
**Our Solution**: Automated detection and reporting of compatibility issues during development
**The Impact**: Reduced bugs, improved user experience, and confident feature adoption

---

## ⚡ **Quick Start**

```bash
# 1. Install and build
npm install && npm run build

# 2. Analyze any Angular project
npx @angular-baseline-devkit/cli analyze ./your-angular-project --target widely

# 3. Get instant compatibility feedback
✅ Compatible features  ⚠️ Limited support  ❌ Avoid for target
```

**Want to see it in action?** Try our [live demo](#-live-demo) with pre-built examples.

---

## 🎯 **Core Capabilities**

### **Multi-Layer Analysis**
- **TypeScript/JavaScript**: Detects modern APIs like `startViewTransition()`, `ResizeObserver`, clipboard access
- **Angular Templates**: Analyzes HTML attributes (`popover`, `inert`, `loading="lazy"`)
- **CSS Features**: Identifies modern selectors (`:has()`, `:is()`), properties (`text-wrap`), and queries (`@container`)

### **Smart Reporting**
- **Precise diagnostics** with file locations and line numbers
- **Actionable suggestions** for each compatibility issue
- **Configurable severity** levels (error, warning, info)
- **Multiple output formats** (CLI, JSON, ESLint integration)

### **Flexible Configuration**
- **Target audiences**: `widely` (maximum compatibility) | `newly` (modern browsers) | `2023` (year-specific)
- **Development integration**: Works with ESLint, CI/CD pipelines, and development workflows
- **Customizable rules**: Allow specific features or enforce strict compatibility

---

## 🚀 **Usage Examples**

### **Command Line Interface**

```bash
# Analyze with maximum browser compatibility
baseline-devkit analyze --target widely

# Allow modern browsers (2023+)
baseline-devkit analyze --target newly

# Generate JSON report for CI/CD
baseline-devkit analyze --output json --strict > compatibility-report.json

# Allow specific features while checking others
baseline-devkit analyze --allow "css.selectors.has" --target widely
```

### **ESLint Integration** *(Recommended for teams)*

```javascript
// .eslintrc.js
module.exports = {
  extends: ['@angular-eslint/recommended'],
  plugins: ['@angular-baseline-devkit/eslint-plugin'],
  rules: {
    '@angular-baseline-devkit/use-baseline': ['error', {
      target: 'widely',     // Enforce broad compatibility
      strict: true          // Treat warnings as errors
    }]
  }
};
```

**Result**: Real-time compatibility warnings in your IDE as you code.

### **Programmatic API**

```typescript
import { AngularBaselineAnalyzer } from '@angular-baseline-devkit/analyzer-core';

const analyzer = new AngularBaselineAnalyzer();
const report = await analyzer.analyze({
  projectRoot: './src',
  config: { target: 'widely', strict: false }
});

// Process results
report.diagnostics.forEach(issue => {
  console.log(`${issue.severity}: ${issue.message} in ${issue.file}`);
});
```

---

## 🎬 **Live Demo**

Experience the full capability with our demo project containing common compatibility issues:

```bash
git checkout demo
cd demo-project
npx @angular-baseline-devkit/cli analyze . --target widely
```

**Expected output**: 15-20 detailed warnings about `:has()` selectors, View Transitions API, container queries, and more modern features with precise browser support information.

---

## 📊 **Sample Report**

When Angular Baseline DevKit finds compatibility issues, you get detailed, actionable reports:

```json
{
  "summary": { "total": 3, "errors": 1, "warnings": 2 },
  "diagnostics": [
    {
      "severity": "error",
      "message": "CSS ':has()' selector not supported in Firefox",
      "featureId": "css.selectors.has",
      "file": "src/app/components/card.component.css",
      "range": { "start": { "line": 15, "col": 8 }, "end": { "line": 15, "col": 18 } },
      "browserSupport": {
        "chrome": "105+", "firefox": "❌", "safari": "15.4+"
      },
      "suggestions": [
        {
          "title": "Use JavaScript for element queries",
          "note": "document.querySelector('.card .active') as alternative"
        }
      ]
    }
  ]
}
```

---

## 🏗️ **Architecture**

Built as a modular monorepo for maximum flexibility:

```
angular-baseline-devkit/
├── packages/
│   ├── analyzer-core/          # Core detection engine
│   ├── cli-builder/            # Command line interface
│   ├── eslint-plugin/          # ESLint rule integration
│   └── reporters/              # Output formatting
├── apps/demo-angular/          # Live demo project
└── docs/                       # Technical documentation
```

**Data Source**: Official [web-features](https://github.com/web-platform-dx/web-features) dataset (powers MDN and Chrome DevTools)

---

## 🎯 **Supported Features** *(Current MVP)*

| **Category** | **Examples** | **Detection Level** |
|--------------|--------------|-------------------|
| **JavaScript APIs** | View Transitions, Clipboard, Observers, Payment Request | Method calls, constructors |
| **CSS Features** | `:has()`, `:is()`, `text-wrap`, `@container`, `aspect-ratio` | Selectors, properties, at-rules |
| **HTML Attributes** | `popover`, `inert`, `loading="lazy"`, `<dialog>` | Elements and attributes |

---

## 💡 **Why Angular Baseline DevKit?**

### **For Individual Developers**
- **Catch issues early**: Find compatibility problems before users do
- **Learn modern web**: Discover new features with confidence
- **IDE integration**: Get feedback directly in your editor

### **For Teams**
- **Consistent standards**: Enforce compatibility policies across projects
- **Reduced QA time**: Automated compatibility testing in CI/CD
- **Documentation**: Generate compatibility reports for stakeholders

### **For Angular Community**
- **First of its kind**: Combines Baseline data with Angular-specific analysis
- **Open source**: MIT licensed, community-driven development
- **Extensible**: Plugin architecture for custom rules and features

---

## 🔧 **Development & Testing**

```bash
# Development setup
npm install
npm run build

# Run test suite
npm test

# Test specific package
cd packages/analyzer-core && npm test

# Lint and format
npm run lint && npm run format
```

---

## 🚀 **Roadmap**

**Current MVP** ✅ Core analysis engine, CLI tool, ESLint plugin
**Phase 2** 🚧 VS Code extension, Angular CLI integration
**Phase 3** 📋 Advanced reporting, custom rule builder
**Phase 4** 🌐 Web dashboard, team collaboration features

---

## 📄 **License**

MIT License - see [LICENSE](./LICENSE) file for details.

---

## 🤝 **Contributing**

This project is part of the [Baseline Tooling Hackathon](https://baseline.devpost.com/). Contributions welcome!

**Found a bug?** [Open an issue](https://github.com/Twynzen/hackaton-angular-baseline-dekit/issues)
**Want to contribute?** Check our [contributing guidelines](./CONTRIBUTING.md)
**Questions?** Start a [discussion](https://github.com/Twynzen/hackaton-angular-baseline-dekit/discussions)

---

<div align="center">

**[Try the Demo](#-live-demo)** • **[View Source](https://github.com/Twynzen/hackaton-angular-baseline-dekit)** • **[Report Issues](https://github.com/Twynzen/hackaton-angular-baseline-dekit/issues)**

*Built with ❤️ for the Angular and web development community*

</div>