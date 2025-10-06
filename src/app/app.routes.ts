import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './guards/auth.guard'; // Cambiar AuthGuard por authGuard

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage),
    canActivate: [authGuard] // Cambiar AuthGuard por authGuard
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
    canActivate: [noAuthGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage),
    canActivate: [noAuthGuard]
  },
  {
    path: 'indicators',
    loadComponent: () => import('./pages/indicators/indicators.page').then(m => m.IndicatorsPage),
    canActivate: [authGuard] // Cambiar AuthGuard por authGuard
  },
  // ELIMINA o COMENTA la ruta de progress que ya no existe
  // {
  //   path: 'progress',
  //   loadComponent: () => import('./pages/progress/progress.page').then(m => m.ProgressPage),
  //   canActivate: [authGuard]
  // },
  {
    path: '**',
    redirectTo: 'home'
  }
];
