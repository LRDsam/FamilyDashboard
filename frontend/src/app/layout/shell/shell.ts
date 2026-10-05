import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { Sidenav } from '../sidenav/sidenav';
import { SidenavStateService } from '../sidenav/sidenav-state.service';
import { ConfirmDialog } from '../../shared/confirm/confirm-dialog';

/**
 * Layout shell (header + sidenav + footer) around the logged-in part
 * of the app. Routes nested under this component's `<router-outlet>`
 * require authentication — see `authGuard` in app.routes.ts. The
 * login page itself is a sibling route, outside this shell, so it
 * renders standalone without this chrome.
 *
 * Also owns the sidenav collapse toggle: the button itself lives
 * here (not inside `Sidenav`) so it stays put, right on the
 * sidenav/main boundary, even once the sidenav's own width has
 * collapsed to 0 — see shell.scss's `.sidenav-toggle`.
 */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, Header, Footer, Sidenav, ConfirmDialog],
  host: {
    '[style.--sidenav-width]': 'sidenavWidth()',
  },
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  protected readonly sidenavState = inject(SidenavStateService);

  protected readonly sidenavWidth = computed(() => (this.sidenavState.collapsed() ? '0px' : '220px'));

  protected readonly toggleLabel = computed(() =>
    this.sidenavState.collapsed() ? 'Navigatie openen' : 'Navigatie sluiten',
  );

  protected toggleSidenav(): void {
    this.sidenavState.toggle();
  }
}
