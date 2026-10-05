import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'sidenav-collapsed';

function readStoredCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    // localStorage can throw (disabled, private mode, full) — just
    // fall back to "not collapsed" rather than breaking the layout.
    return false;
  }
}

/**
 * Whether the sidenav is collapsed (fully hidden). Shared between
 * `Shell` (which resizes the layout grid and renders the toggle
 * button) and `Sidenav` itself (which hides its content when
 * collapsed), and persisted in localStorage so it's remembered
 * across reloads/visits.
 */
@Injectable({ providedIn: 'root' })
export class SidenavStateService {
  readonly collapsed = signal(readStoredCollapsed());

  toggle(): void {
    this.setCollapsed(!this.collapsed());
  }

  setCollapsed(value: boolean): void {
    this.collapsed.set(value);
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
      // Ignore — the toggle still works for the current page view,
      // it just won't be remembered next time.
    }
  }
}
