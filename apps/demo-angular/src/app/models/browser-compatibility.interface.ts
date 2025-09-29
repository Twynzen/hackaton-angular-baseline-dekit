export interface BrowserSupport {
  chrome: string;
  firefox: string;
  safari: string;
  edge?: string;
}

export interface CompatibilityResult {
  success: boolean;
  message: string;
  feature?: string;
  browserSupport?: BrowserSupport;
  error?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  timestamp: Date;
  success: boolean;
}

export interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  tag?: string;
}

export interface PaymentDetails {
  total: {
    label: string;
    amount: {
      currency: string;
      value: string;
    };
  };
  displayItems?: Array<{
    label: string;
    amount: {
      currency: string;
      value: string;
    };
  }>;
}

export interface ShareData {
  title?: string;
  text?: string;
  url?: string;
}

export interface AnimationOptions {
  duration?: number;
  easing?: string;
  fill?: FillMode;
  delay?: number;
}

export interface BatteryInfo {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
}