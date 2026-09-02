import { Directive, input } from '@angular/core';

/**
 * Declares how many of the 12 grid columns an element placed inside
 * `<app-grid>` should span.
 *
 * Usage: <app-card appGridSpan="4">...</app-card>
 */
@Directive({
  selector: '[appGridSpan]',
  host: {
    '[style.grid-column]': '"span " + span()',
  },
})
export class GridSpan {
  readonly span = input.required<number>({ alias: 'appGridSpan' });
}
