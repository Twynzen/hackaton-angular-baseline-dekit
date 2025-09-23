# Feature Mapping Reference

This document provides a comprehensive mapping of code constructs to web-features IDs used by the Angular Baseline DevKit.

## TypeScript/JavaScript API Mappings

| Code Construct | Feature ID | Baseline Status | Notes |
|----------------|------------|-----------------|-------|
| `new IntersectionObserver()` | `api.IntersectionObserver` | Widely Available | Modern viewport intersection detection |
| `document.startViewTransition()` | `api.Document.startViewTransition` | Newly Available | View Transitions API |
| `navigator.clipboard` | `api.Navigator.clipboard` | Widely Available | Async clipboard operations |
| `Element.prototype.animate()` | `api.Element.animate` | Widely Available | Web Animations API |
| `new ResizeObserver()` | `api.ResizeObserver` | Widely Available | Element resize detection |
| `new MutationObserver()` | `api.MutationObserver` | Widely Available | DOM mutation observation |

### Usage Examples

```typescript
// IntersectionObserver - Widely Available
const observer = new IntersectionObserver((entries) => {
  // Implementation
});

// View Transitions - Newly Available
if ('startViewTransition' in document) {
  document.startViewTransition(() => {
    // Transition logic
  });
}

// Clipboard API - Widely Available
await navigator.clipboard.writeText('Hello');
```

## HTML Attribute Mappings

| Attribute | Feature ID | Baseline Status | Usage Context |
|-----------|------------|-----------------|---------------|
| `popover` | `html.elements.div.popover` | Newly Available | Popup overlays |
| `inert` | `html.global_attributes.inert` | Newly Available | Accessibility control |
| `loading="lazy"` | `html.elements.img.loading` | Widely Available | Image lazy loading |

### Usage Examples

```html
<!-- Popover - Newly Available -->
<div popover="auto">
  Popup content
</div>

<!-- Inert - Newly Available -->
<section inert>
  Background content when modal is open
</section>

<!-- Lazy Loading - Widely Available -->
<img src="image.jpg" loading="lazy" alt="Description">
```

### Angular-Specific Bindings

```html
<!-- Angular property bindings -->
<div [popover]="popoverMode">Content</div>
<section [inert]="!isActive">Background</section>
```

## CSS Feature Mappings

### Selectors

| Selector | Feature ID | Baseline Status | Description |
|----------|------------|-----------------|-------------|
| `:has()` | `css.selectors.has` | Limited Support | Parent selector |
| `:is()` | `css.selectors.is` | Widely Available | Selector grouping |
| `:where()` | `css.selectors.where` | Newly Available | Zero-specificity grouping |

#### Usage Examples

```css
/* :has() - Limited Support */
.card:has(.error) {
  border: 1px solid red;
}

/* :is() - Widely Available */
.nav-item:is(.active, .current) {
  font-weight: bold;
}

/* :where() - Newly Available */
.input:where(.required) {
  border-color: orange;
}
```

### Properties

| Property | Feature ID | Baseline Status | Use Case |
|----------|------------|-----------------|----------|
| `text-wrap` | `css.properties.text-wrap` | Limited Support | Text balancing |
| `aspect-ratio` | `css.properties.aspect-ratio` | Widely Available | Maintain proportions |
| `gap` | `css.properties.gap` | Widely Available | Grid/Flexbox spacing |
| `grid-template-areas` | `css.properties.grid-template-areas` | Widely Available | Named grid areas |

#### Usage Examples

```css
/* text-wrap - Limited Support */
.title {
  text-wrap: balance;
}

/* aspect-ratio - Widely Available */
.video-container {
  aspect-ratio: 16 / 9;
}

/* gap - Widely Available */
.grid {
  display: grid;
  gap: 1rem;
}
```

### At-Rules

| At-Rule | Feature ID | Baseline Status | Purpose |
|---------|------------|-----------------|---------|
| `@container` | `css.at-rules.container` | Newly Available | Container queries |

#### Usage Examples

```css
/* Container Queries - Newly Available */
.card {
  container-type: inline-size;
}

@container (min-width: 300px) {
  .card-content {
    display: flex;
  }
}
```

## Detection Patterns

### TypeScript Analyzer Patterns

The TypeScript analyzer uses AST analysis to detect:

1. **Property Access Expressions**
   ```typescript
   document.startViewTransition  // Detected as property chain
   navigator.clipboard.writeText // Detected as nested property access
   ```

2. **Constructor Calls**
   ```typescript
   new IntersectionObserver()    // Detected as new expression
   new ResizeObserver()          // Detected as new expression
   ```

3. **Inline Angular Components**
   ```typescript
   @Component({
     template: `<div popover="auto">...</div>`,  // Template analysis
     styles: [`.card:has(.error) { ... }`]      // Style analysis
   })
   ```

### Template Analyzer Patterns

The template analyzer processes Angular templates to detect:

1. **HTML Attributes**
   ```html
   <div popover="auto">         <!-- Direct attribute -->
   <section [inert]="condition"> <!-- Angular binding -->
   ```

2. **Element Types**
   ```html
   <dialog>                     <!-- Modern HTML elements -->
   ```

3. **Property Bindings**
   ```html
   [popover]="'manual'"         <!-- Angular property binding -->
   ```

### CSS Analyzer Patterns

The CSS analyzer uses multiple parsers to detect:

1. **Selectors in Rules**
   ```css
   .parent:has(.child) { }      <!-- Modern pseudo-selectors -->
   ```

2. **Property Declarations**
   ```css
   text-wrap: balance;          <!-- Modern properties -->
   ```

3. **At-Rule Usage**
   ```css
   @container (min-width: 400px) <!-- Container queries -->
   ```

## Configuration Impact

### Target Configuration

The `target` configuration affects how features are evaluated:

- **`widely`**: Only widely available features pass
- **`newly`**: Newly and widely available features pass
- **`2023`**: Features available since 2023 pass

### Allow Lists

Features can be explicitly allowed:

```json
{
  "target": "widely",
  "allow": [
    "css.selectors.has",
    "api.Document.startViewTransition"
  ]
}
```

### Strict Mode

In strict mode:
- Warnings become errors
- More conservative compatibility checking
- Stricter baseline interpretation

## Adding New Mappings

To add new feature mappings:

1. **Update Feature Registry**
   ```typescript
   // packages/analyzer-core/src/feature-registry.ts
   export const FEATURE_ID_REGISTRY: Map<string, string> = new Map([
     // Add new mapping
     ['CustomAPI', 'api.custom.feature']
   ]);
   ```

2. **Update Analyzer Logic**
   - Modify appropriate analyzer (TS/Template/CSS)
   - Add detection logic for the new construct

3. **Add Test Cases**
   - Create test fixtures
   - Verify detection accuracy

4. **Validate Against web-features**
   - Ensure feature ID exists in web-features database
   - Run validation script

## Limitations

### Known Limitations

1. **Dynamic Code**: Runtime-generated code cannot be analyzed
2. **Complex Selectors**: Some complex CSS selectors may not be detected
3. **Framework-Specific**: Detection optimized for Angular patterns
4. **Static Analysis**: No execution context or runtime behavior

### Future Enhancements

1. **More APIs**: Expand TypeScript API detection
2. **Framework Support**: Add React/Vue analyzer support
3. **Dynamic Analysis**: Runtime feature detection
4. **Advanced CSS**: Better support for complex CSS patterns

## Troubleshooting

### Common Issues

1. **Feature Not Detected**
   - Check if construct matches expected pattern
   - Verify feature ID exists in registry
   - Ensure analyzer supports the file type

2. **False Positives**
   - Review detection logic in relevant analyzer
   - Check for similar naming conflicts
   - Verify web-features mapping accuracy

3. **Performance Issues**
   - Use file size limits for large files
   - Adjust concurrency settings
   - Exclude unnecessary file patterns