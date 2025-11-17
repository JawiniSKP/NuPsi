import { Injectable, inject, NgZone } from '@angular/core';
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
import { Observable, from, of, BehaviorSubject } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

export interface Usuario {
  nombreUsuario: string;
  correo: string;
  proveedorAuth: 'email' | 'google';
  fotoURL?: string;
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
  usuarioId?: string;
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
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private ngZone = inject(NgZone);

  private usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  private indicadorHoySubject = new BehaviorSubject<Indicador | null>(null);

  public usuario$ = this.usuarioSubject.asObservable();
  public indicadorHoy$ = this.indicadorHoySubject.asObservable();

  constructor() {
    this.inicializarSuscripciones();
  }

  private inicializarSuscripciones() {
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.cargarUsuario(user.uid);
        this.cargarIndicadorHoy(user.uid);
      } else {
        this.usuarioSubject.next(null);
        this.indicadorHoySubject.next(null);
      }
    });
  }

  // ============================================
  // ✅ MÉTODO CRÍTICO QUE FALTABA - AGREGADO
  // ============================================
  async necesitaConfiguracionInicial(): Promise<boolean> {
    return this.ngZone.run(async () => {
      const user = this.auth.currentUser;
      if (!user) {
        console.error('❌ necesitaConfiguracionInicial: Usuario no autenticado');
        return true;
      }

      try {
        console.log('🔍 Verificando configuración inicial para:', user.uid);
        
        const usuario = await this.getUsuarioDataOnce(user.uid);
        
        if (!usuario) {
          console.log('⚠️ Usuario no encontrado en BD');
          return true;
        }

        const necesitaConfig = !usuario.haCompletadoConfiguracionInicial;
        
        console.log('📊 Estado configuración:', {
          haCompletadoConfiguracionInicial: usuario.haCompletadoConfiguracionInicial,
          necesitaConfig
        });

        return necesitaConfig;
      } catch (error) {
        console.error('❌ Error verificando configuración inicial:', error);
        return true;
      }
    });
  }

  // ============================================
  // ✅ MÉTODOS DE USUARIO
  // ============================================
  async getUsuarioDataOnce(uid: string): Promise<Usuario | null> {
    return this.ngZone.run(async () => {
      try {
        if (!uid) {
          console.error('❌ getUsuarioDataOnce: UID vacío');
          return null;
        }

        const userDocRef = doc(this.firestore, 'usuarios', uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const usuario = userDoc.data() as Usuario;
          this.usuarioSubject.next(usuario);
          console.log('✅ Usuario cargado desde Firestore:', usuario.nombreUsuario);
          return usuario;
        }
        
        console.log('📝 Usuario no encontrado en Firestore, creando...');
        return await this.crearUsuarioAutomaticamente(uid);
        
      } catch (error) {
        console.error('❌ Error crítico en getUsuarioDataOnce:', error);
        return null;
      }
    });
  }

  private async crearUsuarioAutomaticamente(uid: string): Promise<Usuario | null> {
    return this.ngZone.run(async () => {
      try {
        const currentUser = this.auth.currentUser;
        if (!currentUser) {
          console.error('❌ No hay usuario autenticado');
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
          actualizadoEn: Timestamp.now(),
        };

        const userDocRef = doc(this.firestore, 'usuarios', uid);
        await setDoc(userDocRef, userData);
        
        console.log('✅ Usuario creado automáticamente en Firestore');
        this.usuarioSubject.next(userData);
        
        return userData;
      } catch (error) {
        console.error('❌ Error creando usuario:', error);
        return null;
      }
    });
  }

  private async cargarUsuario(uid: string): Promise<void> {
    try {
      const usuario = await this.getUsuarioDataOnce(uid);
      if (usuario) {
        this.usuarioSubject.next(usuario);
      }
    } catch (error) {
      console.error('❌ Error cargando usuario:', error);
    }
  }

  // ============================================
  // ✅ MÉTODOS DE INDICADORES CON FALLBACKS
  // ============================================

  // ✅ MÉTODO FALLBACK para cuando los índices están en construcción
  private async obtenerIndicadorHoyFallback(uid: string): Promise<Indicador | null> {
    try {
      console.log('🔄 Usando fallback para indicador de hoy (índice en construcción)');
      
      const indicadoresRef = collection(this.firestore, 'usuarios', uid, 'indicadores');
      const q = query(
        indicadoresRef,
        orderBy('creadoEn', 'desc'),
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      for (const docSnap of querySnapshot.docs) {
        const indicador = {
          id: docSnap.id,
          ...docSnap.data()
        } as Indicador;

        // Filtrar manualmente por fecha y configuración inicial
        const fechaIndicador = indicador.fecha?.toDate();
        if (fechaIndicador && 
            fechaIndicador >= hoy && 
            !indicador.esConfiguracionInicial) {
          console.log('✅ Indicador de hoy encontrado con fallback');
          return indicador;
        }
      }

      console.log('ℹ️ No hay indicador para hoy (fallback)');
      return null;
    } catch (error) {
      console.error('❌ Error en fallback indicador hoy:', error);
      return null;
    }
  }

  getIndicadorHoy(uid: string): Observable<Indicador | null> {
    return this.ngZone.run(() => {
      if (!uid) {
        console.error('❌ getIndicadorHoy: UID vacío');
        return of(null);
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = Timestamp.fromDate(today);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowTimestamp = Timestamp.fromDate(tomorrow);

      const indicadoresRef = collection(this.firestore, 'usuarios', uid, 'indicadores');
      
      const q = query(
        indicadoresRef,
        where('fecha', '>=', todayTimestamp),
        where('fecha', '<', tomorrowTimestamp),
        where('esConfiguracionInicial', '==', false),
        orderBy('fecha', 'desc'),
        limit(1)
      );

      return from(getDocs(q)).pipe(
        map(querySnapshot => {
          if (querySnapshot.empty) {
            console.log('ℹ️ No hay indicador para hoy');
            this.indicadorHoySubject.next(null);
            return null;
          }

          const docSnap = querySnapshot.docs[0];
          const indicador = {
            id: docSnap.id,
            ...docSnap.data()
          } as Indicador;

          this.indicadorHoySubject.next(indicador);
          console.log('✅ Indicador de hoy cargado:', indicador.id);
          return indicador;
        }),
        catchError(async (error) => {
          console.error('❌ Error con índice, usando fallback:', error);
          
          // Usar fallback si el índice está en construcción
          if (error.code === 'failed-precondition') {
            const indicadorFallback = await this.obtenerIndicadorHoyFallback(uid);
            this.indicadorHoySubject.next(indicadorFallback);
            return indicadorFallback;
          }
          
          this.indicadorHoySubject.next(null);
          return null;
        })
      );
    });
  }

  // ✅ MÉTODO FALLBACK para últimos valores físicos
  private async obtenerUltimosValoresFisicosFallback(): Promise<UltimosValoresFisicos> {
    try {
      const user = this.auth.currentUser;
      if (!user) return {};

      const indicadoresRef = collection(this.firestore, 'usuarios', user.uid, 'indicadores');
      const q = query(
        indicadoresRef,
        orderBy('creadoEn', 'desc'),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      
      for (const docSnap of querySnapshot.docs) {
        const indicador = docSnap.data() as Indicador;
        
        if (indicador.peso && indicador.estatura && !indicador.esConfiguracionInicial) {
          console.log('✅ Últimos valores físicos encontrados con fallback');
          return {
            peso: indicador.peso,
            estatura: indicador.estatura,
            imc: indicador.imc,
            fechaRegistro: indicador.creadoEn?.toDate()
          };
        }
      }

      console.log('ℹ️ No se encontraron valores físicos previos (fallback)');
      return {};
    } catch (error) {
      console.error('❌ Error en fallback últimos valores:', error);
      return {};
    }
  }

  // ✅ ACTUALIZAR obtenerUltimosValoresFisicos
  async obtenerUltimosValoresFisicos(): Promise<UltimosValoresFisicos> {
    return this.ngZone.run(async () => {
      const user = this.auth.currentUser;
      if (!user) {
        console.error('❌ obtenerUltimosValoresFisicos: Usuario no autenticado');
        return {};
      }

      try {
        const indicadoresRef = collection(this.firestore, 'usuarios', user.uid, 'indicadores');
        
        const q = query(
          indicadoresRef,
          where('esConfiguracionInicial', '==', false),
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
      } catch (error: any) {
        console.error('❌ Error obteniendo últimos valores físicos:', error);
        
        // Usar fallback si el índice está en construcción
        if (error.code === 'failed-precondition') {
          return await this.obtenerUltimosValoresFisicosFallback();
        }
        
        return {};
      }
    });
  }

  guardarIndicadorDiarioConUid(
    uid: string,
    emociones: string[],
    estadoAnimo: string,
    vasosAgua: number = 0,
    indicadorId?: string
  ): Observable<boolean> {
    return this.ngZone.run(() => {
      if (!uid) {
        console.error('❌ guardarIndicadorDiarioConUid: UID vacío');
        return of(false);
      }

      const data = {
        estadoAnimo: estadoAnimo as any,
        emociones,
        vasosAgua,
        esConfiguracionInicial: false,
        fecha: Timestamp.fromDate(new Date()),
        creadoEn: Timestamp.now(),
        usuarioId: uid
      };

      if (indicadorId) {
        const indicadorRef = doc(this.firestore, 'usuarios', uid, 'indicadores', indicadorId);
        
        return from(updateDoc(indicadorRef, data)).pipe(
          map(() => {
            const indicadorActualizado = { ...data, id: indicadorId } as Indicador;
            this.indicadorHoySubject.next(indicadorActualizado);
            console.log('✅ Indicador actualizado:', indicadorId);
            return true;
          }),
          catchError(error => {
            console.error('❌ Error actualizando indicador:', error);
            return of(false);
          })
        );
      } else {
        const indicadoresRef = collection(this.firestore, 'usuarios', uid, 'indicadores');
        return from(addDoc(indicadoresRef, data)).pipe(
          map(docRef => {
            const indicadorConId = { ...data, id: docRef.id } as Indicador;
            this.indicadorHoySubject.next(indicadorConId);
            console.log('✅ Indicador creado:', docRef.id);
            return true;
          }),
          catchError(error => {
            console.error('❌ Error creando indicador:', error);
            return of(false);
          })
        );
      }
    });
  }

  actualizarVasosAguaConUid(
    uid: string,
    vasosAgua: number,
    indicadorId?: string
  ): Observable<boolean> {
    return this.ngZone.run(() => {
      if (!uid) {
        console.error('❌ actualizarVasosAguaConUid: UID vacío');
        return of(false);
      }

      if (indicadorId) {
        const indicadorRef = doc(this.firestore, 'usuarios', uid, 'indicadores', indicadorId);
        
        return from(updateDoc(indicadorRef, { 
          vasosAgua,
          usuarioId: uid
        })).pipe(
          map(() => {
            const indicadorActual = this.indicadorHoySubject.value;
            if (indicadorActual) {
              const indicadorActualizado = { ...indicadorActual, vasosAgua };
              this.indicadorHoySubject.next(indicadorActualizado);
            }
            console.log('✅ Vasos de agua actualizados:', vasosAgua);
            return true;
          }),
          catchError(error => {
            console.error('❌ Error actualizando vasos de agua:', error);
            return of(false);
          })
        );
      } else {
        return this.guardarIndicadorDiarioConUid(uid, [], 'regular', vasosAgua);
      }
    });
  }

  // ============================================
  // ✅ MÉTODOS DE CONFIGURACIÓN INICIAL
  // ============================================
  guardarIndicadorCompleto(indicadorData: Partial<Indicador>): Observable<boolean> {
    return this.ngZone.run(() => {
      const user = this.auth.currentUser;
      if (!user) {
        console.error('❌ guardarIndicadorCompleto: Usuario no autenticado');
        return of(false);
      }

      const dataCompleta = {
        estadoAnimo: indicadorData.estadoAnimo || 'regular',
        emociones: indicadorData.emociones || [],
        vasosAgua: indicadorData.vasosAgua || 0,
        peso: indicadorData.peso,
        estatura: indicadorData.estatura,
        imc: indicadorData.imc,
        notas: indicadorData.notas,
        esConfiguracionInicial: indicadorData.esConfiguracionInicial ?? false,
        creadoEn: Timestamp.now(),
        fecha: Timestamp.fromDate(new Date()),
        usuarioId: user.uid
      };

      const indicadoresRef = collection(this.firestore, 'usuarios', user.uid, 'indicadores');

      return from(addDoc(indicadoresRef, dataCompleta)).pipe(
        map(docRef => {
          console.log('✅ Indicador completo guardado:', docRef.id);
          return true;
        }),
        catchError(error => {
          console.error('❌ Error guardando indicador completo:', error);
          return of(false);
        })
      );
    });
  }

  marcarConfiguracionInicialCompleta(): Observable<boolean> {
    return this.ngZone.run(() => {
      const user = this.auth.currentUser;
      if (!user) {
        console.error('❌ marcarConfiguracionInicialCompleta: Usuario no autenticado');
        return of(false);
      }

      const userDocRef = doc(this.firestore, 'usuarios', user.uid);
      
      console.log('✅ Marcando configuración como completada para:', user.uid);
      
      return from(updateDoc(userDocRef, {
        haCompletadoConfiguracionInicial: true,
        actualizadoEn: Timestamp.now()
      })).pipe(
        map(() => {
          console.log('✅ Configuración marcada correctamente en Firestore');
          
          const usuarioActual = this.usuarioSubject.value;
          if (usuarioActual) {
            const usuarioActualizado = { 
              ...usuarioActual, 
              haCompletadoConfiguracionInicial: true 
            };
            this.usuarioSubject.next(usuarioActualizado);
          }
          
          return true;
        }),
        catchError(error => {
          console.error('❌ Error marcando configuración:', error);
          return of(false);
        })
      );
    });
  }

  // ============================================
  // ✅ MÉTODOS AUXILIARES
  // ============================================
  actualizarUltimoAcceso(uid: string): void {
    this.ngZone.run(() => {
      if (!uid) {
        console.error('❌ actualizarUltimoAcceso: UID vacío');
        return;
      }

      const userDocRef = doc(this.firestore, 'usuarios', uid);
      
      from(updateDoc(userDocRef, {
        ultimoAcceso: Timestamp.now()
      })).pipe(
        catchError(error => {
          console.error('❌ Error actualizando último acceso:', error);
          return of(null);
        })
      ).subscribe();
    });
  }

  getHistorialIndicadores(dias: number = 30): Observable<Indicador[]> {
    return this.ngZone.run(() => {
      const user = this.auth.currentUser;
      if (!user) {
        console.error('❌ getHistorialIndicadores: Usuario no autenticado');
        return of([]);
      }

      const indicadoresRef = collection(this.firestore, 'usuarios', user.uid, 'indicadores');
      
      const q = query(
        indicadoresRef,
        where('esConfiguracionInicial', '==', false),
        orderBy('creadoEn', 'desc'),
        limit(dias)
      );

      return from(getDocs(q)).pipe(
        map((querySnapshot) => {
          const indicadores = querySnapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          } as Indicador));

          console.log(`✅ Historial cargado: ${indicadores.length} indicadores`);
          return indicadores;
        }),
        catchError((error) => {
          console.error('❌ Error obteniendo historial:', error);
          return of([]);
        })
      );
    });
  }

  calcularEstadoAnimo(emociones: string[]): string {
    if (emociones.length === 0) return 'regular';
    
    const puntajes: { [key: string]: number } = {
      'feliz': 5, 'tranquilo': 4, 'motivado': 5,
      'cansado': 2, 'estresado': 2, 'ansioso': 1,
      'triste': 1, 'enojado': 1
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
    const frases = [
      'Recuerda que pequeños cambios generan grandes resultados. ¡Tú puedes!',
      'Cada día es una nueva oportunidad para cuidar de ti.',
      'Tu bienestar es tu mayor riqueza.',
      'Celebra cada pequeño logro en tu camino.',
      'Eres más fuerte de lo que crees.'
    ];
    return of(frases[Math.floor(Math.random() * frases.length)]);
  }

  private async cargarIndicadorHoy(uid: string): Promise<void> {
    try {
      this.getIndicadorHoy(uid).subscribe();
    } catch (error) {
      console.error('❌ Error cargando indicador hoy:', error);
    }
  }

  getUsuarioActual(): Usuario | null {
    return this.usuarioSubject.value;
  }

  getIndicadorActual(): Indicador | null {
    return this.indicadorHoySubject.value;
  }
}