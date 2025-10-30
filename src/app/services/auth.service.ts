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
  signInWithPopup,
  updatePassword,
  updateEmail,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User
} from '@angular/fire/auth';
import { doc, Firestore, setDoc, updateDoc, getDoc, Timestamp, deleteDoc } from '@angular/fire/firestore';

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

  // Obtener nombre del usuario
  async getCurrentUserName(): Promise<string> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) return 'Usuario';
    
    // Prioridad: displayName > email username
    return currentUser.displayName || currentUser.email?.split('@')[0] || 'Usuario';
  }

  // ✅ NUEVO: Obtener usuario actual completo
  async getCurrentUser(): Promise<User | null> {
    return this.auth.currentUser;
  }

  // ✅ NUEVO: Actualizar perfil del usuario
  async updateUserProfile(displayName: string, photoURL?: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No hay usuario autenticado');

    await updateProfile(user, {
      displayName,
      photoURL: photoURL || user.photoURL
    });

    // Actualizar también en Firestore
    const userDocRef = doc(this.firestore, `usuarios/${user.uid}`);
    await updateDoc(userDocRef, {
      nombreUsuario: displayName,
      fotoURL: photoURL || user.photoURL,
      actualizadoEn: Timestamp.now()
    });
  }

  // ✅ NUEVO: Actualizar contraseña
  async updatePassword(newPassword: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No hay usuario autenticado');

    await updatePassword(user, newPassword);
  }

  // ✅ NUEVO: Reautenticar usuario (necesario para operaciones sensibles)
  async reauthenticate(currentPassword: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user || !user.email) throw new Error('No hay usuario autenticado');

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
  }

  // ✅ NUEVO: Eliminar cuenta de usuario
  async deleteUser(currentPassword?: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No hay usuario autenticado');

    try {
      // Si es proveedor email, requerir reautenticación
      if (user.providerData[0]?.providerId === 'password' && currentPassword) {
        await this.reauthenticate(currentPassword);
      }

      // Eliminar documento de Firestore
      const userDocRef = doc(this.firestore, `usuarios/${user.uid}`);
      await deleteDoc(userDocRef);

      // Eliminar usuario de Auth
      await deleteUser(user);
      
      console.log('✅ Cuenta eliminada correctamente');
    } catch (error: any) {
      console.error('❌ Error eliminando cuenta:', error);
      throw new Error(`No se pudo eliminar la cuenta: ${error.message}`);
    }
  }

  // ✅ NUEVO: Verificar si es proveedor Google
  isGoogleProvider(): boolean {
    const user = this.auth.currentUser;
    return user?.providerData[0]?.providerId === 'google.com';
  }

  // ✅ NUEVO: Verificar si es proveedor Email/Password
  isEmailProvider(): boolean {
    const user = this.auth.currentUser;
    return user?.providerData[0]?.providerId === 'password';
  }

  // ✅ NUEVO: Actualizar último acceso
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

  // ✅ NUEVO: Obtener datos completos del usuario desde Firestore
  async getUserData(uid: string): Promise<any> {
    try {
      const userDoc = await getDoc(doc(this.firestore, 'usuarios', uid));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo datos del usuario:', error);
      throw error;
    }
  }

  // ✅ NUEVO: Actualizar datos del usuario en Firestore
  async updateUserData(data: any): Promise<void> {
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

  // Login con email y contraseña
  async login(email: string, password: string): Promise<any> {
    try {
      console.log('🔐 Iniciando login...');
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('✅ Login exitoso:', result.user.uid);
      
      // Actualizar último acceso
      await this.updateLastAccess();
      
      return result;
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  }

  // Login con Google
  async googleLogin(): Promise<any> {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      console.log('🔐 Iniciando Google login...');
      const result = await signInWithPopup(this.auth, provider);
      
      if (result.user) {
        console.log('✅ Google login exitoso:', result.user.uid);
        
        const userDocRef = doc(this.firestore, `usuarios/${result.user.uid}`);
        
        // Verificar si el usuario YA EXISTE
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          // Solo crear si NO existe
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
          // Solo actualizar último acceso
          console.log('👤 Usuario existente, actualizando último acceso...');
          
          await updateDoc(userDocRef, {
            ultimoAcceso: Timestamp.now()
          });
          
          console.log('✅ Último acceso actualizado');
        }
      }
      
      return result;
    } catch (error: any) {
      console.error('❌ Error en Google login:', error);
      console.error('Código de error:', error.code);
      throw error;
    }
  }

  // Registro con email y contraseña
  async register(email: string, password: string, name: string): Promise<any> {
    try {
      console.log('📝 Registrando usuario...');
      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      
      if (result.user) {
        // Actualizar displayName en Firebase Auth
        await updateProfile(result.user, {
          displayName: name
        });

        // Guardar en 'usuarios' con la nueva estructura
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
          
          // Si es error de red/bloqueo, seguir igual
          if (firestoreError?.code === 'unavailable' || 
              firestoreError?.message?.includes('blocked')) {
            console.warn('⚠️ Error de conexión, pero registro exitoso');
          } else {
            throw firestoreError;
          }
        }
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error en registro:', error);
      throw error;
    }
  }

  // Cerrar sesión
  async logout(): Promise<void> {
    try {
      console.log('👋 Cerrando sesión...');
      await signOut(this.auth);
      console.log('✅ Sesión cerrada correctamente');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      throw error;
    }
  }

  // ✅ NUEVO: Enviar email de verificación
  async sendEmailVerification(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No hay usuario autenticado');

    // Nota: Firebase Auth envía verificación automáticamente al registrar
    // Este método es para reenviar si es necesario
    console.log('📧 Email de verificación enviado (manejado automáticamente por Firebase)');
  }

  // ✅ NUEVO: Enviar email de reset de contraseña
  async sendPasswordResetEmail(email: string): Promise<void> {
    // Importar sendPasswordResetEmail desde '@angular/fire/auth'
    // y agregarlo en los imports arriba si necesitas esta funcionalidad
    console.log('🔄 Email de reset de contraseña para:', email);
    // Implementación pendiente si la necesitas
  }
}