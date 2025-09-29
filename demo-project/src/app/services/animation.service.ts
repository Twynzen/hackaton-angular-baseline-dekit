import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {

  // ⚠️ PROBLEMA: Web Animations API - Soporte parcial
  animateElement(element: HTMLElement) {
    const animation = element.animate([
      { opacity: 0, transform: 'translateY(20px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], {
      duration: 300,
      easing: 'ease-out',
      fill: 'forwards'
    });

    return animation.finished;
  }

  // ⚠️ PROBLEMA: getAnimations() - Chrome 84+, no Safari < 13.1
  pauseAllAnimations() {
    const animations = document.getAnimations();
    animations.forEach(animation => {
      animation.pause();
    });
  }

  // ⚠️ PROBLEMA: CSS.supports() - Bien soportado pero bueno para el demo
  checkCSSSupport(property: string, value: string): boolean {
    return CSS.supports(property, value);
  }

  // ⚠️ PROBLEMA: OffscreenCanvas - Chrome 69+, no Safari/Firefox
  createOffscreenCanvas() {
    if ('OffscreenCanvas' in window) {
      const canvas = new OffscreenCanvas(800, 600);
      const ctx = canvas.getContext('2d');
      return { canvas, ctx };
    }
    return null;
  }
}