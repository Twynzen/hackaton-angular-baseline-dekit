import { Component } from '@angular/core';

@Component({
  selector: 'app-feature',
  templateUrl: './feature.component.html',
  styleUrls: ['./feature.component.css']
})
export class FeatureComponent {
  clipboardApi() {
    // Modern clipboard API usage
    if (navigator.clipboard) {
      navigator.clipboard.writeText('Hello from Angular Baseline DevKit!')
        .then(() => console.log('Text copied to clipboard'))
        .catch(err => console.error('Failed to copy text: ', err));
    }
  }

  resizeObserver() {
    // ResizeObserver usage
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        console.log('Element resized:', entry.target);
      }
    });

    const element = document.querySelector('.resizable');
    if (element) {
      observer.observe(element);
    }
  }
}