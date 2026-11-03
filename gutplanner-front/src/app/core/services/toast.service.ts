import { Injectable, OnDestroy, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  readonly id: number;
  readonly type: ToastType;
  readonly message: string;
  readonly closing: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService implements OnDestroy {
  private readonly currentToast = signal<Toast | null>(null);
  private nextId = 0;
  private dismissTimer?: ReturnType<typeof setTimeout>;
  private closingTimer?: ReturnType<typeof setTimeout>;
  readonly toast = this.currentToast.asReadonly();

  show(type: ToastType, message: string, duration = type === 'error' ? 0 : 5000): void {
    this.clearTimers();
    const id = ++this.nextId;
    this.currentToast.set({ id, type, message, closing: false });
    if (duration > 0) {
      this.dismissTimer = setTimeout(() => this.dismiss(id), duration);
    }
  }

  success(message: string, duration = 5000): void {
    this.show('success', message, duration);
  }

  error(message: string, duration = 0): void {
    this.show('error', message, duration);
  }

  warning(message: string, duration = 5000): void {
    this.show('warning', message, duration);
  }

  info(message: string, duration = 5000): void {
    this.show('info', message, duration);
  }

  dismiss(id: number): void {
    const toast = this.currentToast();
    if (!toast || toast.id !== id || toast.closing) return;
    this.clearTimers();
    this.currentToast.set({ ...toast, closing: true });
    this.closingTimer = setTimeout(() => {
      if (this.currentToast()?.id === id) this.currentToast.set(null);
    }, 200);
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  private clearTimers(): void {
    clearTimeout(this.dismissTimer);
    clearTimeout(this.closingTimer);
  }
}
