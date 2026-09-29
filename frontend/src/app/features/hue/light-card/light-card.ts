import { Component, input, output } from '@angular/core';
import { Card } from '../../../shared/card/card';
import { Toggle } from '../../../shared/toggle/toggle';
import { Slider } from '../../../shared/slider/slider';
import { HueLight } from '../hue.model';

/**
 * Shows one light: name, an on/off toggle, and (if the light supports
 * dimming) a brightness slider. Deliberately dumb — it only emits
 * what the user wants to happen; the Hue page owns the actual API
 * calls and only updates [light] once those succeed, same pattern as
 * DataView's (remove) or GroupDetail's member handling.
 *
 * Usage:
 * <app-light-card [light]="light" (toggle)="onToggle($event)" (brightnessChange)="onBrightnessChange($event)" />
 */
@Component({
  selector: 'app-light-card',
  imports: [Card, Toggle, Slider],
  template: `
    <app-card>
      <span card-title>{{ light().name }}</span>

      <app-toggle label="Aan/uit" [checked]="light().on" (toggle)="onToggle($event)" />

      @if (light().brightness !== null) {
        <app-slider
          label="Helderheid"
          [value]="light().brightness!"
          (valueChange)="onBrightnessChange($event)"
        />
      }
    </app-card>
  `,
  styles: `
    :host {
      display: block;
    }

    app-toggle {
      display: block;
      margin-bottom: 0.75rem;
    }
  `,
})
export class LightCard {
  readonly light = input.required<HueLight>();
  readonly toggle = output<{ id: string; on: boolean }>();
  readonly brightnessChange = output<{ id: string; brightness: number }>();

  protected onToggle(on: boolean): void {
    this.toggle.emit({ id: this.light().id, on });
  }

  protected onBrightnessChange(brightness: number): void {
    this.brightnessChange.emit({ id: this.light().id, brightness });
  }
}
