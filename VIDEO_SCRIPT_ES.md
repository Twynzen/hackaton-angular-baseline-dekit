# 🎬 Guión Video - Angular Baseline DevKit (Español)

## 📋 Información General
- **Duración**: 3 minutos máximo
- **Formato**: Grabación de pantalla + voz en off
- **Sin cámara requerida**

---

## 🎯 GUIÓN DETALLADO

### [0:00 - 0:20] 🚨 APERTURA - El Problema
**[Mostrar: VS Code con código Angular que tiene CSS moderno]**

**Narración:**
> "¿Te ha pasado que usas una característica CSS moderna como `:has()` y después tu jefe te llama porque no funciona en el navegador del cliente?
>
> Este es un problema real: los desarrolladores usamos características web modernas sin saber si funcionan en todos los navegadores."

**[Mostrar: Browser compatibility table de MDN mostrando soporte parcial]**

---

### [0:20 - 0:40] 💡 LA SOLUCIÓN
**[Mostrar: Logo/título del proyecto + arquitectura]**

**Narración:**
> "Angular Baseline DevKit es una herramienta que analiza automáticamente tu código Angular y detecta características web que podrían no funcionar en todos los navegadores.
>
> Usa datos oficiales de web-features, el mismo dataset que usa MDN y Google Chrome, para darte información precisa y actualizada."

---

### [0:40 - 1:40] 🔴 DEMO EN VIVO
**[Mostrar: Terminal ejecutando comandos]**

```bash
# Paso 1: Ir al proyecto demo pre-preparado
git checkout demo
cd demo-project
```

**Narración:**
> "Veamos cómo funciona. Tengo aquí un proyecto Angular con código moderno que presenta problemas típicos de compatibilidad."

**[Mostrar rápidamente: Código con :has(), startViewTransition, etc.]**

```bash
# Paso 2: Ejecutar análisis
npx @angular-baseline-devkit/cli analyze . --target widely
```

**[Mostrar: Output con warnings]**

```
🔍 Analizando proyecto Angular...

⚠️ ADVERTENCIA: Característica con soporte limitado
   Tipo: CSS
   Feature: ':has()' selector
   Archivo: src/app/components/card/card.component.css:45
   Soporte: Chrome ✅ Firefox ❌ Safari ⚠️
   Sugerencia: Usa una clase alternativa o JavaScript para esta funcionalidad

⚠️ ADVERTENCIA: API moderna detectada
   Tipo: JavaScript
   Feature: 'document.startViewTransition'
   Archivo: src/app/services/animation.service.ts:23
   Baseline: newly (disponible desde 2023)
   Sugerencia: Implementa un fallback para navegadores antiguos

📊 Resumen: 2 problemas encontrados
```

**Narración:**
> "Como ven, la herramienta encontró dos problemas: un selector CSS que no funciona en Firefox y una API de JavaScript que es muy nueva. Cada warning incluye sugerencias específicas."

---

### [1:40 - 2:10] 🔧 INTEGRACIÓN CON ESLINT
**[Mostrar: VS Code con squiggly lines rojas en el código]**

**Narración:**
> "Pero lo mejor es la integración con ESLint. Agrega el plugin a tu proyecto..."

**[Mostrar: .eslintrc.js]**
```javascript
{
  plugins: ['@angular-baseline-devkit/eslint-plugin'],
  rules: {
    '@angular-baseline-devkit/use-baseline': ['error', {
      target: 'widely' // máxima compatibilidad
    }]
  }
}
```

**Narración:**
> "Y ahora los problemas aparecen directamente en tu editor mientras escribes código. No necesitas esperar hasta producción para descubrir incompatibilidades."

---

### [2:10 - 2:40] ⚙️ CONFIGURACIÓN FLEXIBLE
**[Mostrar: Diferentes comandos con distintos targets]**

```bash
# Para máxima compatibilidad
baseline-devkit analyze --target widely

# Para browsers modernos
baseline-devkit analyze --target newly

# Para un año específico
baseline-devkit analyze --target 2023

# Modo estricto para CI/CD
baseline-devkit analyze --strict --output json
```

**Narración:**
> "La herramienta es completamente configurable. Puedes elegir el nivel de compatibilidad que necesitas: 'widely' para máximo soporte, 'newly' para características modernas, o incluso un año específico.
>
> También genera reportes JSON para integración con CI/CD."

---

### [2:40 - 3:00] 🎯 IMPACTO Y CIERRE
**[Mostrar: GitHub repo + estadísticas del proyecto]**

**Narración:**
> "Angular Baseline DevKit previene bugs en producción antes de que ocurran. Mejora la experiencia del usuario garantizando que tu código funcione donde lo necesitas.
>
> Es open source, fácil de integrar, y está disponible ahora mismo en GitHub y npm.
>
> Deja de adivinar qué funciona y dónde. Usa Angular Baseline DevKit."

**[Mostrar: URL del proyecto y comando de instalación]**
```
🔗 github.com/Twynzen/hackaton-angular-baseline-dekit
📦 npm install @angular-baseline-devkit/cli
```

---

## 🎨 ELEMENTOS VISUALES CLAVE

1. **Terminal con output colorizado** (usar terminal con buen tema)
2. **VS Code mostrando errores en tiempo real**
3. **Tabla de compatibilidad de browsers**
4. **Arquitectura del proyecto (diagrama simple)**
5. **GitHub repo al final**

## 🎙️ TIPS DE GRABACIÓN

- Habla claro y pausado
- Ensaya el flujo antes de grabar
- Ten los comandos listos para copiar/pegar
- Usa zoom en el código importante
- Asegúrate que el audio no tenga ruido de fondo