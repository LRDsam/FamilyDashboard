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
        [routerLink]="link()"
        [target]="newTab() ? '_blank' : undefined"
      >
        {{ label() }}
      </a>
    } @else {
      <button
        class="app-button"
        [class.success]="variant() === 'success'"
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
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border: 1px solid transparent;
      border-radius: 6px;
      background: #2563eb;
      color: #fff;
      font-size: 0.9375rem;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
    }

    .app-button:hover {
      background: #1d4ed8;
    }

    .app-button:focus-visible {
      outline: 2px solid #1d4ed8;
      outline-offset: 2px;
    }

    .app-button.success {
      background: #86efac;
      color: #14532d;
    }

    .app-button.success:hover {
      background: #6ee7a0;
    }

    .app-button.success:focus-visible {
      outline: 2px solid #16a34a;
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
  readonly variant = input<'primary' | 'success'>('primary');
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
