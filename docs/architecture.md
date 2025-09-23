# Angular Baseline DevKit Architecture

## Overview

The Angular Baseline DevKit is designed as a modular system that analyzes Angular projects for baseline web compatibility. The architecture follows a clean separation of concerns with well-defined interfaces between components.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLI Interface                        │
│                baseline-devkit analyze                  │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────v───────────────────────────────────┐
│                Analysis Engine                          │
│            AngularBaselineAnalyzer                      │
└─────┬─────────────┬─────────────┬─────────────┬─────────┘
      │             │             │             │
┌─────v─────┐ ┌─────v─────┐ ┌─────v─────┐ ┌─────v─────┐
│TSAnalyzer │ │Template   │ │CSS        │ │Feature    │
│           │ │Analyzer   │ │Analyzer   │ │Mapper     │
└───────────┘ └───────────┘ └───────────┘ └─────┬─────┘
                                                 │
                                        ┌────────v─────────┐
                                        │BaselineProvider  │
                                        │(web-features)    │
                                        └──────────────────┘
                                                 │
┌─────────────────────────────────────────────┬─v─────────┐
│                Reporters                    │           │
│  ┌─────────────┐  ┌─────────────┐          │           │
│  │JSON Reporter│  │Console      │          │           │
│  │             │  │Reporter     │          │           │
│  └─────────────┘  └─────────────┘          │           │
└────────────────────────────────────────────┴───────────┘

┌─────────────────────────────────────────────────────────┐
│                ESLint Integration                       │
│               eslint-plugin-angular-baseline            │
└─────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Analysis Engine (`AngularBaselineAnalyzer`)

The central orchestrator that:
- Discovers files in the project
- Coordinates analysis across different file types
- Manages concurrency and performance
- Generates the final analysis report

**Key Features:**
- File discovery with glob patterns
- Concurrent analysis with configurable limits
- File size limits for performance
- Deterministic analysis results

### 2. Language-Specific Analyzers

#### TSAnalyzer
- Uses `ts-morph` for TypeScript AST parsing
- Detects Web API usage patterns
- Supports inline Angular templates/styles
- Identifies constructor calls and property access

**Detected Patterns:**
```typescript
new IntersectionObserver(...)  // Constructor calls
document.startViewTransition() // Property access chains
navigator.clipboard            // API references
```

#### TemplateAnalyzer
- Uses `@angular/compiler` for template parsing
- Analyzes HTML attributes and elements
- Supports Angular-specific binding syntax
- Detects modern HTML features

**Detected Patterns:**
```html
<div popover="auto">           <!-- HTML attributes -->
<dialog>                       <!-- Modern elements -->
[inert]="condition"           <!-- Angular bindings -->
```

#### CSSAnalyzer
- Uses `css-tree` and `postcss` for CSS parsing
- Detects modern selectors and properties
- Supports at-rules and complex selectors
- Fallback parsing for error resilience

**Detected Patterns:**
```css
.card:has(.error) { }         /* Modern selectors */
text-wrap: balance;           /* Modern properties */
@container (min-width: 400px) /* Container queries */
```

### 3. Feature Mapping System

#### FeatureRegistry
- Centralized mapping of code constructs to web-features IDs
- Easily extensible for new features
- Validation against web-features database

#### BaselineProvider
- Integrates with `web-features` package
- Caches baseline status information
- Determines compatibility based on target configuration
- Handles different baseline levels (widely/newly/limited)

#### FeatureMapper
- Converts evidence to actionable diagnostics
- Generates appropriate severity levels
- Provides contextual suggestions and alternatives
- Respects configuration (strict mode, allow-lists)

### 4. Reporting System

#### JsonReporter
- Generates structured JSON reports
- Includes timestamps and versioning
- Relativizes file paths for portability
- Provides both machine and human-readable formats

#### Console Output
- User-friendly terminal output
- Grouped by file for easy navigation
- Color-coded severity indicators
- Suggestion integration

### 5. ESLint Integration

- Real-time analysis during development
- Configurable rule options
- Integrates with existing ESLint workflows
- Provides inline suggestions in IDEs

## Data Flow

1. **File Discovery**: Analyzer scans project for TypeScript, HTML, and CSS files
2. **Parallel Analysis**: Each file type is processed by its specialized analyzer
3. **Evidence Collection**: Detected features are collected as structured evidence
4. **Feature Mapping**: Evidence is mapped to web-features IDs using the registry
5. **Baseline Checking**: Each feature is checked against the target baseline
6. **Diagnostic Generation**: Non-compatible features become diagnostics with suggestions
7. **Report Generation**: All data is compiled into comprehensive reports

## Configuration System

```typescript
interface BaselineConfig {
  target: 'widely' | 'newly' | number;  // Compatibility target
  strict?: boolean;                      // Treat warnings as errors
  allow?: string[];                      // Allow-list specific features
}
```

**Target Options:**
- `'widely'`: Only widely available baseline features
- `'newly'`: Newly available baseline features (more permissive)
- `number`: Specific year (e.g., 2023, 2024)

## Performance Considerations

- **Concurrent Processing**: Configurable concurrency for file analysis
- **File Size Limits**: Skip extremely large files automatically
- **Caching**: BaselineProvider caches web-features lookups
- **Streaming**: Large projects processed in batches
- **Memory Management**: AST nodes are not retained between files

## Error Handling

- **Graceful Degradation**: Parser errors don't stop analysis
- **Fallback Parsing**: Multiple CSS parsers for resilience
- **Warning System**: Non-fatal issues are logged as warnings
- **Validation**: Feature registry validated against web-features

## Extensibility Points

1. **New Language Analyzers**: Implement analyzer interface for new file types
2. **Custom Features**: Extend feature registry with project-specific mappings
3. **Reporter Formats**: Add new report formats (HTML, XML, etc.)
4. **Baseline Sources**: Alternative baseline data sources beyond web-features
5. **Analysis Rules**: Custom logic for specific framework patterns

## Testing Strategy

- **Unit Tests**: Each analyzer tested independently
- **Integration Tests**: End-to-end analysis workflows
- **Fixture-Based Testing**: Known code samples with expected results
- **Performance Tests**: Large project analysis benchmarks
- **Validation Tests**: Feature registry accuracy checks