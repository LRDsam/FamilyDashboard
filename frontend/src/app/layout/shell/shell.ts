import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { Sidenav } from '../sidenav/sidenav';

/**
 * Layout shell (header + sidenav + footer) around the logged-in part
 * of the app. Routes nested under this component's `<router-outlet>`
 * require authentication — see `authGuard` in app.routes.ts. The
 * login page itself is a sibling route, outside this shell, so it
 * renders standalone without this chrome.
 */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, Header, Footer, Sidenav],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {}
