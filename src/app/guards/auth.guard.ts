import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';

export const authGuard = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return new Promise<boolean>(async (resolve) => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log('✅ AuthGuard: Usuario autenticado, acceso permitido');
        resolve(true);
      } else {
        console.log('🚫 AuthGuard: Usuario NO autenticado, redirigiendo a login');
        await router.navigate(['/login']);
        resolve(false);
      }
    });
  });
};

export const noAuthGuard = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return new Promise<boolean>(async (resolve) => {
    auth.onAuthStateChanged(async (user) => {
      if (!user) {
        console.log('✅ NoAuthGuard: Usuario NO autenticado, acceso permitido');
        resolve(true);
      } else {
        console.log('🚫 NoAuthGuard: Usuario YA autenticado, redirigiendo a home');
        await router.navigate(['/home']);
        resolve(false);
      }
    });
  });
};