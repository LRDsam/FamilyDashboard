import { Component } from '@angular/core';

@Component({
  selector: 'app-grid',
  template: `
    <ng-content />
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 1rem;
      width: 100%;
    }
  `,
})
export class Grid {}
