import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage),
    canActivate: [authGuard] // ✅ PROTEGIDO
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
    canActivate: [noAuthGuard] // ✅ SOLO SI NO ESTÁ AUTENTICADO
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage),
    canActivate: [noAuthGuard] // ✅ SOLO SI NO ESTÁ AUTENTICADO
  },
  { 
    path: 'planes', 
    loadComponent: () => import('./pages/planes/planes.page').then(m => m.PlanesPage),
    canActivate: [authGuard] // ✅ PROTEGIDO
  },
  {
    path: 'ejercicios',
    loadComponent: () => import('./pages/ejercicios/ejercicios.page').then(m => m.EjerciciosPage),
    canActivate: [authGuard] // ✅ PROTEGIDO
  },
  {
    path: 'temporizador-ejercicio/:id',
    loadComponent: () => import('./pages/temporizador-ejercicio/temporizador-ejercicio.page').then(m => m.TemporizadorEjercicioPage),
    canActivate: [authGuard] // ✅ PROTEGIDO
  },
  {
    path: 'indicators',
    loadComponent: () => import('./pages/indicators/indicators.page').then(m => m.IndicatorsPage),
    canActivate: [authGuard] // ✅ PROTEGIDO
  },
  {
    path: 'chat', 
    loadComponent: () => import('./pages/chat/chat.page').then(m => m.ChatPage),
    canActivate: [authGuard] // ✅ PROTEGIDO
  },
  {
    path: 'receta-detalle/:id',
    loadComponent: () => import('./pages/receta-detalle/receta-detalle.page').then(m => m.RecetaDetallePage),
    canActivate: [authGuard] // ✅ PROTEGIDO
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.page').then(m => m.PerfilPage),
    canActivate: [authGuard] // ✅ PROTEGIDO
  },
  {
    path: 'ml-daily-form',
    loadComponent: () => import('./pages/ml-daily-form/ml-daily-form.page').then(m => m.MlDailyFormPage),
    canActivate: [authGuard] // ✅ PROTEGIDO
  },
  {
    path: 'aura-insights',
    loadComponent: () => import('./pages/aura-insights/aura-insights.page').then(m => m.AuraInsightsPage),
    canActivate: [authGuard] // ✅ PROTEGIDO
  },
  {
    path: 'bienestar-integral',
    loadComponent: () => import('./pages/bienestar-integral/bienestar-integral.page').then(m => m.BienestarIntegralPage),
    canActivate: [authGuard] // ✅ PROTEGIDO
  },
  {
    path: 'ml-history',
    loadComponent: () => import('./pages/ml-history/ml-history.page').then(m => m.MlHistoryPage),
    canActivate: [authGuard] // ✅ PROTEGIDO
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];