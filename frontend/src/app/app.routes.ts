import { Routes } from '@angular/router';
import { authGuard } from './features/auth/auth.guard';
import { adminGuard } from './features/auth/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home').then((m) => m.Home),
      },
      {
        path: 'recipes',
        loadComponent: () => import('./features/recipes/recipes').then((m) => m.Recipes),
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile').then((m) => m.Profile),
      },
      {
        path: 'groups',
        loadComponent: () => import('./features/groups/groups').then((m) => m.Groups),
      },
      {
        path: 'groups/:id',
        loadComponent: () =>
          import('./features/groups/group-detail/group-detail').then((m) => m.GroupDetail),
      },
      {
        path: 'hue',
        loadComponent: () => import('./features/hue/hue').then((m) => m.Hue),
      },
      {
        path: 'users',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/users/users').then((m) => m.Users),
      },
      {
        path: 'calendar',
        loadComponent: () => import('./features/calendar/calendar').then((m) => m.Calendar),
      },
    ],

  },
];
