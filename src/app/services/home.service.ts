import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  addDoc,
  collectionData
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// ============================================
// INTERFACES
// ============================================
export interface Usuario {
  nombreUsuario: string;
  correo: string;
  proveedorAuth: 'email' | 'google';
  fotoURL?: string;
  edad?: number;
  genero?: 'masculino' | 'femenino' | 'otro' | 'prefiero-no-decir';
  ubicacion?: {
    ciudad: string;
    region: string;
  };
  objetivos?: {
    pesoObjetivo?: number;
    imcObjetivo?: number;
    meta?: string;
  };
  haCompletadoConfiguracionInicial: boolean;
  creadoEn: Timestamp;
  ultimoAcceso: Timestamp;
  actualizadoEn: Timestamp;
}

export interface Indicador {
  id?: string;
  estadoAnimo: 'excelente' | 'bueno' | 'regular' | 'malo' | 'muy-malo';
  emociones: string[];
  peso?: number;
  estatura?: number;
  imc?: number;
  vasosAgua: number;
  notas?: string;
  esConfiguracionInicial: boolean;
  fecha: Timestamp;
  creadoEn: Timestamp;
}

export interface UltimosValoresFisicos {
  peso?: number;
  estatura?: number;
  imc?: number;
  fechaRegistro?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  // ✅ CORREGIDO: Inyección simple sin NgZone innecesario
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  // ============================================
  // ✅ CORREGIDO: Obtener usuario una sola vez - SIN NgZone
  // ============================================
  async getUsuarioDataOnce(uid: string): Promise<Usuario | null> {
    try {
      const userDocRef = doc(this.firestore, `usuarios/${uid}`);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        return userDoc.data() as Usuario;
      }
      
      // ✅ NUEVO: Crear usuario automáticamente si no existe
      console.log('📝 Usuario no encontrado, creando documento automáticamente...');
      return await this.crearUsuarioAutomaticamente(uid);
    } catch (error) {
      console.error('❌ Error obteniendo datos del usuario:', error);
      throw error;
    }
  }

  // ✅ CORREGIDO: Crear usuario automáticamente - SIN NgZone
  private async crearUsuarioAutomaticamente(uid: string): Promise<Usuario | null> {
    try {
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        console.error('❌ No hay usuario autenticado para crear documento');
        return null;
      }

      const userData: Usuario = {
        nombreUsuario: currentUser.displayName || currentUser.email?.split('@')[0] || 'Usuario',
        correo: currentUser.email || '',
        proveedorAuth: currentUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email',
        fotoURL: currentUser.photoURL || '',
        haCompletadoConfiguracionInicial: false,
        creadoEn: Timestamp.now(),
        ultimoAcceso: Timestamp.now(),
        actualizadoEn: Timestamp.now()
      };

      const userDocRef = doc(this.firestore, `usuarios/${uid}`);
      await setDoc(userDocRef, userData);
      console.log('✅ Usuario creado automáticamente en Firestore');
      return userData;
    } catch (error) {
      console.error('❌ Error creando usuario automáticamente:', error);
      return null;
    }
  }

  // ============================================
  // ✅ CORREGIDO: Obtener usuario con observable - SIN onSnapshot problemático
  // ============================================
  getUsuario(uid: string): Observable<Usuario | null> {
    const userDocRef = doc(this.firestore, `usuarios/${uid}`);
    
    return from(getDoc(userDocRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return docSnap.data() as Usuario;
        }
        return null;
      }),
      catchError(error => {
        console.error('❌ Error obteniendo usuario:', error);
        return of(null);
      })
    );
  }

  // ============================================
  // ✅ CORREGIDO: Obtener indicador de hoy usando collectionData - SIN NgZone
  // ============================================
  getIndicadorHoy(uid: string): Observable<Indicador | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Timestamp.fromDate(today);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimestamp = Timestamp.fromDate(tomorrow);

    const indicadoresRef = collection(this.firestore, `usuarios/${uid}/indicadores`);
    
    const q = query(
      indicadoresRef,
      where('fecha', '>=', todayTimestamp),
      where('fecha', '<', tomorrowTimestamp),
      limit(1)
    );

    // ✅ CORREGIDO: collectionData directo sin wrappers innecesarios
    return collectionData(q, { idField: 'id' }).pipe(
      map(docs => {
        if (docs.length > 0) {
          const doc = docs[0] as any;
          const data = doc as Indicador;
          
          if (!data.esConfiguracionInicial) {
            return {
              id: doc.id,
              ...data
            };
          }
        }
        return null;
      }),
      catchError(error => {
        console.error('❌ Error obteniendo indicador hoy:', error);
        return of(null);
      })
    );
  }

  // ============================================
  // ✅ CORREGIDO: Obtener últimos valores físicos - SIN NgZone
  // ============================================
  async obtenerUltimosValoresFisicos(uid: string): Promise<UltimosValoresFisicos> {
    try {
      const indicadoresRef = collection(this.firestore, `usuarios/${uid}/indicadores`);
      
      const q = query(
        indicadoresRef,
        orderBy('creadoEn', 'desc'),
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      
      for (const docSnap of querySnapshot.docs) {
        const indicador = docSnap.data() as Indicador;
        
        if (indicador.peso && indicador.estatura) {
          console.log('✅ Últimos valores físicos encontrados:', {
            peso: indicador.peso,
            estatura: indicador.estatura,
            imc: indicador.imc
          });

          return {
            peso: indicador.peso,
            estatura: indicador.estatura,
            imc: indicador.imc,
            fechaRegistro: indicador.creadoEn?.toDate()
          };
        }
      }

      console.log('ℹ️ No se encontraron valores físicos previos');
      return {};
    } catch (error) {
      console.error('❌ Error obteniendo últimos valores físicos:', error);
      return {};
    }
  }

  // ============================================
  // ✅ CORREGIDO: Guardar/actualizar indicador diario - SIN NgZone
  // ============================================
  guardarIndicadorDiario(
    uid: string,
    emociones: string[],
    estadoAnimo: string,
    vasosAgua: number = 0,
    indicadorId?: string
  ): Observable<boolean> {
    const indicadoresRef = collection(this.firestore, `usuarios/${uid}/indicadores`);
    
    const data: Partial<Indicador> = {
      emociones,
      estadoAnimo: estadoAnimo as any,
      vasosAgua,
      fecha: Timestamp.fromDate(new Date()),
      esConfiguracionInicial: false,
      creadoEn: Timestamp.now()
    };

    // ✅ CORREGIDO: Operaciones Firestore directas
    const operation = indicadorId 
      ? updateDoc(doc(indicadoresRef, indicadorId), data)
      : addDoc(indicadoresRef, data);

    return from(operation).pipe(
      map(() => {
        console.log('✅ Indicador guardado correctamente');
        return true;
      }),
      catchError((error) => {
        console.error('❌ Error guardando indicador:', error);
        return of(false);
      })
    );
  }

  // ============================================
  // ✅ CORREGIDO: Actualizar vasos de agua - SIN NgZone
  // ============================================
  actualizarVasosAgua(
    uid: string,
    vasosAgua: number,
    indicadorId?: string
  ): Observable<boolean> {
    if (!indicadorId) {
      return this.guardarIndicadorDiario(uid, [], 'regular', vasosAgua);
    }

    const indicadorRef = doc(this.firestore, `usuarios/${uid}/indicadores/${indicadorId}`);
    
    return from(updateDoc(indicadorRef, { vasosAgua })).pipe(
      map(() => {
        console.log('✅ Vasos de agua actualizados:', vasosAgua);
        return true;
      }),
      catchError((error) => {
        console.error('❌ Error actualizando vasos de agua:', error);
        return of(false);
      })
    );
  }

  // ============================================
  // ✅ MÉTODOS SINCRÓNICOS (No requieren corrección)
  // ============================================
  calcularEstadoAnimo(emociones: string[]): string {
    if (emociones.length === 0) return 'regular';
    
    const puntajes: { [key: string]: number } = {
      'feliz': 5,
      'tranquilo': 4,
      'motivado': 5,
      'cansado': 2,
      'estresado': 2,
      'ansioso': 1,
      'triste': 1,
      'enojado': 1
    };

    const suma = emociones.reduce((acc, emocion) => acc + (puntajes[emocion] || 3), 0);
    const promedio = suma / emociones.length;

    if (promedio >= 4.5) return 'excelente';
    if (promedio >= 3.5) return 'bueno';
    if (promedio >= 2.5) return 'regular';
    if (promedio >= 1.5) return 'malo';
    return 'muy-malo';
  }

  getFraseMotivacional(): Observable<string> {
    const frasesPorDefecto = [
      'Recuerda que pequeños cambios generan grandes resultados. ¡Tú puedes!',
      'Cada día es una nueva oportunidad para cuidar de ti.',
      'Tu bienestar es tu mayor riqueza.',
      'Celebra cada pequeño logro en tu camino.',
      'Eres más fuerte de lo que crees.'
    ];

    const randomIndex = Math.floor(Math.random() * frasesPorDefecto.length);
    return of(frasesPorDefecto[randomIndex]);
  }

  // ============================================
  // ✅ CORREGIDO: Obtener historial - SIN NgZone
  // ============================================
  getHistorialIndicadores(uid: string, dias: number = 30): Observable<Indicador[]> {
    const indicadoresRef = collection(this.firestore, `usuarios/${uid}/indicadores`);
    
    const q = query(
      indicadoresRef,
      orderBy('creadoEn', 'desc'),
      limit(dias)
    );

    return from(getDocs(q)).pipe(
      map((querySnapshot) => {
        const indicadores = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Indicador))
          .filter(ind => !ind.esConfiguracionInicial);

        console.log(`✅ Historial cargado: ${indicadores.length} indicadores`);
        return indicadores;
      }),
      catchError((error) => {
        console.error('❌ Error obteniendo historial:', error);
        return of([]);
      })
    );
  }

  // ============================================
  // ✅ CORREGIDO: Actualizar último acceso - SIN NgZone
  // ============================================
  actualizarUltimoAcceso(uid: string): Observable<boolean> {
    const userDocRef = doc(this.firestore, `usuarios/${uid}`);
    
    return from(updateDoc(userDocRef, {
      ultimoAcceso: Timestamp.now()
    })).pipe(
      map(() => {
        console.log('✅ Último acceso actualizado');
        return true;
      }),
      catchError((error) => {
        console.error('❌ Error actualizando último acceso:', error);
        return of(false);
      })
    );
  }

  // ============================================
  // ✅ CORREGIDO: Verificar configuración inicial - SIN NgZone
  // ============================================
  async necesitaConfiguracionInicial(uid: string): Promise<boolean> {
    try {
      console.log('🔍 Verificando configuración inicial para:', uid);
      
      const userDocRef = doc(this.firestore, `usuarios/${uid}`);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        console.log('⚠️ Usuario no encontrado en BD');
        return true;
      }

      const usuario = userDoc.data() as Usuario;
      const necesitaConfig = !usuario.haCompletadoConfiguracionInicial;
      
      console.log('📊 Estado configuración:', {
        haCompletadoConfiguracionInicial: usuario.haCompletadoConfiguracionInicial,
        necesitaConfig: necesitaConfig
      });

      return necesitaConfig;
    } catch (error) {
      console.error('❌ Error verificando configuración inicial:', error);
      return false;
    }
  }

  // ============================================
  // ✅ CORREGIDO: Guardar indicador completo - SIN NgZone
  // ============================================
  guardarIndicadorCompleto(
    uid: string,
    indicadorData: Partial<Indicador>
  ): Observable<boolean> {
    const indicadoresRef = collection(this.firestore, `usuarios/${uid}/indicadores`);
    
    const dataCompleta = {
      ...indicadorData,
      esConfiguracionInicial: false,
      creadoEn: Timestamp.now(),
      fecha: Timestamp.fromDate(new Date())
    };

    return from(addDoc(indicadoresRef, dataCompleta)).pipe(
      map(() => {
        console.log('✅ Indicador completo guardado correctamente');
        return true;
      }),
      catchError((error) => {
        console.error('❌ Error guardando indicador completo:', error);
        return of(false);
      })
    );
  }

  // ============================================
  // ✅ CORREGIDO: Marcar configuración inicial completada - SIN NgZone
  // ============================================
  marcarConfiguracionInicialCompleta(uid: string): Observable<boolean> {
    const userDocRef = doc(this.firestore, `usuarios/${uid}`);
    
    console.log('✅ Marcando configuración inicial como completada para:', uid);
    
    return from(updateDoc(userDocRef, {
      haCompletadoConfiguracionInicial: true,
      actualizadoEn: Timestamp.now()
    })).pipe(
      map(() => {
        console.log('✅ Configuración inicial marcada correctamente en Firestore');
        return true;
      }),
      catchError((error) => {
        console.error('❌ Error marcando configuración:', error);
        console.error('Código de error:', error?.code);
        console.error('Mensaje:', error?.message);
        throw error;
      })
    );
  }
}