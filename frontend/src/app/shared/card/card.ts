import { Component } from '@angular/core';

/**
 * Generic content card with a title at the top.
 *
 * Usage:
 * <app-card>
 *   <span card-title>Weather</span>
 *   <p>Sunny, 21°C</p>
 * </app-card>
 *
 * The title slot accepts any content (icons, buttons, not just text),
 * so it's projected as-is inside an <h2> for correct heading structure.
 */
@Component({
  selector: 'app-card',
  template: `
    <h2 class="card-title">
      <ng-content select="[card-title]" />
    </h2>
    <div class="card-body">
      <ng-content />
    </div>
  `,
  styles: `
    :host {
      display: block;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: #fff;
      overflow: hidden;
    }

    .card-title {
      margin: 0;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #e5e7eb;
      font-size: 1rem;
      font-weight: 600;
      color: #111827;
    }

    .card-body {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 1rem;
    }
  `,
})
export class Card {}
