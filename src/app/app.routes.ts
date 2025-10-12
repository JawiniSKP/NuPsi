import { Routes } from '@angular/router';
// import { authGuard, noAuthGuard } from './guards/auth.guard'; // 👈 COMENTA TEMPORAL

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage),
    // canActivate: [authGuard] // 👈 COMENTA TEMPORAL
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
    // canActivate: [noAuthGuard] // 👈 COMENTA TEMPORAL
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage), // ✅ Asegúrate que dice RegisterPage
    // canActivate: [noAuthGuard] // 👈 COMENTA TEMPORAL
  },
  {
    path: 'indicators',
    loadComponent: () => import('./pages/indicators/indicators.page').then(m => m.IndicatorsPage),
    // canActivate: [authGuard] // 👈 COMENTA TEMPORAL
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];