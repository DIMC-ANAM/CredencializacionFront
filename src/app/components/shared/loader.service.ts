import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private loaderMap = new Map<string, boolean>();
  private loaderStateSubject = new BehaviorSubject<boolean>(false);
  loaderState$ = this.loaderStateSubject.asObservable();

  private delayTimeouts = new Map<string, any>();
  private showTimestamps = new Map<string, number>();

  private readonly SHOW_DELAY = 200; // ms
  private readonly MIN_DISPLAY_TIME = 400; // ms

  show(key: string = 'global'): void {
    if (this.delayTimeouts.has(key)) {
      return; // ya se está programando un show
    }

    const timeout = setTimeout(() => {
      this.loaderMap.set(key, true);
      this.showTimestamps.set(key, Date.now());
      this.updateLoaderState();
      this.delayTimeouts.delete(key);
    }, this.SHOW_DELAY);

    this.delayTimeouts.set(key, timeout);
  }

  hide(key: string = 'global'): void {
    const delayTimeout = this.delayTimeouts.get(key);
    if (delayTimeout) {
      // Aún no se ha mostrado, cancelar el show
      clearTimeout(delayTimeout);
      this.delayTimeouts.delete(key);
      return;
    }

    const showTime = this.showTimestamps.get(key);
    const now = Date.now();

    if (showTime) {
      const elapsed = now - showTime;
      const remaining = this.MIN_DISPLAY_TIME - elapsed;

      if (remaining > 0) {
        // Esperar el tiempo restante antes de ocultar
        setTimeout(() => {
          this.loaderMap.set(key, false);
          this.updateLoaderState();
          this.showTimestamps.delete(key);
        }, remaining);
        return;
      }

      this.showTimestamps.delete(key);
    }

    this.loaderMap.set(key, false);
    this.updateLoaderState();
  }

  clear(): void {
    this.loaderMap.clear();
    this.loaderStateSubject.next(false);

    this.delayTimeouts.forEach(timeout => clearTimeout(timeout));
    this.delayTimeouts.clear();
    this.showTimestamps.clear();
  }

  private updateLoaderState(): void {
    const isAnyActive = Array.from(this.loaderMap.values()).some(value => value);
    this.loaderStateSubject.next(isAnyActive);
  }
}