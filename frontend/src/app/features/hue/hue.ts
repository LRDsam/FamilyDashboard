import { Component, OnInit, inject, signal } from '@angular/core';
import { Card } from '../../shared/card/card';
import { Button } from '../../shared/button/button';
import { Grid } from '../../shared/grid/grid';
import { GridSpan } from '../../shared/grid/grid-span';
import { LightCard } from './light-card/light-card';
import { HueService } from './hue.service';
import { HueLight, HueStatus } from './hue.model';

@Component({
  selector: 'app-hue',
  imports: [Card, Button, Grid, GridSpan, LightCard],
  template: `
    <h1>Verlichting</h1>

    @if (status(); as status) {
      @if (status.isPaired) {
        <app-grid>
          @for (light of lights(); track light.id) {
            <app-light-card
              [appGridSpan]="4"
              [light]="light"
              (toggle)="onToggle($event)"
              (brightnessChange)="onBrightnessChange($event)"
            />
          }
        </app-grid>
      } @else {
        <app-card>
          <span card-title>Hue-bridge koppelen</span>

          @if (!status.bridgeIp) {
            <p>Zoek eerst je Hue-bridge op het netwerk.</p>
            <app-button
              [label]="isDiscovering() ? 'Bezig met zoeken...' : 'Zoek bridge'"
              variant="success"
              (buttonClick)="onDiscover()"
            />
          } @else {
            <p>
              Druk op de knop op je Hue-bridge en klik daarna op "Bevestigen" — je hebt hier
              ongeveer 30 seconden voor.
            </p>
            <app-button
              [label]="isPairing() ? 'Bezig...' : 'Bevestigen'"
              variant="success"
              (buttonClick)="onConfirmPair()"
            />
          }

          @if (errorMessage()) {
            <p class="error" role="alert">{{ errorMessage() }}</p>
          }
        </app-card>
      }
    }
  `,
  styles: `
    :host {
      display: block;
    }

    h1 {
      margin: 0 0 1rem;
      font-size: 1.5rem;
    }

    p {
      margin: 0 0 1rem;
    }

    .error {
      margin-top: 0.75rem;
      margin-bottom: 0;
      color: #b91c1c;
      font-size: 0.875rem;
    }
  `,
})
export class Hue implements OnInit {
  private readonly hueService = inject(HueService);

  protected readonly status = signal<HueStatus | null>(null);
  protected readonly lights = signal<HueLight[]>([]);
  protected readonly isDiscovering = signal(false);
  protected readonly isPairing = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.hueService.getStatus().subscribe((status) => {
      this.status.set(status);

      if (status.isPaired) {
        this.loadLights();
      }
    });
  }

  protected onDiscover(): void {
    if (this.isDiscovering()) {
      return;
    }

    this.errorMessage.set(null);
    this.isDiscovering.set(true);

    this.hueService.discover().subscribe({
      next: (result) => {
        this.isDiscovering.set(false);
        this.status.update((current) =>
          current ? { ...current, bridgeIp: result.bridgeIp } : current
        );
      },
      error: () => {
        this.isDiscovering.set(false);
        this.errorMessage.set('Geen Hue-bridge gevonden op dit netwerk.');
      },
    });
  }

  protected onConfirmPair(): void {
    if (this.isPairing()) {
      return;
    }

    this.errorMessage.set(null);
    this.isPairing.set(true);

    this.hueService.pair().subscribe({
      next: (result) => {
        this.isPairing.set(false);

        if (result.paired) {
          this.status.update((current) => (current ? { ...current, isPaired: true } : current));
          this.loadLights();
          return;
        }

        this.errorMessage.set(result.message ?? 'Koppelen is mislukt.');
      },
      error: () => {
        this.isPairing.set(false);
        this.errorMessage.set('Koppelen is mislukt.');
      },
    });
  }

  protected onToggle(event: { id: string; on: boolean }): void {
    this.hueService.setOn(event.id, event.on).subscribe(() => {
      this.lights.update((lights) =>
        lights.map((light) => (light.id === event.id ? { ...light, on: event.on } : light))
      );
    });
  }

  protected onBrightnessChange(event: { id: string; brightness: number }): void {
    this.hueService.setBrightness(event.id, event.brightness).subscribe(() => {
      this.lights.update((lights) =>
        lights.map((light) =>
          light.id === event.id ? { ...light, brightness: event.brightness } : light
        )
      );
    });
  }

  private loadLights(): void {
    this.hueService.getLights().subscribe((lights) => this.lights.set(lights));
  }
}
