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
      padding: 0.75rem 1.5rem;
      background: #f3f4f6;
      color: #4b5563;
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
