import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private _isCollapsed = signal(false);
  public readonly isCollapsed = this._isCollapsed.asReadonly();

  public readonly isExpanded = computed(() => !this._isCollapsed());

  toggleSidebar(): void {
    this._isCollapsed.update(value => !value);
  }

  collapseSidebar(): void {
    this._isCollapsed.set(true);
  }

  expandSidebar(): void {
    this._isCollapsed.set(false);
  }

  isMobile(): boolean {
    return typeof window !== 'undefined' && window.innerWidth <= 768;
  }

  autoCloseOnMobile(): void {
    if (this.isMobile() && !this._isCollapsed()) {
      this.collapseSidebar();
    }
  }
}