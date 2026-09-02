import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  template: `
    <h1>Family Dashboard</h1>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      height: 64px;
      padding-inline: 1.5rem;
      background: #1f2937;
      color: #fff;
    }

    h1 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }
  `,
})
export class Header {}
