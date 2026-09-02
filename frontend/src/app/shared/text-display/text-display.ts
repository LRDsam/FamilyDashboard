import { Component, input } from '@angular/core';

/**
 * Read-only label + value display, e.g. for showing a piece of data
 * that the user cannot edit here.
 *
 * Usage: <app-text-display label="Name" value="Sam" />
 * Multi-line usage: <app-text-display label="Notes" value="Line 1\nLine 2" [multiline]="true" />
 */
@Component({
  selector: 'app-text-display',
  template: `
    <dl>
      <dt>{{ label() }}</dt>
      <dd [class.multiline]="multiline()">{{ value() }}</dd>
    </dl>
  `,
  styles: `
    :host {
      display: block;
    }

    dl {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin: 0;
    }

    dt {
      font-size: 0.875rem;
      color: #374151;
    }

    dd {
      margin: 0;
      padding: 0.375rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: #f3f4f6;
      color: #1f2937;
    }

    dd.multiline {
      min-height: 4.5rem;
      white-space: pre-wrap;
    }
  `,
})
export class TextDisplay {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly multiline = input(false);
}
