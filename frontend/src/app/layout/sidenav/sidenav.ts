import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../../features/profile/user.service';
import { SidenavStateService } from './sidenav-state.service';

interface NavItem {
  readonly label: string;
  readonly path: string;
}

@Component({
  selector: 'app-sidenav',
  imports: [RouterLink, RouterLinkActive],
  host: {
    '[class.collapsed]': 'sidenavState.collapsed()',
  },
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
      overflow: hidden;
      background: var(--color-nav-bg);
      // Dark background — override the global focus ring so it's
      // actually visible on it.
      --color-focus-ring: var(--color-focus-ring-on-dark);
    }

    // The width itself is controlled by Shell (the grid column
    // shrinks to 0) — this just also takes the nav links out of the
    // tab order and off screen readers while that's happening,
    // which a width of 0 alone wouldn't do.
    :host(.collapsed) {
      visibility: hidden;
    }

    nav {
      padding-block: var(--space-4);
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    a {
      display: block;
      padding: var(--space-3) var(--space-5);
      color: var(--color-nav-text);
      text-decoration: none;
      font-size: 0.9375rem;
    }

    a:hover,
    a:focus-visible {
      background: var(--color-nav-bg-hover);
      color: var(--color-text-on-dark);
    }

    a.active {
      background: var(--color-nav-bg-active);
      color: var(--color-text-on-dark);
      font-weight: 600;
    }
  `,
})
export class Sidenav implements OnInit {
  private readonly userService = inject(UserService);
  protected readonly sidenavState = inject(SidenavStateService);

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
