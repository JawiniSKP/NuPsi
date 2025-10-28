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
import { doc, Firestore, setDoc, updateDoc, getDoc, Timestamp } from '@angular/fire/firestore';

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

  // Login con email y contraseña
  async login(email: string, password: string): Promise<any> {
    try {
      console.log('🔐 Iniciando login...');
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('✅ Login exitoso:', result.user.uid);
      return result;
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  }

  // Login con Google
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
        
        // 🎯 CRÍTICO: Verificar si el usuario YA EXISTE
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
            actualizadoEn: Timestamp.now()
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

        // 🎯 CRÍTICO: Guardar en 'usuarios' con la nueva estructura
        const userDocRef = doc(this.firestore, `usuarios/${result.user.uid}`);
        
        try {
          await setDoc(userDocRef, {
            nombreUsuario: name,
            correo: email,
            proveedorAuth: 'email',
            haCompletadoConfiguracionInicial: false, // 👈 Siempre false al crear
            creadoEn: Timestamp.now(),
            ultimoAcceso: Timestamp.now(),
            actualizadoEn: Timestamp.now()
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
}