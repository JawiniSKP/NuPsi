import { Injectable, inject } from '@angular/core';
import { FirebaseError } from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  handleFirebaseError(error: FirebaseError): string {
    console.error('Firebase Error:', error);
    
    switch (error.code) {
      case 'failed-precondition':
        return 'La base de datos no está disponible. Verifica tu conexión.';
      case 'unavailable':
        return 'Servicio no disponible. Intenta más tarde.';
      case 'permission-denied':
        return 'No tienes permisos para acceder a estos datos.';
      case 'not-found':
        return 'El documento no fue encontrado.';
      default:
        return 'Error de conexión. Verifica tu internet.';
    }
  }
}