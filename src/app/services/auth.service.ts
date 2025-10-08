import { Injectable, inject } from '@angular/core';
import { 
  Auth, 
  authState, 
  user, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from '@angular/fire/auth';
import { doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { map, catchError } from 'rxjs/operators';
import { of, from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  
  user = user(this.auth);
  authState = authState(this.auth);

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    return this.auth.currentUser !== null;
  }

  // Obtener ID del usuario actual
  getCurrentUserId(): string {
    return this.auth.currentUser?.uid || '';
  }

  // Obtener nombre del usuario - MODIFICADO
  async getCurrentUserName(): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) return 'Usuario';
    
    try {
      // PRIMERO: Intentar obtener el nombre de Google Auth
      if (user.providerData && user.providerData.length > 0) {
        const googleProvider = user.providerData.find(
          (provider: any) => provider.providerId === 'google.com'
        );
        
        if (googleProvider?.displayName) {
          console.log('Nombre obtenido de Google:', googleProvider.displayName);
          return googleProvider.displayName;
        }
      }
      
      // SEGUNDO: Usar displayName directo de Firebase Auth
      if (user.displayName) {
        console.log('Nombre obtenido de displayName:', user.displayName);
        return user.displayName;
      }
      
      // TERCERO: Buscar en Firestore
      const userDoc = doc(this.firestore, `users/${user.uid}`);
      const userData = await new Promise<any>((resolve) => {
        const subscription = docData(userDoc).pipe(
          catchError(error => {
            console.error('Error getting user data:', error);
            resolve(null);
            return of(null);
          })
        ).subscribe(data => {
          resolve(data);
          subscription.unsubscribe();
        });
      });
      
      // CUARTO: Fallbacks sucesivos
      return userData?.name || user.email?.split('@')[0] || 'Usuario';
    } catch (error) {
      console.error('Error in getCurrentUserName:', error);
      return user.displayName || user.email?.split('@')[0] || 'Usuario';
    }
  }

  // Obtener perfil del usuario - MODIFICADO
  async getUserProfile(userId: string): Promise<any> {
    try {
      const userDoc = doc(this.firestore, `users/${userId}`);
      const userSnapshot = await new Promise<any>((resolve) => {
        const subscription = docData(userDoc).pipe(
          catchError(error => {
            console.error('Error getting user profile:', error);
            resolve(null);
            return of(null);
          })
        ).subscribe(data => {
          resolve(data);
          subscription.unsubscribe();
        });
      });
      return userSnapshot;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  }

  // Login con email y contraseña
  async login(email: string, password: string): Promise<any> {
    try {
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Login con Google - MEJORADO
  async googleLogin(): Promise<any> {
    try {
      const provider = new GoogleAuthProvider();
      // Solicitar permisos específicos para obtener el perfil
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(this.auth, provider);
      
      // Guardar información del usuario en Firestore
      if (result.user) {
        const userDoc = doc(this.firestore, `users/${result.user.uid}`);
        await setDoc(userDoc, {
          name: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
          provider: 'google',
          lastLogin: new Date(),
          createdAt: new Date()
        }, { merge: true });
        
        console.log('Usuario de Google guardado:', {
          name: result.user.displayName,
          email: result.user.email
        });
      }
      
      return result;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  // Registro con email y contraseña
  async register(email: string, password: string, name: string): Promise<any> {
    try {
      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      
      // Actualizar perfil del usuario
      if (result.user) {
        await updateProfile(result.user, {
          displayName: name
        });

        // Guardar información adicional en Firestore
        const userDoc = doc(this.firestore, `users/${result.user.uid}`);
        await setDoc(userDoc, {
          name: name,
          email: email,
          provider: 'email',
          createdAt: new Date()
        });
      }
      
      return result;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  // Cerrar sesión
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // NUEVO MÉTODO: Obtener información del proveedor
  getProviderData(): any[] {
    const user = this.auth.currentUser;
    return user?.providerData || [];
  }
}