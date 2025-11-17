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

// ✅ AGREGAR: Imports de Capacitor para persistencia
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

// ============================================
// INTERFACES (MANTENIDAS PERO MEJORADAS)
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
  configuracionPlanes?: {
    nivelActividad: string;
    objetivoCaloricoPersonalizado: number;
    dificultadEjercicio: string;
    metaEjercicioSemanal: number;
    alimentosFavoritos: string[];
    alimentosEvitar: string[];
    restriccionesAlimentarias: string[];
    tiposEjercicioPreferidos: string[];
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
  // ✅ AGREGADO: Para compatibilidad con reglas de seguridad
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
  // ✅ CORREGIDO: Agregar NgZone para operaciones asíncronas
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private ngZone = inject(NgZone);

  // ✅ NUEVO: Subjects para estado reactivo
  private usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  private indicadorHoySubject = new BehaviorSubject<Indicador | null>(null);

  // ✅ Observables públicos para componentes
  public usuario$ = this.usuarioSubject.asObservable();
  public indicadorHoy$ = this.indicadorHoySubject.asObservable();

  constructor() {
    this.inicializarEstadoUsuario();
  }

  // ✅ NUEVO: Inicializar estado del usuario automáticamente
  private inicializarEstadoUsuario() {
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.cargarUsuario(user.uid);
        this.cargarIndicadorHoy(user.uid);
        this.actualizarUltimoAcceso(user.uid);
      } else {
        this.usuarioSubject.next(null);
        this.indicadorHoySubject.next(null);
      }
    });
  }

  // ============================================
  // ✅ USUARIO - MÉTODOS CORREGIDOS
  // ============================================

  // ✅ CORREGIDO: Obtener usuario una sola vez
  async getUsuarioDataOnce(uid: string): Promise<Usuario | null> {
    return this.ngZone.run(async () => {
      try {
        if (!uid) {
          console.error('❌ getUsuarioDataOnce llamado sin uid');
          return null;
        }

        const userDocRef = doc(this.firestore, 'usuarios', uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const usuario = userDoc.data() as Usuario;
          this.usuarioSubject.next(usuario);
          return usuario;
        }
        
        console.log('📝 Usuario no encontrado, creando documento automáticamente...');
        return await this.crearUsuarioAutomaticamente(uid);
      } catch (error) {
        console.error('❌ Error obteniendo datos del usuario:', error);
        
        // ✅ FALLBACK: Intentar cargar desde cache
        const cache = await this.cargarDesdeCache<Usuario>('usuario_cache');
        if (cache) {
          this.usuarioSubject.next(cache);
          return cache;
        }
        
        return null;
      }
    });
  }

  // ✅ CORREGIDO: Crear usuario automáticamente
  private async crearUsuarioAutomaticamente(uid: string): Promise<Usuario | null> {
    return this.ngZone.run(async () => {
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
          actualizadoEn: Timestamp.now(),
          // ✅ AGREGADO: Configuración de planes por defecto
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
        };

        const userDocRef = doc(this.firestore, 'usuarios', uid);
        await setDoc(userDocRef, userData);
        
        console.log('✅ Usuario creado automáticamente en Firestore');
        this.usuarioSubject.next(userData);
        await this.guardarEnCache('usuario_cache', userData);
        
        return userData;
      } catch (error) {
        console.error('❌ Error creando usuario automáticamente:', error);
        return null;
      }
    });
  }

  // ✅ CORREGIDO: Obtener usuario como observable
  getUsuario(uid: string): Observable<Usuario | null> {
    return this.ngZone.run(() => {
      if (!uid) {
        console.error('❌ getUsuario llamado sin uid');
        return of(null);
      }

      const userDocRef = doc(this.firestore, 'usuarios', uid);
      
      return from(getDoc(userDocRef)).pipe(
        map(docSnap => {
          if (docSnap.exists()) {
            const usuario = docSnap.data() as Usuario;
            this.usuarioSubject.next(usuario);
            this.guardarEnCache('usuario_cache', usuario);
            return usuario;
          }
          return null;
        }),
        catchError(error => {
          console.error('❌ Error obteniendo usuario:', error);
          return this.cargarDesdeCacheObservable<Usuario>('usuario_cache');
        })
      );
    });
  }

  // ✅ NUEVO: Cargar usuario reactivamente
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
  // ✅ INDICADORES - MÉTODOS COMPLETAMENTE CORREGIDOS
  // ============================================

  // ✅ CORREGIDO: Obtener indicador de hoy
  getIndicadorHoy(uid: string): Observable<Indicador | null> {
    return this.ngZone.run(() => {
      if (!uid) {
        console.error('❌ getIndicadorHoy llamado sin uid');
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
        limit(1)
      );

      return from(getDocs(q)).pipe(
        map(querySnapshot => {
          if (querySnapshot.empty) {
            this.indicadorHoySubject.next(null);
            return null;
          }

          const docSnap = querySnapshot.docs[0];
          const indicador = {
            id: docSnap.id,
            ...docSnap.data()
          } as Indicador;

          this.indicadorHoySubject.next(indicador);
          this.guardarEnCache('indicador_hoy_cache', indicador);
          
          console.log('✅ Indicador de hoy obtenido:', indicador.id);
          return indicador;
        }),
        catchError(error => {
          console.error('❌ Error obteniendo indicador hoy:', error);
          return this.cargarDesdeCacheObservable<Indicador>('indicador_hoy_cache');
        })
      );
    });
  }

  // ✅ NUEVO: Cargar indicador de hoy reactivamente
  private async cargarIndicadorHoy(uid: string): Promise<void> {
    try {
      const indicador = await this.getIndicadorHoy(uid).toPromise();
      if (indicador) {
        this.indicadorHoySubject.next(indicador);
      }
    } catch (error) {
      console.error('❌ Error cargando indicador hoy:', error);
    }
  }

  // ✅ CORREGIDO: Guardar/actualizar indicador diario - VERSIÓN MEJORADA
  guardarIndicadorDiario(
    emociones: string[],
    estadoAnimo: string,
    vasosAgua: number = 0,
    notas?: string,
    peso?: number,
    estatura?: number
  ): Observable<boolean> {
    return this.ngZone.run(() => {
      const user = this.auth.currentUser;
      if (!user) {
        console.error('❌ guardarIndicadorDiario: Usuario no autenticado');
        return of(false);
      }

      // ✅ CALCULAR IMC SI HAY PESO Y ESTATURA
      let imc: number | undefined;
      if (peso && estatura && estatura > 0) {
        const estaturaMetros = estatura / 100;
        imc = peso / (estaturaMetros * estaturaMetros);
        imc = Math.round(imc * 10) / 10; // Redondear a 1 decimal
      }

      // ✅ CORREGIDO: Usar objeto plano en lugar de interfaz para Firestore
      const data = {
        estadoAnimo: estadoAnimo as any,
        emociones,
        vasosAgua,
        peso,
        estatura,
        imc,
        notas,
        esConfiguracionInicial: false,
        fecha: Timestamp.fromDate(new Date()),
        creadoEn: Timestamp.now(),
        // ✅ CRÍTICO: Agregar usuarioId para compatibilidad con reglas
        usuarioId: user.uid
      };

      const indicadoresRef = collection(this.firestore, 'usuarios', user.uid, 'indicadores');
      
      return from(addDoc(indicadoresRef, data)).pipe(
        map(docRef => {
          const indicadorConId = { ...data, id: docRef.id } as Indicador;
          this.indicadorHoySubject.next(indicadorConId);
          this.guardarEnCache('indicador_hoy_cache', indicadorConId);
          
          console.log('✅ Indicador guardado correctamente con ID:', docRef.id);
          return true;
        }),
        catchError(error => {
          console.error('❌ Error guardando indicador:', error);
          
          // ✅ GUARDAR LOCALMENTE SI HAY ERROR DE CONEXIÓN
          if (this.esErrorDeConexion(error)) {
            this.guardarDatosPendientes('indicador', data);
            return of(true);
          }
          
          return of(false);
        })
      );
    });
  }

  // ✅ CORREGIDO: Actualizar vasos de agua - VERSIÓN MEJORADA
  actualizarVasosAgua(vasosAgua: number): Observable<boolean> {
    return this.ngZone.run(() => {
      const user = this.auth.currentUser;
      if (!user) {
        console.error('❌ actualizarVasosAgua: Usuario no autenticado');
        return of(false);
      }

      const indicadorActual = this.indicadorHoySubject.value;
      
      if (indicadorActual && indicadorActual.id) {
        // ✅ ACTUALIZAR INDICADOR EXISTENTE
        const indicadorRef = doc(this.firestore, 'usuarios', user.uid, 'indicadores', indicadorActual.id);
        
        return from(updateDoc(indicadorRef, { 
          vasosAgua,
          usuarioId: user.uid // ✅ MANTENER COMPATIBILIDAD
        })).pipe(
          map(() => {
            const indicadorActualizado = { ...indicadorActual, vasosAgua };
            this.indicadorHoySubject.next(indicadorActualizado);
            this.guardarEnCache('indicador_hoy_cache', indicadorActualizado);
            
            console.log('✅ Vasos de agua actualizados:', vasosAgua);
            return true;
          }),
          catchError(error => {
            console.error('❌ Error actualizando vasos de agua:', error);
            return of(false);
          })
        );
      } else {
        // ✅ CREAR NUEVO INDICADOR SI NO EXISTE
        return this.guardarIndicadorDiario([], 'regular', vasosAgua);
      }
    });
  }

  // ============================================
  // ✅ MÉTODOS QUE HOME.PAGE.TS NECESITA - NUEVOS
  // ============================================

  /**
   * ✅ NUEVO: Método que home.page.ts espera (con uid como primer parámetro)
   */
  guardarIndicadorDiarioConUid(
    uid: string,
    emociones: string[],
    estadoAnimo: string,
    vasosAgua: number = 0,
    indicadorId?: string
  ): Observable<boolean> {
    return this.ngZone.run(() => {
      const user = this.auth.currentUser;
      if (!user) {
        console.error('❌ guardarIndicadorDiarioConUid: Usuario no autenticado');
        return of(false);
      }

      // ✅ CORREGIDO: Usar objeto plano en lugar de interfaz
      const data = {
        estadoAnimo: estadoAnimo as any,
        emociones,
        vasosAgua,
        esConfiguracionInicial: false,
        fecha: Timestamp.fromDate(new Date()),
        creadoEn: Timestamp.now(),
        usuarioId: user.uid
      };

      // Si hay indicadorId, actualizar; si no, crear nuevo
      if (indicadorId) {
        const indicadorRef = doc(this.firestore, 'usuarios', user.uid, 'indicadores', indicadorId);
        
        // ✅ CORREGIDO: Pasar objeto plano a updateDoc
        return from(updateDoc(indicadorRef, data)).pipe(
          map(() => {
            const indicadorActualizado = { ...data, id: indicadorId } as Indicador;
            this.indicadorHoySubject.next(indicadorActualizado);
            this.guardarEnCache('indicador_hoy_cache', indicadorActualizado);
            console.log('✅ Indicador actualizado:', indicadorId);
            return true;
          }),
          catchError(error => {
            console.error('❌ Error actualizando indicador:', error);
            return of(false);
          })
        );
      } else {
        const indicadoresRef = collection(this.firestore, 'usuarios', user.uid, 'indicadores');
        return from(addDoc(indicadoresRef, data)).pipe(
          map(docRef => {
            const indicadorConId = { ...data, id: docRef.id } as Indicador;
            this.indicadorHoySubject.next(indicadorConId);
            this.guardarEnCache('indicador_hoy_cache', indicadorConId);
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

  /**
   * ✅ NUEVO: Método que home.page.ts espera (con uid y indicadorId)
   */
  actualizarVasosAguaConUid(
    uid: string,
    vasosAgua: number,
    indicadorId?: string
  ): Observable<boolean> {
    return this.ngZone.run(() => {
      const user = this.auth.currentUser;
      if (!user) {
        console.error('❌ actualizarVasosAguaConUid: Usuario no autenticado');
        return of(false);
      }

      // Si hay indicadorId, actualizar el existente
      if (indicadorId) {
        const indicadorRef = doc(this.firestore, 'usuarios', user.uid, 'indicadores', indicadorId);
        
        // ✅ CORREGIDO: Pasar objeto plano
        return from(updateDoc(indicadorRef, { 
          vasosAgua,
          usuarioId: user.uid
        })).pipe(
          map(() => {
            const indicadorActual = this.indicadorHoySubject.value;
            if (indicadorActual) {
              const indicadorActualizado = { ...indicadorActual, vasosAgua };
              this.indicadorHoySubject.next(indicadorActualizado);
              this.guardarEnCache('indicador_hoy_cache', indicadorActualizado);
            }
            console.log('✅ Vasos de agua actualizados en indicador existente:', vasosAgua);
            return true;
          }),
          catchError(error => {
            console.error('❌ Error actualizando vasos de agua:', error);
            return of(false);
          })
        );
      } else {
        // Si no hay indicadorId, usar el método existente que crea uno nuevo
        return this.actualizarVasosAgua(vasosAgua);
      }
    });
  }

  // ============================================
  // ✅ CONFIGURACIÓN INICIAL - CORREGIDOS
  // ============================================

  // ✅ CORREGIDO: Guardar indicador completo (config inicial / diario)
  guardarIndicadorCompleto(indicadorData: Partial<Indicador>): Observable<boolean> {
    return this.ngZone.run(() => {
      const user = this.auth.currentUser;
      if (!user) {
        console.error('❌ guardarIndicadorCompleto: Usuario no autenticado');
        return of(false);
      }

      // ✅ CORREGIDO: Usar objeto plano
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
        usuarioId: user.uid // ✅ COMPATIBLE CON REGLAS
      };

      const indicadoresRef = collection(this.firestore, 'usuarios', user.uid, 'indicadores');

      return from(addDoc(indicadoresRef, dataCompleta)).pipe(
        map(docRef => {
          console.log('✅ Indicador completo guardado correctamente con ID:', docRef.id);
          return true;
        }),
        catchError(error => {
          console.error('❌ Error guardando indicador completo:', error);
          return of(false);
        })
      );
    });
  }

  // ✅ CORREGIDO: Marcar configuración inicial completada
  marcarConfiguracionInicialCompleta(): Observable<boolean> {
    return this.ngZone.run(() => {
      const user = this.auth.currentUser;
      if (!user) {
        console.error('❌ marcarConfiguracionInicialCompleta: Usuario no autenticado');
        return of(false);
      }

      const userDocRef = doc(this.firestore, 'usuarios', user.uid);
      
      console.log('✅ Marcando configuración inicial como completada para:', user.uid);
      
      return from(updateDoc(userDocRef, {
        haCompletadoConfiguracionInicial: true,
        actualizadoEn: Timestamp.now()
      })).pipe(
        map(() => {
          console.log('✅ Configuración inicial marcada correctamente en Firestore');
          
          // ✅ ACTUALIZAR ESTADO REACTIVO
          const usuarioActual = this.usuarioSubject.value;
          if (usuarioActual) {
            const usuarioActualizado = { ...usuarioActual, haCompletadoConfiguracionInicial: true };
            this.usuarioSubject.next(usuarioActualizado);
            this.guardarEnCache('usuario_cache', usuarioActualizado);
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

  // ✅ CORREGIDO: Verificar configuración inicial
  async necesitaConfiguracionInicial(): Promise<boolean> {
    return this.ngZone.run(async () => {
      const user = this.auth.currentUser;
      if (!user) {
        console.error('❌ necesitaConfiguracionInicial: Usuario no autenticado');
        return true;
      }

      try {
        console.log('🔍 Verificando configuración inicial para:', user.uid);
        
        const userDocRef = doc(this.firestore, 'usuarios', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          console.log('⚠️ Usuario no encontrado en BD');
          return true;
        }

        const usuario = userDoc.data() as Usuario;
        const necesitaConfig = !usuario.haCompletadoConfiguracionInicial;
        
        console.log('📊 Estado configuración:', {
          haCompletadoConfiguracionInicial: usuario.haCompletadoConfiguracionInicial,
          necesitaConfig
        });

        return necesitaConfig;
      } catch (error) {
        console.error('❌ Error verificando configuración inicial:', error);
        return false;
      }
    });
  }

  // ============================================
  // ✅ HISTORIAL Y ESTADÍSTICAS - CORREGIDOS
  // ============================================

  // ✅ CORREGIDO: Obtener últimos valores físicos
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

            const valores = {
              peso: indicador.peso,
              estatura: indicador.estatura,
              imc: indicador.imc,
              fechaRegistro: indicador.creadoEn?.toDate()
            };

            await this.guardarEnCache('ultimos_valores_cache', valores);
            return valores;
          }
        }

        console.log('ℹ️ No se encontraron valores físicos previos');
        
        // ✅ FALLBACK: Cargar desde cache
        const cache = await this.cargarDesdeCache<UltimosValoresFisicos>('ultimos_valores_cache');
        return cache || {};
      } catch (error) {
        console.error('❌ Error obteniendo últimos valores físicos:', error);
        
        // ✅ FALLBACK: Cargar desde cache
        const cache = await this.cargarDesdeCache<UltimosValoresFisicos>('ultimos_valores_cache');
        return cache || {};
      }
    });
  }

  // ✅ CORREGIDO: Historial de indicadores
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
        orderBy('creadoEn', 'desc'),
        limit(dias)
      );

      return from(getDocs(q)).pipe(
        map((querySnapshot) => {
          const indicadores = querySnapshot.docs
            .map(docSnap => ({
              id: docSnap.id,
              ...docSnap.data()
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
    });
  }

  // ============================================
  // ✅ MÉTODOS AUXILIARES - CORREGIDOS
  // ============================================

  // ✅ CORREGIDO: Actualizar último acceso
  actualizarUltimoAcceso(uid: string): void {
    this.ngZone.run(() => {
      if (!uid) {
        console.error('❌ actualizarUltimoAcceso llamado sin uid');
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
  // 💾 MÉTODOS DE CACHE OFFLINE - NUEVOS
  // ============================================

  private async guardarEnCache(key: string, data: any): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await Preferences.set({
          key: key,
          value: JSON.stringify(data)
        });
      } catch (error) {
        console.warn('⚠️ Error guardando en cache:', error);
      }
    }
  }

  private async cargarDesdeCache<T>(key: string): Promise<T | null> {
    if (Capacitor.isNativePlatform()) {
      try {
        const { value } = await Preferences.get({ key: key });
        return value ? JSON.parse(value) : null;
      } catch (error) {
        console.warn('⚠️ Error cargando desde cache:', error);
      }
    }
    return null;
  }

  private cargarDesdeCacheObservable<T>(key: string): Observable<T | null> {
    return from(this.cargarDesdeCache<T>(key));
  }

  private async guardarDatosPendientes(tipo: string, datos: any): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        const pendientes = await this.cargarDesdeCache<any[]>('datos_pendientes') || [];
        pendientes.push({
          tipo,
          datos,
          timestamp: new Date().toISOString()
        });
        
        await this.guardarEnCache('datos_pendientes', pendientes);
        console.log('💾 Datos guardados localmente para sincronizar después');
      } catch (error) {
        console.error('❌ Error guardando datos pendientes:', error);
      }
    }
  }

  private esErrorDeConexion(error: any): boolean {
    return error?.code === 'unavailable' || 
           error?.message?.includes('offline') ||
           error?.message?.includes('network') ||
           error?.code === 'auth/network-request-failed';
  }

  // ============================================
  // 🔧 MÉTODOS PÚBLICOS ADICIONALES
  // ============================================

  // ✅ Obtener usuario actual desde el subject
  getUsuarioActual(): Usuario | null {
    return this.usuarioSubject.value;
  }

  // ✅ Obtener indicador actual desde el subject
  getIndicadorActual(): Indicador | null {
    return this.indicadorHoySubject.value;
  }

  // ✅ Limpiar cache (útil para testing)
  async limpiarCache(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await Preferences.remove({ key: 'usuario_cache' });
        await Preferences.remove({ key: 'indicador_hoy_cache' });
        await Preferences.remove({ key: 'ultimos_valores_cache' });
        await Preferences.remove({ key: 'datos_pendientes' });
        console.log('✅ Cache limpiado correctamente');
      } catch (error) {
        console.error('❌ Error limpiando cache:', error);
      }
    }
  }
}