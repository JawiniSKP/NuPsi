import { Injectable } from '@angular/core';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  authState,
  User
} from '@angular/fire/auth';
import { 
  Firestore, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc 
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({ 
  providedIn: 'root' 
})
export class AuthService {
  private userData = new BehaviorSubject<any>(null);
  
  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    // Escuchar cambios en la autenticación
    authState(this.auth).subscribe(async (user) => {
      this.userData.next(user);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        // Cargar o crear perfil del usuario
        await this.loadOrCreateUserProfile(user);
      } else {
        localStorage.removeItem('user');
      }
    });
  }

  // 🔄 NUEVO: Cargar o crear perfil del usuario
  private async loadOrCreateUserProfile(user: User) {
    const userRef = doc(this.firestore, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Crear perfil si no existe
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'Usuario',
        photoURL: user.photoURL || '',
        createdAt: new Date(),
        lastLogin: new Date()
      });
    } else {
      // Actualizar último login
      await updateDoc(userRef, {
        lastLogin: new Date()
      });
    }
  }

  // 🔄 NUEVO: Obtener perfil completo del usuario
  async getUserProfile(uid: string): Promise<any> {
    const userRef = doc(this.firestore, 'users', uid);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? userDoc.data() : null;
  }

  // 🔄 NUEVO: Obtener nombre del usuario actual
  async getCurrentUserName(): Promise<string> {
    const user = this.auth.currentUser;
    if (user) {
      const profile = await this.getUserProfile(user.uid);
      return profile?.displayName || user.email?.split('@')[0] || 'Usuario';
    }
    return 'Usuario';
  }

  // 🔄 NUEVO: Actualizar nombre del usuario
  async updateUserName(uid: string, displayName: string): Promise<void> {
    const userRef = doc(this.firestore, 'users', uid);
    await updateDoc(userRef, {
      displayName: displayName,
      updatedAt: new Date()
    });
  }

  // Login con email y contraseña (MODIFICADO para incluir nombre)
  async login(email: string, password: string): Promise<any> {
    try {
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      this.router.navigate(['/home']); // 🔄 Cambiado a home
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Registro con email y contraseña (MODIFICADO para incluir nombre)
  async register(email: string, password: string, displayName?: string): Promise<any> {
    try {
      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      
      // 🔄 NUEVO: Guardar nombre personalizado si se proporciona
      if (displayName) {
        await this.updateUserName(result.user.uid, displayName);
      }
      
      this.router.navigate(['/home']); // 🔄 Cambiado a home
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Login con Google (sin cambios)
  async googleLogin(): Promise<any> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      this.router.navigate(['/home']); // 🔄 Cambiado a home
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Logout (sin cambios)
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      localStorage.removeItem('user');
      this.router.navigate(['/login']);
    } catch (error) {
      throw error;
    }
  }

  // Obtener usuario actual como Observable (sin cambios)
  get user() {
    return this.userData.asObservable();
  }

  // Verificar si está autenticado (sin cambios)
  isAuthenticated(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return user !== null;
  }

  // Obtener el UID del usuario (sin cambios)
  getCurrentUserId(): string | null {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return user ? user.uid : null;
  }

  // Obtener usuario actual directamente (sin cambios)
  getCurrentUser() {
    return this.userData.value;
  }
}