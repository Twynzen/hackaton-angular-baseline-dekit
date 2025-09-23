// Test file for IntersectionObserver API detection
export class LazyLoadingService {
  private observer: IntersectionObserver;

  constructor() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadContent(entry.target as HTMLElement);
        }
      });
    });
  }

  observeElement(element: HTMLElement) {
    this.observer.observe(element);
  }

  private loadContent(element: HTMLElement) {
    // Load content logic
  }
}