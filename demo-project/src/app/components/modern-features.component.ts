import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-modern-features',
  template: `
    <div class="modern-component">
      <h2>Modern Web Features Demo</h2>

      <!-- ⚠️ PROBLEMA: Custom Elements v1 - Soporte variable -->
      <custom-element data="example"></custom-element>

      <div class="feature-grid">
        <div class="feature-card">
          <h3>Payment API</h3>
          <button (click)="requestPayment()">Pay Now</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ⚠️ PROBLEMA: CSS Grid con gap - IE no soporta */
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    /* ⚠️ PROBLEMA: CSS Variables con cálculos complejos */
    .feature-card {
      background: hsl(var(--hue, 220) 90% 95%);
      border-radius: max(8px, min(16px, 2vw));
    }
  `]
})
export class ModernFeaturesComponent implements OnInit {

  ngOnInit() {
    this.checkBrowserFeatures();
  }

  // ⚠️ PROBLEMA: Payment Request API - Chrome/Edge, no Safari/Firefox completo
  async requestPayment() {
    if ('PaymentRequest' in window) {
      const paymentRequest = new PaymentRequest([{
        supportedMethods: 'basic-card',
        data: {
          supportedNetworks: ['visa', 'mastercard']
        }
      }], {
        total: {
          label: 'Total',
          amount: { currency: 'USD', value: '10.00' }
        }
      });

      try {
        const paymentResponse = await paymentRequest.show();
        await paymentResponse.complete('success');
      } catch (error) {
        console.error('Payment failed:', error);
      }
    }
  }

  // ⚠️ PROBLEMA: getBattery() - Solo Chrome, deprecated
  async checkBattery() {
    if ('getBattery' in navigator) {
      const battery = await (navigator as any).getBattery();
      console.log('Battery level:', battery.level);
    }
  }

  // ⚠️ PROBLEMA: Notification API - Soporte parcial en móviles
  requestNotificationPermission() {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Hello from Angular Baseline DevKit!');
        }
      });
    }
  }

  // ⚠️ PROBLEMA: Web Share API - Solo móviles y algunos browsers
  async shareContent() {
    if ('share' in navigator) {
      try {
        await navigator.share({
          title: 'Angular Baseline DevKit',
          text: 'Check out this awesome tool!',
          url: window.location.href
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    }
  }

  checkBrowserFeatures() {
    console.log('Service Worker support:', 'serviceWorker' in navigator);
    console.log('Web Workers support:', 'Worker' in window);
    console.log('IndexedDB support:', 'indexedDB' in window);
  }
}