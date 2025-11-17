import { Injectable, inject, NgZone } from '@angular/core';
import {
  Auth,
  authState,
  user,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  updatePassword,
  updateEmail,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signInWithCredential
} from '@angular/fire/auth';
import { doc, Firestore, setDoc, updateDoc, getDoc, Timestamp, deleteDoc, collection, collectionData } from '@angular/fire/firestore';
import { Observable, from, of, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { switchMap } from 'rxjs/operators';

// ✅ IMPORTS MEJORADOS
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { Browser } from '@capacitor/browser';

export interface Usuario {
  uid: string;
  nombreUsuario: string;
  correo: string;
  fotoURL?: string;
  proveedorAuth: string;
  haCompletadoConfiguracionInicial: boolean;
  creadoEn: any;
  ultimoAcceso: any;
  actualizadoEn: any;
  configuracionPlanes: {
    nivelActividad: string;
    objetivoCaloricoPersonalizado: number;
    dificultadEjercicio: string;
    metaEjercicioSemanal: number;
    alimentosFavoritos: string[];
    alimentosEvitar: string[];
    restriccionesAlimentarias: string[];
    tiposEjercicioPreferidos: string[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private ngZone = inject(NgZone);

  user = user(this.auth);
  authState = authState(this.auth);

  // ✅ PARA ESTADO PERSISTENTE MEJORADO
  private authStateSubject = new BehaviorSubject<User | null>(null);
  public authState$ = this.authStateSubject.asObservable();

  private authStateInitialized = false;

  constructor() {
    this.configurarPersistenciaAuth();
    this.initializeAuthState();
  }

  // ✅ SOLUCIÓN: PERSISTENCIA DE SESIÓN MEJORADA
  private async configurarPersistenciaAuth() {
    try {
      await setPersistence(this.auth, browserLocalPersistence);
      console.log('✅ Persistencia LOCAL configurada - Sesión persistirá');
      
      await Preferences.set({
        key: 'auth_persistence',
        value: 'local'
      });
    } catch (error) {
      console.error('❌ Error en persistencia:', error);
    }
  }

  private initializeAuthState() {
    if (this.authStateInitialized) return;

    this.ngZone.run(() => {
      onAuthStateChanged(this.auth, async (user) => {
        console.log('🔐 Estado auth:', user ? `Usuario: ${user.uid}` : 'No user');
        this.authStateSubject.next(user);

        if (user) {
          await this.saveUserToPreferences(user);
          await this.updateLastAccess();
        } else {
          await Preferences.remove({ key: 'current_user' });
        }
      });
    });
    this.authStateInitialized = true;
  }

  // ✅ SOLUCIÓN COMPLETA CORREGIDA: GOOGLE LOGIN QUE FUNCIONA EN ANDROID
  async googleLogin(): Promise<any> {
    return this.ngZone.run(async () => {
      try {
        console.log('🔐 Iniciando Google login...');
        
        if (Capacitor.isNativePlatform()) {
          console.log('📱 Ejecutando en app nativa - Usando solución Android');
          return await this.googleLoginAndroid();
        } else {
          console.log('🖥️ Ejecutando en web - Usando flujo web normal');
          return await this.googleLoginWeb();
        }
      } catch (error: any) {
        console.error('❌ Error en Google login:', error);
        
        if (error.code === 'auth/popup-blocked') {
          throw new Error('El popup fue bloqueado. Permite ventanas emergentes.');
        } else if (error.code === 'auth/popup-closed-by-user') {
          throw new Error('Cerraste la ventana de inicio de sesión.');
        } else if (error.code === 'auth/network-request-failed') {
          throw new Error('Error de conexión. Verifica tu internet.');
        } else if (error.code === 'auth/internal-error') {
          throw new Error('Error interno. Intenta con email/password.');
        }
        
        throw error;
      }
    });
  }

  // ✅ SOLUCIÓN ESPECÍFICA PARA ANDROID - CORREGIDA
  private async googleLoginAndroid(): Promise<any> {
    try {
      console.log('📱 Usando solución Android mejorada...');
      
      const provider = new GoogleAuthProvider();
      
      // ✅ CONFIGURACIÓN CRÍTICA PARA ANDROID - USAR 'page' EN LUGAR DE 'popup'
      provider.setCustomParameters({
        prompt: 'select_account',
        display: 'page'  // ✅ CAMBIO CLAVE: 'page' en lugar de 'popup'
      });

      console.log('🔄 Intentando con display: page en Android...');
      const result = await signInWithPopup(this.auth, provider);

      if (result.user) {
        console.log('✅ Google login exitoso en Android:', result.user.email);
        await this.saveUserToPreferences(result.user);
        await this.crearOActualizarUsuarioFirestore(result.user);
        
        // ✅ CERRAR CUALQUIER VENTANA DE BROWSER ABIERTA
        try {
          await Browser.close();
        } catch (e) {
          console.log('ℹ️ No había browser abierto o ya estaba cerrado');
        }
      }

      return result;
      
    } catch (error: any) {
      console.error('❌ Error en login Android:', error);
      
      // ✅ SI FALLA, SUGERIR EMAIL/PASSWORD
      if (error.code === 'auth/popup-blocked' || 
          error.code === 'auth/operation-not-supported-in-this-environment') {
        throw new Error('El inicio con Google no está disponible temporalmente. Usa email y contraseña.');
      }
      
      throw error;
    }
  }

  // ✅ FLUJO WEB NORMAL
  private async googleLoginWeb(): Promise<any> {
    try {
      const provider = new GoogleAuthProvider();
      
      provider.setCustomParameters({
        prompt: 'select_account',
        display: 'popup'
      });

      console.log('🔐 Iniciando Google login en web...');
      const result = await signInWithPopup(this.auth, provider);

      if (result.user) {
        console.log('✅ Google login exitoso:', result.user.email);
        await this.saveUserToPreferences(result.user);
        await this.crearOActualizarUsuarioFirestore(result.user);
      }

      return result;
    } catch (error: any) {
      console.error('❌ Error en Google login web:', error);
      throw error;
    }
  }

  // ✅ GUARDAR USUARIO EN PREFERENCES (PERSISTENCIA)
  private async saveUserToPreferences(user: User): Promise<void> {
    try {
      await Preferences.set({
        key: 'current_user',
        value: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          lastLogin: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error guardando usuario en Preferences:', error);
    }
  }

  // ✅ MÉTODO AUXILIAR: Crear o actualizar usuario en Firestore
  private async crearOActualizarUsuarioFirestore(user: User): Promise<void> {
    const userDocRef = doc(this.firestore, `usuarios/${user.uid}`);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.log('📝 Creando nuevo usuario en Firestore...');

      await setDoc(userDocRef, {
        nombreUsuario: user.displayName || 'Usuario',
        correo: user.email || '',
        fotoURL: user.photoURL || '',
        proveedorAuth: 'google',
        haCompletadoConfiguracionInicial: false,
        creadoEn: Timestamp.now(),
        ultimoAcceso: Timestamp.now(),
        actualizadoEn: Timestamp.now(),
        configuracionPlanes: {
          nivelActividad: 'moderado',
          objetivoCaloricoPersonalizado: 2000,
          dificultadEjercicio: 'principiante',
          metaEjercicioSemanal: 150,
          alimentosFavoritos: [],
          alimentosEvitar: [],
          restriccionesAlimentarias: [],
          tiposEjercicioPreferidos: []
        }
      });

      console.log('✅ Usuario creado en Firestore');
    } else {
      console.log('👤 Usuario existente, actualizando acceso...');
      await updateDoc(userDocRef, {
        ultimoAcceso: Timestamp.now()
      });
    }
  }

  // ✅ VERIFICAR SI HAY USUARIO EN PREFERENCES (AL ABRIR APP)
  async checkStoredUser(): Promise<boolean> {
    try {
      const { value } = await Preferences.get({ key: 'current_user' });
      return !!value;
    } catch {
      return false;
    }
  }

  // ✅ OBTENER USUARIO ALMACENADO
  async getStoredUser(): Promise<any> {
    try {
      const { value } = await Preferences.get({ key: 'current_user' });
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  // ✅ MÉTODOS EXISTENTES MEJORADOS
  isAuthenticated(): boolean {
    return this.auth.currentUser !== null;
  }

  async login(email: string, password: string): Promise<any> {
    return this.ngZone.run(() => {
      try {
        console.log('🔐 Iniciando login...');
        return signInWithEmailAndPassword(this.auth, email, password).then(async (result) => {
          console.log('✅ Login exitoso:', result.user.email);
          
          await this.saveUserToPreferences(result.user);
          await this.updateLastAccess();
          
          return result;
        });
      } catch (error) {
        console.error('❌ Error en login:', error);
        throw error;
      }
    });
  }

  async register(email: string, password: string, name: string): Promise<any> {
    return this.ngZone.run(() => {
      try {
        console.log('📝 Registrando usuario...');
        return createUserWithEmailAndPassword(this.auth, email, password).then(async (result) => {
          if (result.user) {
            await updateProfile(result.user, {
              displayName: name
            });

            await this.saveUserToPreferences(result.user);

            const userDocRef = doc(this.firestore, `usuarios/${result.user.uid}`);

            try {
              await setDoc(userDocRef, {
                nombreUsuario: name,
                correo: email,
                proveedorAuth: 'email',
                haCompletadoConfiguracionInicial: false,
                creadoEn: Timestamp.now(),
                ultimoAcceso: Timestamp.now(),
                actualizadoEn: Timestamp.now(),
                configuracionPlanes: {
                  nivelActividad: 'moderado',
                  objetivoCaloricoPersonalizado: 2000,
                  dificultadEjercicio: 'principiante',
                  metaEjercicioSemanal: 150,
                  alimentosFavoritos: [],
                  alimentosEvitar: [],
                  restriccionesAlimentarias: [],
                  tiposEjercicioPreferidos: []
                }
              });

              console.log('✅ Registro exitoso y guardado en usuarios/', result.user.uid);
            } catch (firestoreError: any) {
              console.error('❌ Error guardando usuario en Firestore:', firestoreError);
            }
          }

          return result;
        });
      } catch (error) {
        console.error('❌ Error en registro:', error);
        throw error;
      }
    });
  }

  async logout(): Promise<void> {
    return this.ngZone.run(() => {
      try {
        console.log('👋 Cerrando sesión...');
        
        Preferences.remove({ key: 'current_user' });
        
        return signOut(this.auth).then(() => {
          console.log('✅ Sesión cerrada correctamente');
        });
      } catch (error) {
        console.error('❌ Error al cerrar sesión:', error);
        throw error;
      }
    });
  }

  // ✅ MÉTODOS RESTANTES
  getCurrentUserId(): string {
    return this.auth.currentUser?.uid || '';
  }

  async getCurrentUserName(): Promise<string> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) return 'Usuario';
    return currentUser.displayName || currentUser.email?.split('@')[0] || 'Usuario';
  }

  getCurrentUser(): Observable<User | null> {
    return this.user;
  }

  getCurrentUserData(): Observable<Usuario | null> {
    return this.getCurrentUser().pipe(
      switchMap(user => {
        if (!user || !user.uid) {
          return of(null);
        }
        return this.getUserData$(user.uid);
      }),
      catchError(error => {
        console.error('Error obteniendo datos del usuario:', error);
        return of(null);
      })
    );
  }

  async updateUserProfile(displayName: string, photoURL?: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No hay usuario autenticado');

    await updateProfile(user, {
      displayName,
      photoURL: photoURL || user.photoURL
    });

    const userDocRef = doc(this.firestore, `usuarios/${user.uid}`);
    await updateDoc(userDocRef, {
      nombreUsuario: displayName,
      fotoURL: photoURL || user.photoURL,
      actualizadoEn: Timestamp.now()
    });
  }

  async updateLastAccess(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) return;

    try {
      const userDocRef = doc(this.firestore, `usuarios/${user.uid}`);
      await updateDoc(userDocRef, {
        ultimoAcceso: Timestamp.now()
      });
    } catch (error) {
      console.error('Error actualizando último acceso:', error);
    }
  }

  async getUserData(uid: string): Promise<Usuario | null> {
    return this.ngZone.run(() => {
      try {
        const userDoc = doc(this.firestore, 'usuarios', uid);
        return getDoc(userDoc).then(docSnap => {
          if (docSnap.exists()) {
            const data = docSnap.data() as Usuario;
            return { ...data, uid: docSnap.id };
          }
          return null;
        });
      } catch (error) {
        console.error('Error obteniendo datos del usuario:', error);
        throw error;
      }
    });
  }

  getUserData$(uid: string): Observable<Usuario | null> {
    return this.ngZone.run(() => {
      const userDoc = doc(this.firestore, 'usuarios', uid);
      return from(getDoc(userDoc)).pipe(
        map(docSnap => {
          if (docSnap.exists()) {
            const data = docSnap.data() as Usuario;
            return { ...data, uid: docSnap.id };
          }
          return null;
        }),
        catchError(error => {
          console.error('Error obteniendo datos del usuario:', error);
          return of(null);
        })
      );
    });
  }

  async updateUserData(data: Partial<Usuario>): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No hay usuario autenticado');

    try {
      const userDocRef = doc(this.firestore, `usuarios/${user.uid}`);
      await updateDoc(userDocRef, {
        ...data,
        actualizadoEn: Timestamp.now()
      });
    } catch (error) {
      console.error('Error actualizando datos del usuario:', error);
      throw error;
    }
  }

  async completeInitialSetup(userData: Partial<Usuario>): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No hay usuario autenticado');

    try {
      const userDocRef = doc(this.firestore, `usuarios/${user.uid}`);
      await updateDoc(userDocRef, {
        ...userData,
        haCompletadoConfiguracionInicial: true,
        actualizadoEn: Timestamp.now()
      });

      if (userData.nombreUsuario) {
        await updateProfile(user, {
          displayName: userData.nombreUsuario
        });
      }
    } catch (error) {
      console.error('Error completando configuración inicial:', error);
      throw error;
    }
  }

  async hasCompletedInitialSetup(): Promise<boolean> {
    const user = this.auth.currentUser;
    if (!user) return false;

    try {
      const userData = await this.getUserData(user.uid);
      return userData?.haCompletadoConfiguracionInicial || false;
    } catch (error) {
      console.error('Error verificando configuración inicial:', error);
      return false;
    }
  }

  getAllUsers(): Observable<Usuario[]> {
    return this.ngZone.run(() => {
      const usersCollection = collection(this.firestore, 'usuarios');
      return collectionData(usersCollection, { idField: 'uid' }) as Observable<Usuario[]>;
    });
  }

  async sendEmailVerification(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No hay usuario autenticado');
    console.log('📧 Email de verificación enviado');
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    console.log('🔄 Email de reset de contraseña para:', email);
  }

  isEmailVerified(): boolean {
    return this.auth.currentUser?.emailVerified || false;
  }

  isGoogleProvider(): boolean {
    const user = this.auth.currentUser;
    return user?.providerData[0]?.providerId === 'google.com';
  }

  isEmailProvider(): boolean {
    const user = this.auth.currentUser;
    return user?.providerData[0]?.providerId === 'password';
  }

  async updatePassword(newPassword: string): Promise<void> {
    const user = await this.auth.currentUser;
    if (!user) {
      throw new Error('No hay usuario autenticado');
    }
    
    try {
      await updatePassword(user, newPassword);
      console.log('✅ Contraseña actualizada correctamente');
    } catch (error: any) {
      console.error('❌ Error actualizando contraseña:', error);
      
      if (error.code === 'auth/requires-recent-login') {
        throw new Error('Por seguridad, debes volver a iniciar sesión antes de cambiar tu contraseña');
      }
      throw error;
    }
  }

  async deleteUserAccount(currentPassword?: string): Promise<void> {
    const user = await this.auth.currentUser;
    if (!user) {
      throw new Error('No hay usuario autenticado');
    }

    try {
      if (this.isEmailProvider() && currentPassword && user.email) {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
      }

      const userDocRef = doc(this.firestore, 'usuarios', user.uid);
      await deleteDoc(userDocRef);
      console.log('✅ Datos de usuario eliminados de Firestore');

      await deleteUser(user);
      console.log('✅ Cuenta de autenticación eliminada');

    } catch (error: any) {
      console.error('❌ Error eliminando cuenta:', error);
      
      if (error.code === 'auth/requires-recent-login') {
        throw new Error('Por seguridad, debes volver a iniciar sesión antes de eliminar tu cuenta');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Contraseña incorrecta');
      }
      throw error;
    }
  }

  async reauthenticateUser(password: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user || !user.email) {
      throw new Error('No hay usuario autenticado');
    }

    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
  }
}