# 🎬 Demo Project for Angular Baseline DevKit

## 🎯 Purpose

This demo project contains **intentionally problematic code** to showcase Angular Baseline DevKit's detection capabilities. It includes modern web features with varying browser support levels.

## ⚠️ Features Detected (Expected Warnings)

### 🟡 JavaScript APIs
- `document.startViewTransition()` - Chrome 111+ only
- `navigator.clipboard.writeText()` - Partial support
- `IntersectionObserver` - Needs polyfill for IE
- `ResizeObserver` - Not in Safari < 13.1
- `PaymentRequest` - Chrome/Edge only
- `Web Animations API` - Partial support
- `OffscreenCanvas` - Chrome 69+ only

### 🟡 CSS Features
- `:has()` selector - No Firefox support
- `:is()` and `:where()` - Limited support
- `text-wrap: balance` - Very new (2023)
- Container queries `@container` - Chrome 105+
- CSS Grid `subgrid` - Limited support
- `accent-color` - Not Safari < 15.4
- `aspect-ratio` - Not Safari < 15

### 🟡 HTML Attributes
- `popover` attribute - Chrome 114+ only
- `inert` attribute - Chrome 102+, Firefox 112+
- `loading="lazy"` - Partial support
- `<dialog>` element - Not Safari < 15.4
- `autocomplete` new values - Variable support

## 🚀 How to Use for Demo

```bash
# From the main project directory
git checkout demo
cd demo-project

# Run analysis
npx @angular-baseline-devkit/cli analyze . --target widely

# Expected: ~15-20 warnings/errors detected
```

## 📊 Expected Output

The analysis should detect multiple compatibility issues with detailed information:
- Browser support levels
- Specific file locations
- Actionable suggestions
- Baseline status (widely/newly/limited)

## 🎬 Perfect for Video Demo

This project is designed to:
1. **Show clear problems** - Easy to understand issues
2. **Demonstrate variety** - CSS, JS, and HTML problems
3. **Provide good output** - Meaningful warnings with context
4. **Be reproducible** - Same results every time
5. **Save time** - No need to create demo content during recording

## 📝 Files Overview

- `app.component.ts` - View Transitions, Clipboard API, Observers
- `app.component.css` - Modern CSS selectors and properties
- `app.component.html` - New HTML attributes and elements
- `services/animation.service.ts` - Web Animations API
- `components/modern-features.component.ts` - Payment API, Web Share

Each file is heavily commented with `⚠️ PROBLEMA:` to explain what will be detected.