import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';

export const authGuard = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return new Promise<boolean>(async (resolve) => {
    const user = auth.currentUser;
    
    if (user) {
      resolve(true);
    } else {
      console.log('User not authenticated, redirecting to login');
      await router.navigate(['/login']);
      resolve(false);
    }
  });
};

export const noAuthGuard = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return new Promise<boolean>(async (resolve) => {
    const user = auth.currentUser;
    
    if (!user) {
      resolve(true);
    } else {
      console.log('User already authenticated, redirecting to home');
      await router.navigate(['/home']);
      resolve(false);
    }
  });
};