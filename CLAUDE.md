# 🤖 **CLAUDE.md - Developer & AI Assistant Guide**

## 🎯 **About This Document**

This document serves as a comprehensive guide for:
- **Human developers** who clone this repository
- **AI assistants** (Claude, GPT, etc.) working with this codebase
- **Contributors** looking to extend the project

This is an **open source project powered by Claude** that provides automated browser compatibility analysis for Angular applications.

---

## 🏗️ **Project Overview**

**Angular Baseline DevKit** is a professional-grade monorepo that analyzes Angular projects for web platform compatibility issues using official Baseline data from the `web-features` package.

### **🎯 Core Mission**
Help Angular developers avoid browser compatibility issues by detecting modern web features that might not work across all target browsers.

### **🏆 Hackathon Context**
This project was created for the [Baseline Tooling Hackathon](https://baseline.devpost.com/) to demonstrate innovative use of Baseline data in developer tooling.

---

## 📦 **Architecture Deep Dive**

### **Monorepo Structure**
```
angular-baseline-devkit/
├── packages/                           # Core toolkit packages
│   ├── analyzer-core/                 # Main analysis engine
│   │   ├── src/analyzer.ts           # Orchestrates all analyzers
│   │   ├── src/analyzers/            # Specific file type analyzers
│   │   │   ├── ts-analyzer.ts        # TypeScript/JavaScript analysis
│   │   │   ├── template-analyzer.ts  # Angular template analysis
│   │   │   └── css-analyzer.ts       # CSS feature analysis
│   │   ├── src/baseline-provider.ts  # Baseline data interface
│   │   ├── src/feature-mapper.ts     # Maps features to diagnostics
│   │   └── src/types.ts             # TypeScript interfaces
│   │
│   ├── cli-builder/                  # Command line interface
│   │   └── src/cli.ts               # CLI implementation
│   │
│   ├── eslint-plugin-angular-baseline/ # ESLint integration
│   │   └── src/rules/use-baseline.ts   # ESLint rule implementation
│   │
│   └── reporters/                    # Output formatting
│       └── src/json-reporter.ts     # JSON report generation
│
├── apps/
│   └── demo-angular/                 # Example Angular application
│       └── src/app/                 # Contains intentionally problematic code
│
├── demo-project/                     # Additional demo files
│   └── src/app/                     # More compatibility test cases
│
└── docs/                            # Technical documentation
```

### **🔄 Analysis Flow**
1. **Input**: Angular project directory
2. **Discovery**: Find .ts, .html, .css files
3. **Analysis**: Parse and detect modern web features
4. **Mapping**: Cross-reference with web-features database
5. **Reporting**: Generate diagnostic reports with suggestions

---

## 🛠️ **Development Guide**

### **Prerequisites**
- Node.js 18.0.0+
- npm 8.0.0+
- TypeScript 5.0.0+

### **Quick Setup**
```bash
# Clone and install
git clone https://github.com/Twynzen/hackaton-angular-baseline-dekit.git
cd angular-baseline-devkit
npm install

# Build all packages
npm run build

# Test the tool
npx @angular-baseline-devkit/cli analyze ./demo-project
```

### **Package Development**

#### **Adding New Feature Detection**

1. **Update Feature Registry** (`packages/analyzer-core/src/feature-registry.ts`):
```typescript
export const FEATURE_PATTERNS = {
  // Add your pattern here
  'api.CustomAPI.method': {
    pattern: /CustomAPI\.method\s*\(/g,
    type: 'javascript',
    description: 'Custom API method detection'
  }
};
```

2. **Extend Appropriate Analyzer**:
- **JavaScript/TypeScript**: `packages/analyzer-core/src/analyzers/ts-analyzer.ts`
- **HTML Templates**: `packages/analyzer-core/src/analyzers/template-analyzer.ts`
- **CSS**: `packages/analyzer-core/src/analyzers/css-analyzer.ts`

3. **Add Test Cases** in `packages/analyzer-core/test/fixtures/`

#### **Creating New Output Formats**

1. **Create Reporter** in `packages/reporters/src/`:
```typescript
export class CustomReporter {
  generate(report: AnalysisReport): string {
    // Your formatting logic
  }
}
```

2. **Update CLI** to support new format in `packages/cli-builder/src/cli.ts`

---

## 🤖 **AI Assistant Instructions**

### **When Working with This Codebase**

1. **Understand the Context**: This is a compatibility analysis tool, not a typical Angular app
2. **Respect the MVP Scope**: Focus on core functionality over feature creep
3. **Maintain TypeScript Standards**: Always use proper typing
4. **Follow Monorepo Patterns**: Each package has specific responsibilities
5. **Test Against Real Cases**: Use `demo-project/` for testing changes

### **Common Tasks & Patterns**

#### **Adding Feature Detection**
- **Always update** `feature-registry.ts` first
- **Write tests** in `test/fixtures/`
- **Verify with** `web-features` database for accuracy

#### **Debugging Analysis Issues**
- Check `baseline-provider.ts` for data mapping
- Verify regex patterns in feature registry
- Test with `demo-project/` known problematic code

#### **Extending Reports**
- Start with `types.ts` interface definitions
- Implement in appropriate reporter
- Update CLI to expose new options

### **Code Quality Standards**
```typescript
// ✅ Good: Proper typing and error handling
async analyzeFile(filePath: string): Promise<FeatureEvidence[]> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return this.parseContent(content, filePath);
  } catch (error) {
    console.warn(`Failed to analyze ${filePath}:`, error);
    return [];
  }
}

// ❌ Bad: No error handling or typing
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath);
  return parseContent(content);
}
```

---

## 🧪 **Testing Strategy**

### **Test Pyramid**
1. **Unit Tests**: Individual analyzer functions
2. **Integration Tests**: Full analysis pipeline
3. **Fixture Tests**: Known problematic code samples
4. **CLI Tests**: Command-line interface

### **Running Tests**
```bash
# All tests
npm test

# Specific package
cd packages/analyzer-core && npm test

# With coverage
npm run test:coverage
```

### **Test Data**
The `test/fixtures/` directory contains real-world examples of problematic code:
- `view-transitions.ts` - View Transitions API usage
- `has.css` - CSS :has() selector usage
- `popover.html` - HTML popover attribute

---

## 🌟 **Contributing Guidelines**

### **For Human Contributors**

1. **Fork & Branch**: Create feature branches from `master`
2. **Follow Conventions**: Use existing code style and patterns
3. **Add Tests**: Every new feature needs test coverage
4. **Update Docs**: Document new functionality
5. **PR Process**: Submit with clear description and test evidence

### **Feature Request Process**
1. **Check Issues**: Look for existing requests
2. **Validate with Baseline**: Ensure feature is in `web-features` database
3. **Scope Appropriately**: Focus on Angular-specific needs
4. **Provide Examples**: Show real-world problematic code

### **Bug Report Template**
```markdown
**Environment:**
- Node.js version:
- Package version:
- Operating System:

**Input:**
- File type (TS/HTML/CSS):
- Code sample that fails:

**Expected vs Actual:**
- Expected detection: [feature name]
- Actual result: [what happened]

**Additional Context:**
- Browser support data from MDN/caniuse
```

---

## 📚 **AI Learning Resources**

### **Understanding Web Compatibility**
- [MDN Browser Compatibility](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5)
- [Can I Use Database](https://caniuse.com/)
- [Web Features Repository](https://github.com/web-platform-dx/web-features)
- [Baseline 2023 Announcement](https://developer.mozilla.org/en-US/blog/baseline-unified-view-stable-web-features/)

### **Angular-Specific Patterns**
- Components use templates (`.html`) and styles (`.css/.scss`)
- Services inject dependencies and handle business logic
- Modern Angular uses standalone components and signals
- Lifecycle hooks for resource management

### **TypeScript AST Analysis**
- Use TypeScript compiler API for precise analysis
- Regex patterns for simple detection
- Consider context (inside functions, conditional blocks, etc.)

---

## 🎯 **Project Goals & Non-Goals**

### **Goals** ✅
- Detect modern web features in Angular code
- Provide actionable compatibility information
- Integrate with existing developer workflows (ESLint, CLI)
- Support multiple output formats
- Maintain high accuracy with official Baseline data

### **Non-Goals** ❌
- Replace browser testing (complement, don't replace)
- Support non-Angular frameworks (out of scope)
- Runtime polyfill injection (detection only)
- Visual regression testing (different problem space)

---

## 💡 **Future Enhancement Ideas**

### **Phase 2 Possibilities**
- **VS Code Extension**: Real-time detection in editor
- **Angular CLI Integration**: `ng add` schematic support
- **CI/CD Templates**: GitHub Actions, GitLab CI examples
- **Custom Rule Builder**: GUI for creating detection rules

### **Advanced Features**
- **Severity Configuration**: Team-specific compatibility policies
- **Progressive Enhancement**: Suggest fallback patterns
- **Performance Impact**: Analyze modern feature adoption benefits
- **Framework Updates**: Track Angular version compatibility

---

## 🤝 **Community & Support**

### **Getting Help**
- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: Architecture questions and ideas
- **Hackathon Discord**: Real-time community support

### **Recognition**
This project is **powered by Claude AI** and represents a collaboration between human creativity and AI capabilities. Contributors from both the human and AI communities are welcome and appreciated.

---

## 📄 **License & Legal**

**MIT License** - See `LICENSE` file for full terms.

### **Attribution**
- Built with [web-features](https://github.com/web-platform-dx/web-features) data
- Created for the Baseline Tooling Hackathon
- Powered by Claude AI assistance

---

## 🚀 **Quick Reference Commands**

```bash
# Development
npm install                    # Install dependencies
npm run build                 # Build all packages
npm test                      # Run all tests
npm run lint                  # Check code quality

# Usage
npx baseline-devkit analyze   # Analyze current directory
npx baseline-devkit --help    # Show all options

# Package-specific
cd packages/analyzer-core && npm test   # Test core engine
cd packages/cli-builder && npm run dev  # Develop CLI
```

---

*This document is maintained by the project team and updated regularly. Last update: $(date)*

**🤖 AI Assistants**: This codebase is designed to be AI-friendly. When in doubt, refer to existing patterns and test thoroughly with the provided fixtures.