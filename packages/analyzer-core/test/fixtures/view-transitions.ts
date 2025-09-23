// Test file for View Transitions API detection
export class ViewTransitionService {
  startTransition() {
    if ('startViewTransition' in document) {
      document.startViewTransition(() => {
        // Transition logic here
        this.updateDOM();
      });
    }
  }

  private updateDOM() {
    // DOM update logic
  }
}