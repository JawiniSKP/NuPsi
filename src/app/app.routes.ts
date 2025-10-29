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
    loadComponent: () => import('./pages/planes/planes.page').then(m => m.PlanesPage) 
  },
  // ✅ NUEVA RUTA - Ejercicios
  {
    path: 'ejercicios',
    loadComponent: () => import('./pages/ejercicios/ejercicios.page').then(m => m.EjerciciosPage)
  },
  // ✅ NUEVA RUTA - Temporizador de Ejercicio
  {
    path: 'temporizador-ejercicio/:id',
    loadComponent: () => import('./pages/temporizador-ejercicio/temporizador-ejercicio.page').then(m => m.TemporizadorEjercicioPage)
  },
  {
    path: 'indicators',
    loadComponent: () => import('./pages/indicators/indicators.page').then(m => m.IndicatorsPage),
  },
  {
    path: 'chat', 
    loadComponent: () => import('./pages/chat/chat.page').then(m => m.ChatPage) 
  },
  {
    path: 'receta-detalle/:id',
    loadComponent: () => import('./pages/receta-detalle/receta-detalle.page').then(m => m.RecetaDetallePage)
  },
  {
    path: '**',
    redirectTo: 'home'
  },  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.page').then( m => m.PerfilPage)
  }

];