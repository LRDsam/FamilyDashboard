import { Component, input, output } from '@angular/core';

/**
 * Header row for a page or section that lists things: a title, room
 * for extra controls in between (e.g. Calendar's month prev/next),
 * and — this is the point of pulling it out into its own component —
 * always the *same* square "+" button for adding a new item, instead
 * of every page building its own ad-hoc header with its own button
 * style (a text button here, an icon button there, "+" baked into a
 * label somewhere else).
 *
 * Usage:
 * <app-section-header title="Groepen" addButtonLabel="Nieuwe groep toevoegen" (add)="isAddOpen.set(true)" />
 *
 * With extra controls between the title and the add button:
 * <app-section-header title="Agenda" addButtonLabel="Nieuw agendapunt toevoegen" (add)="onAddClick()">
 *   <div class="month-nav">...</div>
 * </app-section-header>
 *
 * Omit (add) or set [showAddButton]="false" to show just the title
 * (and any projected content) without an add button — e.g. for a
 * read-only list.
 *
 * Set [level]="2" for a header inside a page that already has its
 * own `<h1>` (e.g. "Leden" under a group's own title) — the only
 * effect is which heading tag is used, so there's still exactly one
 * `<h1>` per page.
 */
@Component({
  selector: 'app-section-header',
  template: `
    @if (level() === '2') {
      <h2>{{ title() }}</h2>
    } @else {
      <h1>{{ title() }}</h1>
    }

    <ng-content />

    @if (showAddButton()) {
      <button type="button" class="add-button" (click)="add.emit()" [attr.aria-label]="addButtonLabel()">
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M10 4a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H5a1 1 0 1 1 0-2h4V5a1 1 0 0 1 1-1Z" />
        </svg>
      </button>
    }
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--space-3);
      margin-bottom: var(--space-4);
    }

    h1,
    h2 {
      margin: 0;
    }

    h1 {
      font-size: 1.5rem;
    }

    h2 {
      font-size: 1.125rem;
    }

    .add-button {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 2.25rem;
      height: 2.25rem;
      padding: 0;
      border: none;
      border-radius: var(--radius-md);
      background: var(--color-primary);
      color: var(--color-text-on-dark);
      cursor: pointer;
    }

    .add-button:hover {
      background: var(--color-primary-hover);
    }

    .add-button svg {
      width: 1.25rem;
      height: 1.25rem;
    }
  `,
})
export class SectionHeader {
  readonly title = input.required<string>();
  /** Which heading tag to render. Defaults to '1' — use '2' when the page already has its own `<h1>`. */
  readonly level = input<'1' | '2'>('1');
  /** Accessible label for the add button, e.g. "Nieuwe groep toevoegen". Required whenever the add button is shown. */
  readonly addButtonLabel = input<string>('Toevoegen');
  readonly showAddButton = input(true);
  readonly add = output<void>();
}
