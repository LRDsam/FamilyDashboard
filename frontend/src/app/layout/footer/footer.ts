import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <p>&copy; {{ year() }} Family Dashboard</p>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-2) var(--space-5);
      background: var(--color-surface-hover);
      color: var(--color-chrome-muted);
      font-size: 0.875rem;
    }

    p {
      margin: 0;
    }
  `,
})
export class Footer {
  protected readonly year = signal(new Date().getFullYear());
}
