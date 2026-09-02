import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  readonly label: string;
  readonly path: string;
}

@Component({
  selector: 'app-sidenav',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav aria-label="Main navigation">
      <ul>
        @for (item of navItems; track item.path) {
          <li>
            <a
              [routerLink]="item.path"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: true }"
            >
              {{ item.label }}
            </a>
          </li>
        }
      </ul>
    </nav>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      background: #111827;
    }

    nav {
      padding-block: 1rem;
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    a {
      display: block;
      padding: 0.75rem 1.5rem;
      color: #d1d5db;
      text-decoration: none;
      font-size: 0.9375rem;
    }

    a:hover,
    a:focus-visible {
      background: #1f2937;
      color: #fff;
    }

    a.active {
      background: #374151;
      color: #fff;
      font-weight: 600;
    }
  `,
})
export class Sidenav {
  protected readonly navItems: NavItem[] = [
    { label: 'Home', path: '/' },
    { label: 'Recepten', path: '/recipes' },
  ];
}
