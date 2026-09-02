import { Component } from '@angular/core';
import { Card } from '../../shared/card/card';
import { Grid } from '../../shared/grid/grid';
import { GridSpan } from '../../shared/grid/grid-span';
import { ImageDisplay } from '../../shared/image-display/image-display';
import { TextDisplay } from '../../shared/text-display/text-display';

@Component({
  selector: 'app-home',
  imports: [Grid, GridSpan, Card, TextDisplay, ImageDisplay],
  template: `
    <app-grid>
      <app-card [appGridSpan]="6">
        <span card-title>Profile</span>
        <app-image-display label="Photo" src="https://picsum.photos/id/1015/400/300" />
        <app-text-display label="Name" value="Sam" />
        <app-text-display label="Status" value="Online" />
      </app-card>

      <app-card [appGridSpan]="6">
        <span card-title>Weather</span>
        <app-text-display label="Temp" value="21°C" />
      </app-card>

      <app-card [appGridSpan]="12">
        <span card-title>Notes</span>
        <app-text-display
          label="Reminders"
          value="Pick up groceries after work.&#10;Book the plumber for Thursday.&#10;Don't forget the school pickup at 3pm."
          [multiline]="true"
        />
      </app-card>
    </app-grid>
  `,
})
export class Home {}
