import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Angular Baseline Demo';

  // ⚠️ PROBLEMA 1: View Transitions API (Chrome 111+, no Firefox/Safari)
  async animatePageTransition() {
    if ('startViewTransition' in document) {
      document.startViewTransition(() => {
        this.updateContent();
      });
    }
  }

  // ⚠️ PROBLEMA 2: Clipboard API (soporte parcial)
  async copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Copied to clipboard');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  // ⚠️ PROBLEMA 3: IntersectionObserver (requiere polyfill en IE)
  observeElements() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    });

    document.querySelectorAll('.observe').forEach(el => {
      observer.observe(el);
    });
  }

  // ⚠️ PROBLEMA 4: ResizeObserver (no en Safari < 13.1)
  watchResize() {
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        console.log('Size changed:', entry.contentRect);
      }
    });

    const element = document.querySelector('.resizable');
    if (element) {
      resizeObserver.observe(element);
    }
  }

  private updateContent(): void {
    // Update logic here
    const element = document.querySelector('.content');
    if (element) {
      element.textContent = `Content updated at ${new Date().toLocaleTimeString()}`;
    }
    console.log('Content updated with transition');
  }

  getResultMessage(buttonId: string): string {
    const result = this.results[buttonId];
    if (!result) return '';

    return result.success ?
      `✅ ${result.message}` :
      `❌ ${result.message}${result.error ? ` (${result.error})` : ''}`;
  }
}