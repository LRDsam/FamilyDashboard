import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Shared button component with a single visual style. The label is
 * centered inside the button.
 *
 * - With a `link`, it renders a real `<a>` — using `routerLink` for
 *   internal app routes, or a plain `href` for external URLs — so
 *   navigation stays fully accessible (open in new tab, right-click
 *   copy link, correct screen reader semantics).
 * - Without a `link`, it renders a native `<button>` and emits
 *   `buttonClick` on click.
 *
 * Usage:
 * <app-button label="Naar recepten" link="/recipes" />
 * <app-button label="Externe link" link="https://example.com" [newTab]="true" />
 * <app-button label="Opslaan" variant="success" [fullWidth]="true" (buttonClick)="save()" />
 */
@Component({
  selector: 'app-button',
  imports: [RouterLink],
  host: {
    '[class.full-width]': 'fullWidth()',
  },
  template: `
    @if (isExternalLink()) {
      <a
        class="app-button"
        [class.success]="variant() === 'success'"
        [class.danger]="variant() === 'danger'"
        [href]="link()"
        [target]="newTab() ? '_blank' : undefined"
        rel="noopener noreferrer"
      >
        {{ label() }}
      </a>
    } @else if (link()) {
      <a
        class="app-button"
        [class.success]="variant() === 'success'"
        [class.danger]="variant() === 'danger'"
        [routerLink]="link()"
        [target]="newTab() ? '_blank' : undefined"
      >
        {{ label() }}
      </a>
    } @else {
      <button
        class="app-button"
        [class.success]="variant() === 'success'"
        [class.danger]="variant() === 'danger'"
        [type]="type()"
        (click)="buttonClick.emit()"
      >
        {{ label() }}
      </button>
    }
  `,
  styles: `
    :host {
      display: inline-block;
    }

    :host(.full-width) {
      display: block;
    }

    :host(.full-width) .app-button {
      width: 100%;
    }

    .app-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-4);
      border: 1px solid transparent;
      border-radius: var(--radius-md);
      background: var(--color-primary);
      color: var(--color-text-on-dark);
      font-size: 0.9375rem;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
    }

    .app-button:hover {
      background: var(--color-primary-hover);
    }

    // No explicit :focus-visible rule needed here — the global one in
    // styles.scss applies, and the .success override below just
    // changes which color it uses on this element.
    .app-button.success {
      --color-focus-ring: var(--color-success);
      background: var(--color-success-bg);
      color: var(--color-success-text);
    }

    .app-button.success:hover {
      background: var(--color-success-bg-hover);
    }

    .app-button.danger {
      --color-focus-ring: var(--color-danger);
      border-color: var(--color-danger-border);
      background: var(--color-danger-bg);
      color: var(--color-danger);
    }

    .app-button.danger:hover {
      background: var(--color-danger-bg-hover);
    }
  `,
})
export class Button {
  /** Text shown inside the button, centered. */
  readonly label = input.required<string>();
  /** Internal route (e.g. `/recipes`) or external URL. Omit for an action button. */
  readonly link = input<string>();
  /** Native button `type`, only used when no `link` is set. */
  readonly type = input<'button' | 'submit'>('button');
  /** Visual color variant. */
  readonly variant = input<'primary' | 'success' | 'danger'>('primary');
  /** Stretch the button to the full width of its container. */
  readonly fullWidth = input(false);
  /** Open the link in a new tab (only relevant when `link` is set). */
  readonly newTab = input(false);
  readonly buttonClick = output<void>();

  protected readonly isExternalLink = computed(() => {
    const link = this.link();
    return !!link && /^([a-z][a-z0-9+.-]*:)?\/\//i.test(link);
  });
}
