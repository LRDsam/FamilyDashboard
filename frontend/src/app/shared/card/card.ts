import { Component, input, output } from '@angular/core';

/**
 * Generic content card with a title at the top, and optional
 * edit/delete icon buttons in the header.
 *
 * Usage:
 * <app-card>
 *   <span card-title>Weather</span>
 *   <p>Sunny, 21°C</p>
 * </app-card>
 *
 * Usage with edit/delete actions:
 * <app-card [editable]="true" (edit)="onEdit()" (delete)="onDelete()">
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
    <div class="card-header">
      <h2 class="card-title">
        <ng-content select="[card-title]" />
      </h2>

      @if (editable()) {
        <div class="card-actions">
          <button type="button" class="icon-button" (click)="edit.emit()" aria-label="Bewerken">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
          </button>
          <button
            type="button"
            class="icon-button delete"
            (click)="delete.emit()"
            aria-label="Verwijderen"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
          </button>
        </div>
      }
    </div>
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

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .card-title {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: #111827;
    }

    .card-actions {
      display: flex;
      flex-shrink: 0;
      gap: 0.375rem;
    }

    .icon-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      padding: 0;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: #f9fafb;
      color: #374151;
      cursor: pointer;
    }

    .icon-button svg {
      width: 1.125rem;
      height: 1.125rem;
    }

    .icon-button:hover {
      background: #f3f4f6;
    }

    .icon-button:focus-visible {
      outline: 2px solid #2563eb;
      outline-offset: 2px;
    }

    .icon-button.delete:hover {
      background: #fef2f2;
      border-color: #fca5a5;
      color: #b91c1c;
    }

    .card-body {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 1rem;
    }
  `,
})
export class Card {
  /** Shows the edit/delete icon buttons in the header when true. */
  readonly editable = input(false);
  readonly edit = output<void>();
  readonly delete = output<void>();
}
