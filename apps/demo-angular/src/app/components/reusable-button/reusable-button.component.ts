import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'warning' | 'success';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonClickEvent {
  buttonId: string;
  timestamp: Date;
  data?: any;
}

@Component({
  selector: 'app-reusable-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [class]="buttonClasses"
      [disabled]="disabled || loading"
      [attr.aria-label]="ariaLabel || text"
      [attr.data-testid]="testId"
      (click)="handleClick()"
      type="button">

      <span *ngIf="loading" class="loading-spinner" aria-hidden="true"></span>
      <span [class.sr-only]="loading">{{ text }}</span>

    </button>
  `,
  styles: [`
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-weight: 500;
      text-align: center;
      text-decoration: none;
      border: 1px solid transparent;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: all 0.15s ease-in-out;
      font-family: inherit;
    }

    .btn:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }

    /* Sizes */
    .btn-small {
      padding: 0.25rem 0.75rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
    }

    .btn-medium {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
    }

    .btn-large {
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      line-height: 1.5rem;
    }

    /* Variants */
    .btn-primary {
      background-color: #007bff;
      border-color: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #0056b3;
      border-color: #0056b3;
    }

    .btn-secondary {
      background-color: #6c757d;
      border-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: #545b62;
      border-color: #545b62;
    }

    .btn-danger {
      background-color: #dc3545;
      border-color: #dc3545;
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background-color: #b02a37;
      border-color: #b02a37;
    }

    .btn-warning {
      background-color: #ffc107;
      border-color: #ffc107;
      color: #212529;
    }

    .btn-warning:hover:not(:disabled) {
      background-color: #d39e00;
      border-color: #d39e00;
    }

    .btn-success {
      background-color: #28a745;
      border-color: #28a745;
      color: white;
    }

    .btn-success:hover:not(:disabled) {
      background-color: #1e7e34;
      border-color: #1e7e34;
    }

    .loading-spinner {
      width: 1rem;
      height: 1rem;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `]
})
export class ReusableButtonComponent {
  @Input() text!: string;
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'medium';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() ariaLabel?: string;
  @Input() testId?: string;
  @Input() buttonId?: string;
  @Input() data?: any;

  @Output() buttonClick = new EventEmitter<ButtonClickEvent>();

  get buttonClasses(): string {
    return `btn btn-${this.variant} btn-${this.size}`;
  }

  handleClick(): void {
    if (this.disabled || this.loading) {
      return;
    }

    const event: ButtonClickEvent = {
      buttonId: this.buttonId || this.text.toLowerCase().replace(/\s+/g, '-'),
      timestamp: new Date(),
      data: this.data
    };

    this.buttonClick.emit(event);
  }
}