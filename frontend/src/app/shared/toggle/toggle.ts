import { Component, input, output } from '@angular/core';

/**
 * On/off switch. Doesn't manage its own state — [checked] always
 * reflects the *confirmed* value (from the parent), and (toggle)
 * emits the *intended* new value on click. The parent is expected to
 * make an API call and only update [checked] once that succeeds, so
 * the switch never shows a state the backend hasn't actually
 * confirmed.
 *
 * Usage: <app-toggle label="Aan/uit" [checked]="light.on" (toggle)="onToggle(light.id, $event)" />
 */
@Component({
  selector: 'app-toggle',
  template: `
    <label class="toggle-wrapper">
      @if (label()) {
        <span class="toggle-label">{{ label() }}</span>
      }
      <button
        type="button"
        role="switch"
        [attr.aria-checked]="checked()"
        class="switch"
        [class.on]="checked()"
        (click)="onClick()"
      >
        <span class="knob"></span>
      </button>
    </label>
  `,
  styles: `
    :host {
      display: inline-block;
    }

    .toggle-wrapper {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .toggle-label {
      font-size: 0.875rem;
      color: #374151;
    }

    .switch {
      position: relative;
      width: 2.75rem;
      height: 1.5rem;
      padding: 0;
      border: none;
      border-radius: 999px;
      background: #d1d5db;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .switch.on {
      background: #16a34a;
    }

    .switch:focus-visible {
      outline: 2px solid #2563eb;
      outline-offset: 2px;
    }

    .knob {
      position: absolute;
      top: 0.1875rem;
      left: 0.1875rem;
      width: 1.125rem;
      height: 1.125rem;
      border-radius: 50%;
      background: #fff;
      transition: transform 0.15s ease;
    }

    .switch.on .knob {
      transform: translateX(1.25rem);
    }
  `,
})
export class Toggle {
  readonly checked = input.required<boolean>();
  readonly label = input<string>();
  readonly toggle = output<boolean>();

  protected onClick(): void {
    this.toggle.emit(!this.checked());
  }
}
