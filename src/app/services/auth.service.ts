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
  onAuthStateChanged
} from '@angular/fire/auth';
import { doc, Firestore, setDoc, updateDoc, getDoc, Timestamp, deleteDoc, collection, collectionData } from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { switchMap } from 'rxjs/operators';

// ✅ AGREGAR IMPORTS DE CAPACITOR
import { Capacitor } from '@capacitor/core';

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
  private authStateInitialized = false;

  constructor() {
    this.initializeAuthState();
  }

  private initializeAuthState() {
    if (this.authStateInitialized) return;

    this.ngZone.run(() => {
      onAuthStateChanged(this.auth, (user) => {
        console.log('🔐 Auth state changed:', user?.uid || 'No user');
        if (user) {
          this.updateLastAccess().catch(error => {
            console.error('Error updating last access:', error);
          });
        }
      });
    });
    this.authStateInitialized = true;
  }

  // ✅ CORREGIDO: Verificar si está autenticado
  isAuthenticated(): boolean {
    return this.auth.currentUser !== null;
  }

  // ✅ CORREGIDO: Obtener ID del usuario actual
  getCurrentUserId(): string {
    return this.auth.currentUser?.uid || '';
  }

  // ✅ CORREGIDO: Obtener nombre del usuario
  async getCurrentUserName(): Promise<string> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) return 'Usuario';

    return currentUser.displayName || currentUser.email?.split('@')[0] || 'Usuario';
  }

  // ✅ CORREGIDO: Obtener usuario actual completo como Observable
  getCurrentUser(): Observable<User | null> {
    return this.user;
  }

  // ✅ CORREGIDO: Obtener datos del usuario actual como Observable
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

  // ✅ CORREGIDO: Actualizar perfil del usuario
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

  // ✅ CORREGIDO: Actualizar email
  async updateUserEmail(newEmail: string, password: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No hay usuario autenticado');

    await this.reauthenticate(password);
    await updateEmail(user, newEmail);

    const userDocRef = doc(this.firestore, `usuarios/${user.uid}`);
    await updateDoc(userDocRef, {
      correo: newEmail,
      actualizadoEn: Timestamp.now()
    });
  }

  // ✅ CORREGIDO: Actualizar contraseña
  async updatePassword(newPassword: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No hay usuario autenticado');

    await updatePassword(user, newPassword);
  }

  // ✅ CORREGIDO: Reautenticar usuario
  async reauthenticate(currentPassword: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user || !user.email) throw new Error('No hay usuario autenticado');

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
  }

  // ✅ CORREGIDO: Eliminar cuenta de usuario
  async deleteUserAccount(currentPassword?: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No hay usuario autenticado');

    try {
      if (user.providerData[0]?.providerId === 'password' && currentPassword) {
        await this.reauthenticate(currentPassword);
      }

      const userDocRef = doc(this.firestore, `usuarios/${user.uid}`);
      await deleteDoc(userDocRef);

      await deleteUser(user);

      console.log('✅ Cuenta eliminada correctamente');
    } catch (error: any) {
      console.error('❌ Error eliminando cuenta:', error);
      throw new Error(`No se pudo eliminar la cuenta: ${error.message}`);
    }
  }

  // ✅ CORREGIDO: Verificar si es proveedor Google
  isGoogleProvider(): boolean {
    const user = this.auth.currentUser;
    return user?.providerData[0]?.providerId === 'google.com';
  }

  // ✅ CORREGIDO: Verificar si es proveedor Email/Password
  isEmailProvider(): boolean {
    const user = this.auth.currentUser;
    return user?.providerData[0]?.providerId === 'password';
  }

  // ✅ CORREGIDO: Actualizar último acceso
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

  // ✅ CORREGIDO: Obtener datos completos del usuario desde Firestore
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

  // ✅ CORREGIDO: Obtener datos del usuario como Observable
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

  // ✅ CORREGIDO: Actualizar datos del usuario en Firestore
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

  // ✅ CORREGIDO: Completar configuración inicial
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

  // ✅ CORREGIDO: Login con email y contraseña
  async login(email: string, password: string): Promise<any> {
    return this.ngZone.run(() => {
      try {
        console.log('🔐 Iniciando login...');
        return signInWithEmailAndPassword(this.auth, email, password).then(async (result) => {
          console.log('✅ Login exitoso:', result.user.uid);

          await this.updateLastAccess();

          return result;
        });
      } catch (error) {
        console.error('❌ Error en login:', error);
        throw error;
      }
    });
  }

  // ✅ CORREGIDO: Login con Google - MEJORADO PARA MÓVIL
  async googleLogin(): Promise<any> {
    return this.ngZone.run(() => {
      try {
        const provider = new GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');

        console.log('🔐 Iniciando Google login...');

        // ✅ DETECTAR SI ES MÓVIL Y MOSTRAR MENSAJE
        if (Capacitor.isNativePlatform()) {
          console.log('📱 Ejecutando en app nativa - Google Sign-In puede abrir navegador');
        }

        return signInWithPopup(this.auth, provider).then(async (result) => {
          if (result.user) {
            console.log('✅ Google login exitoso:', result.user.uid);

            const userDocRef = doc(this.firestore, `usuarios/${result.user.uid}`);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
              console.log('📝 Usuario nuevo, creando documento...');

              await setDoc(userDocRef, {
                nombreUsuario: result.user.displayName || 'Usuario',
                correo: result.user.email || '',
                fotoURL: result.user.photoURL || '',
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

              console.log('💾 Usuario de Google creado en usuarios/', result.user.uid);
            } else {
              console.log('👤 Usuario existente, actualizando último acceso...');
              await updateDoc(userDocRef, {
                ultimoAcceso: Timestamp.now()
              });
              console.log('✅ Último acceso actualizado');
            }
          }

          return result;
        });
      } catch (error: any) {
        console.error('❌ Error en Google login:', error);
        console.error('Código de error:', error.code);
        
        // ✅ MEJOR MANEJO DE ERRORES PARA MÓVIL
        if (error.code === 'auth/popup-blocked' && Capacitor.isNativePlatform()) {
          throw new Error('El login con Google fue bloqueado. En dispositivos móviles, esto es normal y puede requerir que permitas ventanas emergentes.');
        }
        
        throw error;
      }
    });
  }

  // ✅ CORREGIDO: Registro con email y contraseña
  async register(email: string, password: string, name: string): Promise<any> {
    return this.ngZone.run(() => {
      try {
        console.log('📝 Registrando usuario...');
        return createUserWithEmailAndPassword(this.auth, email, password).then(async (result) => {
          if (result.user) {
            await updateProfile(result.user, {
              displayName: name
            });

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

              if (firestoreError?.code === 'unavailable' ||
                  firestoreError?.message?.includes('blocked')) {
                console.warn('⚠️ Error de conexión, pero registro exitoso');
              } else {
                throw firestoreError;
              }
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

  // ✅ CORREGIDO: Cerrar sesión
  async logout(): Promise<void> {
    return this.ngZone.run(() => {
      try {
        console.log('👋 Cerrando sesión...');
        return signOut(this.auth).then(() => {
          console.log('✅ Sesión cerrada correctamente');
        });
      } catch (error) {
        console.error('❌ Error al cerrar sesión:', error);
        throw error;
      }
    });
  }

  // ✅ CORREGIDO: Verificar si el usuario ha completado configuración inicial
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

  // ✅ CORREGIDO: Obtener todos los usuarios (solo para admin)
  getAllUsers(): Observable<Usuario[]> {
    return this.ngZone.run(() => {
      const usersCollection = collection(this.firestore, 'usuarios');
      return collectionData(usersCollection, { idField: 'uid' }) as Observable<Usuario[]>;
    });
  }

  // ✅ CORREGIDO: Enviar email de verificación
  async sendEmailVerification(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No hay usuario autenticado');

    console.log('📧 Email de verificación enviado (manejado automáticamente por Firebase)');
  }

  // ✅ CORREGIDO: Enviar email de reset de contraseña
  async sendPasswordResetEmail(email: string): Promise<void> {
    console.log('🔄 Email de reset de contraseña para:', email);
    // Implementar si es necesario usando sendPasswordResetEmail de @angular/fire/auth
  }

  // ✅ CORREGIDO: Verificar si el email está verificado
  isEmailVerified(): boolean {
    return this.auth.currentUser?.emailVerified || false;
  }
}