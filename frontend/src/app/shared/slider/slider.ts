import { Component, input, output } from '@angular/core';

/**
 * Native range slider, label + value bound similarly to Toggle:
 * [value] always reflects the confirmed value, (valueChange) emits
 * the intended new value. Fires on native (change), not (input), so
 * it doesn't send an API call on every drag-tick — only once the
 * user lets go.
 *
 * Usage: <app-slider label="Helderheid" [value]="light.brightness" [step]="5" (valueChange)="onChange($event)" />
 */
@Component({
  selector: 'app-slider',
  template: `
    <label class="field">
      @if (label()) {
        <span class="field-label">{{ label() }}</span>
      }
      <input
        type="range"
        [min]="min()"
        [max]="max()"
        [step]="step()"
        [value]="value()"
        (change)="onChange($event)"
      />
    </label>
  `,
  styles: `
    :host {
      display: block;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .field-label {
      font-size: 0.875rem;
      color: var(--color-text-subtle);
    }

    input {
      accent-color: var(--color-primary);
    }
  `,
})
export class Slider {
  readonly value = input.required<number>();
  readonly min = input(0);
  readonly max = input(100);
  readonly step = input(1);
  readonly label = input<string>();
  readonly valueChange = output<number>();

  protected onChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.valueChange.emit(Number(input.value));
  }
}
