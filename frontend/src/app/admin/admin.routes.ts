import { Routes } from '@angular/router';
import { adminGuard } from './admin.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login').then((m) => m.AdminLogin),
    title: 'Admin Login',
  },
  {
    path: '',
    canActivate: [adminGuard],
    loadComponent: () => import('./layout').then((m) => m.AdminLayout),
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      {
        path: 'profile',
        loadComponent: () => import('./profile-page').then((m) => m.ProfilePage),
        title: 'Admin · Profile',
      },
      {
        path: 'messages',
        loadComponent: () => import('./messages-page').then((m) => m.MessagesPage),
        title: 'Admin · Messages',
      },
      {
        path: ':resource',
        loadComponent: () => import('./resource-page').then((m) => m.ResourcePage),
        title: 'Admin · Content',
      },
    ],
  },
];
