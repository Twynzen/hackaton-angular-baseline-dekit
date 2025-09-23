import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <h1>Angular Baseline DevKit Demo</h1>

      <!-- HTML features that should be detected -->
      <dialog #demoDialog>
        <h2>Demo Dialog</h2>
        <p>This dialog uses the HTML dialog element.</p>
        <button (click)="demoDialog.close()">Close</button>
      </dialog>

      <div popover="auto" id="demo-popover">
        <p>This popover should be detected by the analyzer.</p>
      </div>

      <section [inert]="isModalOpen">
        <p>This content becomes inert when modal is open.</p>
      </section>

      <button (click)="demoDialog.showModal()">Show Dialog</button>
      <button popovertarget="demo-popover">Show Popover</button>
      <button (click)="startViewTransition()">Start View Transition</button>
      <button (click)="setupIntersectionObserver()">Setup Observer</button>
    </div>
  `,
  styles: [`
    .app-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      font-family: sans-serif;
    }

    /* CSS features that should be detected */
    .card:has(.error) {
      border: 2px solid red;
      background-color: #ffebee;
    }

    .title {
      text-wrap: balance;
      font-size: 2rem;
      margin-bottom: 1rem;
    }

    .grid-container {
      display: grid;
      gap: 1rem;
      grid-template-areas:
        "header header"
        "sidebar main"
        "footer footer";
    }

    @container (min-width: 400px) {
      .responsive-card {
        padding: 2rem;
      }
    }

    /* Modern selectors */
    .nav:is(.active, .highlighted) {
      background-color: #007bff;
    }

    .form:where(.compact) {
      margin: 0.5rem;
    }
  `]
})
export class AppComponent {
  title = 'demo-angular';
  isModalOpen = false;

  startViewTransition() {
    // This should be detected by the TypeScript analyzer
    if ('startViewTransition' in document) {
      document.startViewTransition(() => {
        // Simulate a view transition
        document.body.style.backgroundColor =
          document.body.style.backgroundColor === 'lightblue' ? 'white' : 'lightblue';
      });
    }
  }

  setupIntersectionObserver() {
    // This should be detected by the TypeScript analyzer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          console.log('Element is visible:', entry.target);
        }
      });
    });

    const elements = document.querySelectorAll('.observe-me');
    elements.forEach(el => observer.observe(el));
  }
}