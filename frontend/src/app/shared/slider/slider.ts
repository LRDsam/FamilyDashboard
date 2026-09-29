import { Component, input, output } from '@angular/core';

/**
 * Range slider. Like Toggle, [value] always reflects the *confirmed*
 * value — the parent is expected to make an API call on (valueChange)
 * and only update [value] once that succeeds.
 *
 * (valueChange) fires on release (the native "change" event), not on
 * every pixel of dragging (the native "input" event) — dragging still
 * moves the handle smoothly (that's the browser's own behavior), we
 * just avoid firing an API call per drag tick.
 *
 * Usage: <app-slider label="Helderheid" [value]="light.brightness" [min]="0" [max]="100"
 *           (valueChange)="onBrightnessChange(light.id, $event)" />
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
      gap: 0.25rem;
    }

    .field-label {
      font-size: 0.875rem;
      color: #374151;
    }

    input[type='range'] {
      accent-color: #2563eb;
    }

    input[type='range']:focus-visible {
      outline: 2px solid #2563eb;
      outline-offset: 2px;
    }
  `,
})
export class Slider {
  readonly value = input.required<number>();
  readonly min = input(0);
  readonly max = input(100);
  /** Minimum increment the slider can move — e.g. 1 for whole percentages. */
  readonly step = input(1);
  readonly label = input<string>();
  readonly valueChange = output<number>();

  protected onChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.valueChange.emit(Number(input.value));
  }
}
