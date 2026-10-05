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
      gap: var(--space-1);
      margin: 0;
    }

    dt {
      font-size: 0.875rem;
      color: var(--color-text-subtle);
    }

    dd {
      margin: 0;
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--color-border-strong);
      border-radius: var(--radius-md);
      background: var(--color-surface-hover);
      color: var(--color-text);
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
