import { Injectable } from '@angular/core';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import {
  CompatibilityResult,
  ApiResponse,
  NotificationOptions,
  PaymentDetails,
  ShareData,
  BatteryInfo,
  AnimationOptions
} from '../models/browser-compatibility.interface';

export enum FeatureSupport {
  SUPPORTED = 'supported',
  NOT_SUPPORTED = 'not_supported',
  PARTIAL = 'partial_support',
  UNKNOWN = 'unknown'
}

@Injectable({
  providedIn: 'root'
})
export class ModernApiService {
  private readonly DEFAULT_TIMEOUT = 5000;

  /**
   * Checks if a specific web API is supported
   */
  checkApiSupport(apiName: string): FeatureSupport {
    try {
      switch (apiName) {
        case 'startViewTransition':
          return 'startViewTransition' in document ? FeatureSupport.SUPPORTED : FeatureSupport.NOT_SUPPORTED;
        case 'clipboard':
          return navigator.clipboard ? FeatureSupport.SUPPORTED : FeatureSupport.NOT_SUPPORTED;
        case 'intersectionObserver':
          return 'IntersectionObserver' in window ? FeatureSupport.SUPPORTED : FeatureSupport.NOT_SUPPORTED;
        case 'resizeObserver':
          return 'ResizeObserver' in window ? FeatureSupport.SUPPORTED : FeatureSupport.NOT_SUPPORTED;
        case 'paymentRequest':
          return 'PaymentRequest' in window ? FeatureSupport.SUPPORTED : FeatureSupport.NOT_SUPPORTED;
        case 'webShare':
          return navigator.share ? FeatureSupport.SUPPORTED : FeatureSupport.NOT_SUPPORTED;
        case 'notifications':
          return 'Notification' in window ? FeatureSupport.SUPPORTED : FeatureSupport.NOT_SUPPORTED;
        default:
          return FeatureSupport.UNKNOWN;
      }
    } catch (error) {
      console.error(`Error checking API support for ${apiName}:`, error);
      return FeatureSupport.UNKNOWN;
    }
  }

  /**
   * Performs View Transitions with proper error handling
   */
  performViewTransition(updateCallback: () => void | Promise<void>): Observable<CompatibilityResult> {
    if (!('startViewTransition' in document)) {
      return of({
        success: false,
        message: 'View Transitions API not supported in this browser',
        feature: 'startViewTransition',
        error: 'API_NOT_SUPPORTED'
      });
    }

    try {
      const transition = (document as any).startViewTransition(async () => {
        try {
          await Promise.resolve(updateCallback());
        } catch (error) {
          throw new Error(`Update callback failed: ${error}`);
        }
      });

      return from(transition.finished).pipe(
        map(() => ({
          success: true,
          message: 'View transition completed successfully',
          feature: 'startViewTransition'
        })),
        catchError((error: Error) => of({
          success: false,
          message: 'View transition failed',
          feature: 'startViewTransition',
          error: error.message
        })),
        timeout(this.DEFAULT_TIMEOUT),
        catchError(() => of({
          success: false,
          message: 'View transition timed out',
          feature: 'startViewTransition',
          error: 'TIMEOUT'
        }))
      );
    } catch (error) {
      return of({
        success: false,
        message: 'Failed to start view transition',
        feature: 'startViewTransition',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Clipboard operations with comprehensive error handling
   */
  copyToClipboard(text: string): Observable<CompatibilityResult> {
    if (!navigator.clipboard) {
      return this.fallbackCopyToClipboard(text);
    }

    return from(navigator.clipboard.writeText(text)).pipe(
      map(() => ({
        success: true,
        message: `Successfully copied "${text}" to clipboard`,
        feature: 'clipboard'
      })),
      catchError((error: Error) => {
        console.warn('Modern clipboard failed, trying fallback:', error);
        return this.fallbackCopyToClipboard(text);
      }),
      timeout(this.DEFAULT_TIMEOUT),
      catchError(() => of({
        success: false,
        message: 'Clipboard operation timed out',
        feature: 'clipboard',
        error: 'TIMEOUT'
      }))
    );
  }

  private fallbackCopyToClipboard(text: string): Observable<CompatibilityResult> {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      return of({
        success: successful,
        message: successful ?
          `Successfully copied "${text}" using fallback method` :
          'Failed to copy using fallback method',
        feature: 'clipboard',
        error: successful ? undefined : 'FALLBACK_FAILED'
      });
    } catch (error) {
      return of({
        success: false,
        message: 'All clipboard methods failed',
        feature: 'clipboard',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Request notification permission with proper error handling
   */
  requestNotificationPermission(): Observable<ApiResponse<NotificationPermission>> {
    if (!('Notification' in window)) {
      return of({
        success: false,
        error: 'Notifications not supported in this browser',
        timestamp: new Date()
      });
    }

    return from(Notification.requestPermission()).pipe(
      map((permission: NotificationPermission) => ({
        success: permission === 'granted',
        data: permission,
        timestamp: new Date(),
        error: permission === 'denied' ? 'Permission denied by user' : undefined
      })),
      catchError((error: Error) => of({
        success: false,
        error: error.message,
        timestamp: new Date()
      }))
    );
  }

  /**
   * Show notification with error handling
   */
  showNotification(options: NotificationOptions): Observable<CompatibilityResult> {
    if (!('Notification' in window)) {
      return of({
        success: false,
        message: 'Notifications not supported',
        feature: 'notifications',
        error: 'API_NOT_SUPPORTED'
      });
    }

    if (Notification.permission !== 'granted') {
      return of({
        success: false,
        message: 'Notification permission not granted',
        feature: 'notifications',
        error: 'PERMISSION_DENIED'
      });
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon,
        tag: options.tag
      });

      return of({
        success: true,
        message: 'Notification displayed successfully',
        feature: 'notifications'
      });
    } catch (error) {
      return of({
        success: false,
        message: 'Failed to create notification',
        feature: 'notifications',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Web Share API with fallback
   */
  shareContent(data: ShareData): Observable<CompatibilityResult> {
    if (!navigator.share) {
      return of({
        success: false,
        message: 'Web Share API not supported. Consider implementing custom share buttons.',
        feature: 'webShare',
        error: 'API_NOT_SUPPORTED'
      });
    }

    return from(navigator.share(data)).pipe(
      map(() => ({
        success: true,
        message: 'Content shared successfully',
        feature: 'webShare'
      })),
      catchError((error: Error) => {
        if (error.name === 'AbortError') {
          return of({
            success: false,
            message: 'Share was cancelled by user',
            feature: 'webShare',
            error: 'USER_CANCELLED'
          });
        }
        return of({
          success: false,
          message: 'Share failed',
          feature: 'webShare',
          error: error.message
        });
      })
    );
  }

  /**
   * Payment Request API with comprehensive error handling
   */
  requestPayment(details: PaymentDetails): Observable<CompatibilityResult> {
    if (!('PaymentRequest' in window)) {
      return of({
        success: false,
        message: 'Payment Request API not supported',
        feature: 'paymentRequest',
        error: 'API_NOT_SUPPORTED'
      });
    }

    try {
      const methodData = [{
        supportedMethods: 'basic-card',
        data: {
          supportedNetworks: ['visa', 'mastercard', 'amex']
        }
      }];

      const paymentRequest = new PaymentRequest(methodData, details);

      return from(paymentRequest.show()).pipe(
        map((paymentResponse) => {
          // Complete the payment
          paymentResponse.complete('success');
          return {
            success: true,
            message: 'Payment processed successfully',
            feature: 'paymentRequest'
          };
        }),
        catchError((error: Error) => {
          if (error.name === 'AbortError') {
            return of({
              success: false,
              message: 'Payment was cancelled by user',
              feature: 'paymentRequest',
              error: 'USER_CANCELLED'
            });
          }
          return of({
            success: false,
            message: 'Payment failed',
            feature: 'paymentRequest',
            error: error.message
          });
        })
      );
    } catch (error) {
      return of({
        success: false,
        message: 'Failed to initialize payment request',
        feature: 'paymentRequest',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Battery API (deprecated but good for demo)
   */
  getBatteryInfo(): Observable<ApiResponse<BatteryInfo>> {
    const navigator_any = navigator as any;

    if (!navigator_any.getBattery) {
      return of({
        success: false,
        error: 'Battery API not supported (deprecated in most browsers)',
        timestamp: new Date()
      });
    }

    return from(navigator_any.getBattery()).pipe(
      map((battery: any) => ({
        success: true,
        data: {
          level: battery.level,
          charging: battery.charging,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime
        },
        timestamp: new Date()
      })),
      catchError((error: Error) => of({
        success: false,
        error: error.message,
        timestamp: new Date()
      }))
    );
  }

  /**
   * Feature detection summary
   */
  getFeatureSupport(): Record<string, FeatureSupport> {
    const features = [
      'startViewTransition',
      'clipboard',
      'intersectionObserver',
      'resizeObserver',
      'paymentRequest',
      'webShare',
      'notifications'
    ];

    const support: Record<string, FeatureSupport> = {};
    features.forEach(feature => {
      support[feature] = this.checkApiSupport(feature);
    });

    return support;
  }
}