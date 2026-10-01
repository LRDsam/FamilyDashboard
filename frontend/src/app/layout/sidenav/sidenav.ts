import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../../features/profile/user.service';

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
        @if (isAdmin()) {
          <li>
            <a routerLink="/users" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
              Gebruikersbeheer
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
export class Sidenav implements OnInit {
  private readonly userService = inject(UserService);

  protected readonly isAdmin = signal(false);

  protected readonly navItems: NavItem[] = [
    { label: 'Home', path: '/' },
    { label: 'Recepten', path: '/recipes' },
    { label: 'Groepen', path: '/groups' },
    { label: 'Verlichting', path: '/hue' },
    { label: 'Agenda', path: '/calendar' },
  ];

  ngOnInit(): void {
    this.userService.getMe().subscribe((user) => this.isAdmin.set(user.isAdmin));
  }
}
