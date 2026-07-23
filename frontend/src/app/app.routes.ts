import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
    title: 'Trần Vũ Thiện — Software Development Engineer',
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found').then((m) => m.NotFound),
    title: '404 — Trần Vũ Thiện',
  },
];
