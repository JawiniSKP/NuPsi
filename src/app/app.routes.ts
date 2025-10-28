// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage),
  },
  { 
    path: 'planes', 
    loadComponent: () => import('./pages/planes/planes.page').then((m) => m.PlanesPage) 
  },
  {
    path: 'indicators',
    loadComponent: () => import('./pages/indicators/indicators.page').then(m => m.IndicatorsPage),
  },
  // Agrega estas rutas que faltan:
  // En app.routes.ts - AÑADIR ESTA RUTA
  {
    path: 'receta-detalle/:id',
    loadComponent: () => import('./pages/planes/receta-detalle.page').then(m => m.RecetaDetallePage)
  },
  { 
    path: 'chat', 
    loadComponent: () => import('./pages/chat/chat.page').then((m) => m.ChatPage) 
  },

  {
    path: '**',
    redirectTo: 'home'
  }
];