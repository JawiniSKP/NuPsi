import { Injectable, inject, NgZone } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  getDoc, 
  updateDoc, 
  collectionData, 
  query, 
  where,
  setDoc,
  addDoc,
  deleteDoc,
  orderBy,
  getDocs,
  Timestamp
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, from, map, of, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';

// ✅ AGREGAR: Imports de Capacitor para persistencia
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

// ==========================================
// 📋 INTERFACES ACTUALIZADAS
// ==========================================

export interface Dieta {
  id: string;
  nombre: string;
  descripcion: string;
  icon: string;
  color: string;
  tipo: 'perdida_peso' | 'mantenimiento' | 'ganancia_muscular' | 'especial';
  beneficios: string[];
  recomendaciones: string[];
  caloriasRecomendadas: {
    min: number;
    max: number;
  };
  alimentosPermitidos?: string[];
  alimentosEvitar?: string[];
  consideraciones?: string[];
  macronutrientes?: {
    proteinas: string;
    carbohidratos: string;
    grasas: string;
  };
  duracionRecomendada?: string;
  dificultad?: string;
  esActiva?: boolean;
}

export interface Receta {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  tipoDieta: string[];
  tiempoPreparacion: number;
  tiempoCoccion: number;
  tiempoTotal: number;
  calorias: number;
  ingredientes: any[];
  instrucciones: string[];
  nutricion?: {
    proteinas: number;
    carbohidratos: number;
    grasas: number;
    fibra: number;
  };
  porciones: number;
  dificultad: string;
  etiquetas: string[];
  esVerificada: boolean;
  megusta?: number;
  guardados?: number;
}

export interface PlanUsuario {
  id?: string;
  dietaSeleccionada: string;
  objetivoCaloricoPersonalizado: number;
  duracionPlan: string;
  fechaInicio: Date;
  activo: boolean;
  progreso: ProgresoDieta;
  // ✅ AGREGADO: Para compatibilidad con reglas
  usuarioId?: string;
}

export interface EjercicioUsuario {
  id?: string;
  nombre: string;
  descripcion: string;
  duracion: number;
  categoria: string;
  temporizador: {
    trabajo: number;
    descanso: number;
    series: number;
  };
  completado: boolean;
  fechaCreacion: Date;
  ultimaModificacion?: Date;
  vecesCompletado?: number;
  historial?: HistorialEjercicio[];
  // ✅ AGREGADO: Para compatibilidad con reglas
  usuarioId?: string;
}

export interface HistorialEjercicio {
  fecha: Date;
  duracionReal: number;
  completado: boolean;
  notas?: string;
}

export interface PlantillaEjercicio {
  id: string;
  nombre: string;
  descripcion: string;
  duracion: number;
  dificultad: string;
  tipo: string;
  caloriasEstimadas: number;
  ejercicios: Array<{
    nombre: string;
    duracion: number;
    descanso: number;
  }>;
}

export interface ProgresoDieta {
  diasCompletados: number;
  ultimoAcceso: Date;
  fechaInicio?: Date;
  fechaFin?: Date;
  diasRestantes?: number;
  porcentajeCompletado?: number;
  racha?: number;
  diasSeguidos?: number;
  historialDiario?: HistorialDiario[];
  alertasTiempo?: AlertaTiempo[];
  estaVencida?: boolean;
  excedeTiempoRecomendado?: boolean;
}

export interface HistorialDiario {
  fecha: Date;
  completado: boolean;
  calorias?: number;
  notas?: string;
}

export interface AlertaTiempo {
  tipo: 'info' | 'warning' | 'danger';
  mensaje: string;
  fechaGenerada: Date;
  leida: boolean;
}

export interface HistorialDieta {
  id?: string;
  dietaId: string;
  nombreDieta: string;
  fechaInicio: Date;
  fechaFin: Date;
  duracionDias: number;
  completada: boolean;
  diasSeguidos: number;
  porcentajeCompletado: number;
  razonTermino?: 'completada' | 'cambiada' | 'abandonada';
  usuarioId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlanesService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private ngZone = inject(NgZone);

  // ✅ NUEVO: Subjects para estado reactivo
  private planUsuarioSubject = new BehaviorSubject<PlanUsuario | null>(null);
  private ejerciciosUsuarioSubject = new BehaviorSubject<EjercicioUsuario[]>([]);

  // ✅ Observables públicos
  public planUsuario$ = this.planUsuarioSubject.asObservable();
  public ejerciciosUsuario$ = this.ejerciciosUsuarioSubject.asObservable();

  constructor() {
    this.inicializarEstadoUsuario();
  }

  // ✅ NUEVO: Inicializar estado del usuario automáticamente
  private inicializarEstadoUsuario() {
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.cargarPlanUsuario();
        this.cargarEjerciciosUsuario();
      } else {
        this.planUsuarioSubject.next(null);
        this.ejerciciosUsuarioSubject.next([]);
      }
    });
  }

  // ==========================================
  // 🍽️ MÉTODOS DE DIETAS - MEJORADOS Y CORREGIDOS
  // ==========================================

  obtenerDietas(): Observable<Dieta[]> {
    return this.ngZone.run(() => {
      try {
        const dietasRef = collection(this.firestore, 'dietas');
        const q = query(dietasRef, where('esActiva', '==', true));
        
        return (collectionData(q, { idField: 'id' }) as Observable<any[]>).pipe(
          map((dietas: any[]) => {
            console.log('📊 Dietas obtenidas:', dietas.length);
            const dietasMapeadas = dietas.map(dieta => this.mapearDietaFirestore(dieta));
            
            // ✅ GUARDAR EN CACHE PARA OFFLINE
            this.guardarEnCache('dietas', dietasMapeadas);
            
            return dietasMapeadas;
          }),
          catchError(error => {
            console.error('❌ Error obteniendo dietas:', error);
            // ✅ CORREGIDO: FALLBACK con tipo explícito
            return this.cargarDesdeCache('dietas').pipe(
              map(cache => cache as Dieta[])
            );
          })
        );
      } catch (error) {
        console.error('❌ Error crítico obteniendo dietas:', error);
        // ✅ CORREGIDO: FALLBACK con tipo explícito
        return this.cargarDesdeCache('dietas').pipe(
          map(cache => cache as Dieta[])
        );
      }
    });
  }

  obtenerDietaPorId(id: string): Observable<Dieta | null> {
    return this.ngZone.run(() => {
      try {
        const dietaDoc = doc(this.firestore, `dietas/${id}`);
        return from(getDoc(dietaDoc)).pipe(
          map(docSnap => {
            if (docSnap.exists()) {
              return this.mapearDietaFirestore({ id: docSnap.id, ...docSnap.data() });
            }
            return null;
          }),
          catchError(error => {
            console.error('❌ Error obteniendo dieta por ID:', error);
            return of(null);
          })
        );
      } catch (error) {
        console.error('❌ Error crítico obteniendo dieta:', error);
        return of(null);
      }
    });
  }

  // ==========================================
  // 🍳 MÉTODOS DE RECETAS - MEJORADOS Y CORREGIDOS
  // ==========================================

  obtenerRecetas(): Observable<Receta[]> {
    return this.ngZone.run(() => {
      try {
        const recetasRef = collection(this.firestore, 'recetas');
        const q = query(
          recetasRef, 
          where('esVerificada', '==', true)
        );
        
        return from(getDocs(q)).pipe(
          map(querySnapshot => {
            const recetas = querySnapshot.docs.map(doc => ({ 
              id: doc.id, 
              ...doc.data()
            }));
            console.log('📊 Recetas obtenidas:', recetas.length);
            
            const recetasMapeadas = recetas.map(receta => this.mapearRecetaFirestore(receta));
            
            // ✅ GUARDAR EN CACHE
            this.guardarEnCache('recetas', recetasMapeadas);
            
            return recetasMapeadas;
          }),
          catchError(error => {
            console.error('❌ Error obteniendo recetas:', error);
            // ✅ CORREGIDO: FALLBACK con tipo explícito
            return this.cargarDesdeCache('recetas').pipe(
              map(cache => cache as Receta[])
            );
          })
        );
      } catch (error) {
        console.error('❌ Error crítico obteniendo recetas:', error);
        // ✅ CORREGIDO: FALLBACK con tipo explícito
        return this.cargarDesdeCache('recetas').pipe(
          map(cache => cache as Receta[])
        );
      }
    });
  }

  obtenerRecetasPorTipoDieta(tipoDieta: string): Observable<Receta[]> {
    return this.ngZone.run(() => {
      try {
        const recetasRef = collection(this.firestore, 'recetas');
        const q = query(
          recetasRef,
          where('tipoDieta', 'array-contains', tipoDieta),
          where('esVerificada', '==', true)
        );
        
        return from(getDocs(q)).pipe(
          map(querySnapshot => {
            const recetas = querySnapshot.docs.map(doc => ({ 
              id: doc.id, 
              ...doc.data()
            }));
            console.log(`📊 Recetas para dieta ${tipoDieta}:`, recetas.length);
            return recetas.map(receta => this.mapearRecetaFirestore(receta));
          }),
          catchError(error => {
            console.error(`❌ Error obteniendo recetas para dieta ${tipoDieta}:`, error);
            return of([]);
          })
        );
      } catch (error) {
        console.error('❌ Error crítico obteniendo recetas por dieta:', error);
        return of([]);
      }
    });
  }

  async obtenerRecetaPorId(recetaId: string): Promise<Receta | null> {
    return this.ngZone.run(async () => {
      try {
        const recetaDocRef = doc(this.firestore, 'recetas', recetaId);
        const recetaDoc = await getDoc(recetaDocRef);
        
        if (recetaDoc.exists()) {
          const recetaData = { 
            id: recetaDoc.id, 
            ...recetaDoc.data()
          };
          console.log('✅ Receta obtenida por ID:', recetaData.id);
          return this.mapearRecetaFirestore(recetaData);
        }
        
        console.warn('⚠️ Receta no encontrada con ID:', recetaId);
        return null;
      } catch (error) {
        console.error('❌ Error obteniendo receta por ID:', error);
        throw error;
      }
    });
  }

  // ==========================================
  // 💪 MÉTODOS DE EJERCICIOS - COMPLETAMENTE CORREGIDOS
  // ==========================================

  obtenerPlantillasEjercicio(): Observable<PlantillaEjercicio[]> {
    return this.ngZone.run(() => {
      try {
        const plantillasRef = collection(this.firestore, 'plantillas');
        
        return from(getDocs(plantillasRef)).pipe(
          map(querySnapshot => {
            const plantillas = querySnapshot.docs.map(doc => ({ 
              id: doc.id, 
              ...doc.data() 
            }));
            console.log('📊 Plantillas obtenidas:', plantillas.length);
            
            const plantillasMapeadas = plantillas.map(plantilla => 
              this.mapearPlantillaEjercicioFirestore(plantilla)
            );
            
            // ✅ GUARDAR EN CACHE
            this.guardarEnCache('plantillas', plantillasMapeadas);
            
            return plantillasMapeadas;
          }),
          catchError(error => {
            console.error('❌ Error obteniendo plantillas:', error);
            // ✅ CORREGIDO: FALLBACK con tipo explícito
            return this.cargarDesdeCache('plantillas').pipe(
              map(cache => cache as PlantillaEjercicio[])
            );
          })
        );
      } catch (error) {
        console.error('❌ Error crítico obteniendo plantillas:', error);
        // ✅ CORREGIDO: FALLBACK con tipo explícito
        return this.cargarDesdeCache('plantillas').pipe(
          map(cache => cache as PlantillaEjercicio[])
        );
      }
    });
  }

  // ✅ CORREGIDO: Crear ejercicio en la subcolección correcta
  async crearEjercicio(ejercicio: Partial<EjercicioUsuario>): Promise<string> {
    return this.ngZone.run(async () => {
      const user = this.auth.currentUser;
      if (!user) throw new Error('❌ Usuario no autenticado');

      try {
        const ejercicioCompleto: EjercicioUsuario = {
          nombre: ejercicio.nombre!,
          descripcion: ejercicio.descripcion || '',
          duracion: ejercicio.temporizador ? this.calcularDuracionTotal(ejercicio.temporizador) : 0,
          categoria: ejercicio.categoria || 'personalizado',
          temporizador: ejercicio.temporizador || { trabajo: 30, descanso: 10, series: 3 },
          completado: false,
          fechaCreacion: new Date(),
          ultimaModificacion: new Date(),
          vecesCompletado: 0,
          historial: [],
          // ✅ CRÍTICO: Agregar usuarioId para las reglas de seguridad
          usuarioId: user.uid
        };

        // ✅ CORREGIDO: Guardar en la subcolección correcta según tus reglas
        const ejerciciosRef = collection(this.firestore, `usuarios/${user.uid}/ejercicios`);
        const docRef = await addDoc(ejerciciosRef, ejercicioCompleto);
        
        console.log('✅ Ejercicio creado correctamente en usuarios/', user.uid, '/ejercicios/', docRef.id);
        
        // ✅ ACTUALIZAR ESTADO REACTIVO
        this.cargarEjerciciosUsuario();
        
        return docRef.id;
      } catch (error) {
        console.error('❌ Error creando ejercicio:', error);
        
        // ✅ INTENTAR GUARDAR LOCALMENTE SI HAY ERROR DE CONEXIÓN
        if (this.esErrorDeConexion(error)) {
          await this.guardarEjercicioLocal(ejercicio);
          return 'local_saved';
        }
        
        throw error;
      }
    });
  }

  // ✅ CORREGIDO: Obtener ejercicios del usuario
  obtenerEjerciciosUsuario(): Observable<EjercicioUsuario[]> {
    return this.ngZone.run(() => {
      const user = this.auth.currentUser;
      if (!user) {
        console.warn('⚠️ Usuario no autenticado');
        return of([]);
      }

      try {
        const ejerciciosRef = collection(this.firestore, `usuarios/${user.uid}/ejercicios`);
        return (collectionData(ejerciciosRef, { idField: 'id' }) as Observable<any[]>).pipe(
          map((ejercicios: any[]) => {
            console.log('💪 Ejercicios del usuario obtenidos:', ejercicios.length);
            const ejerciciosMapeados = ejercicios.map(ej => this.mapearEjercicioFirestore(ej));
            
            // ✅ ACTUALIZAR ESTADO REACTIVO
            this.ejerciciosUsuarioSubject.next(ejerciciosMapeados);
            
            return ejerciciosMapeados;
          }),
          catchError(error => {
            console.error('❌ Error obteniendo ejercicios:', error);
            return of([]);
          })
        );
      } catch (error) {
        console.error('❌ Error crítico obteniendo ejercicios:', error);
        return of([]);
      }
    });
  }

  // ✅ NUEVO: Cargar ejercicios reactivamente
  private async cargarEjerciciosUsuario(): Promise<void> {
    try {
      const ejercicios = await this.obtenerEjerciciosUsuario().toPromise();
      if (ejercicios) {
        this.ejerciciosUsuarioSubject.next(ejercicios);
      }
    } catch (error) {
      console.error('❌ Error cargando ejercicios:', error);
    }
  }

  // ✅ CORREGIDO: Actualizar ejercicio
  async actualizarEjercicio(ejercicioId: string, ejercicio: Partial<EjercicioUsuario>): Promise<void> {
    return this.ngZone.run(async () => {
      const user = this.auth.currentUser;
      if (!user) throw new Error('❌ Usuario no autenticado');

      try {
        const ejercicioDoc = doc(this.firestore, `usuarios/${user.uid}/ejercicios/${ejercicioId}`);
        const datosActualizados: any = { 
          ...ejercicio, 
          ultimaModificacion: new Date(),
          // ✅ MANTENER usuarioId
          usuarioId: user.uid
        };

        if (ejercicio.temporizador) {
          datosActualizados.duracion = this.calcularDuracionTotal(ejercicio.temporizador);
        }

        await updateDoc(ejercicioDoc, datosActualizados);
        console.log('✅ Ejercicio actualizado correctamente');
        
        // ✅ ACTUALIZAR ESTADO REACTIVO
        this.cargarEjerciciosUsuario();
      } catch (error) {
        console.error('❌ Error actualizando ejercicio:', error);
        throw error;
      }
    });
  }

  // ✅ CORREGIDO: Eliminar ejercicio
  async eliminarEjercicio(ejercicioId: string): Promise<void> {
    return this.ngZone.run(async () => {
      const user = this.auth.currentUser;
      if (!user) throw new Error('❌ Usuario no autenticado');

      try {
        const ejercicioDoc = doc(this.firestore, `usuarios/${user.uid}/ejercicios/${ejercicioId}`);
        await deleteDoc(ejercicioDoc);
        console.log('✅ Ejercicio eliminado correctamente');
        
        // ✅ ACTUALIZAR ESTADO REACTIVO
        this.cargarEjerciciosUsuario();
      } catch (error) {
        console.error('❌ Error eliminando ejercicio:', error);
        throw error;
      }
    });
  }

  // ✅ CORREGIDO: Completar ejercicio con historial
  async completarEjercicio(ejercicioId: string, duracionReal: number, notas?: string): Promise<void> {
    return this.ngZone.run(async () => {
      const user = this.auth.currentUser;
      if (!user) throw new Error('❌ Usuario no autenticado');

      try {
        const ejercicioDoc = doc(this.firestore, `usuarios/${user.uid}/ejercicios/${ejercicioId}`);
        const ejercicioSnap = await getDoc(ejercicioDoc);
        
        if (ejercicioSnap.exists()) {
          const ejercicioData = ejercicioSnap.data() as EjercicioUsuario;
          const vecesCompletado = (ejercicioData.vecesCompletado || 0) + 1;
          const historial = ejercicioData.historial || [];
          
          // Agregar nueva entrada al historial
          historial.push({
            fecha: new Date(),
            duracionReal: duracionReal,
            completado: true,
            notas: notas
          });

          await updateDoc(ejercicioDoc, {
            completado: true,
            vecesCompletado: vecesCompletado,
            historial: historial,
            ultimaModificacion: new Date(),
            usuarioId: user.uid // ✅ MANTENER
          });
          
          console.log('✅ Ejercicio completado y registrado en historial');
          
          // ✅ ACTUALIZAR ESTADO REACTIVO
          this.cargarEjerciciosUsuario();
        }
      } catch (error) {
        console.error('❌ Error completando ejercicio:', error);
        throw error;
      }
    });
  }

  // ==========================================
  // 📊 MÉTODOS DE PLAN DE USUARIO - COMPLETAMENTE CORREGIDOS
  // ==========================================

  // ✅ NUEVO: Cargar plan del usuario reactivamente
  private async cargarPlanUsuario(): Promise<void> {
    try {
      const plan = await this.obtenerPlanUsuario();
      if (plan) {
        this.planUsuarioSubject.next(plan);
      } else {
        this.planUsuarioSubject.next(null);
      }
    } catch (error) {
      console.error('❌ Error cargando plan usuario:', error);
      this.planUsuarioSubject.next(null);
    }
  }

  // ✅ CORREGIDO: Obtener plan del usuario
  async obtenerPlanUsuario(): Promise<PlanUsuario | null> {
    return this.ngZone.run(async () => {
      const user = this.auth.currentUser;
      if (!user) {
        console.warn('❌ Usuario no autenticado');
        return null;
      }

      try {
        const userDoc = doc(this.firestore, `usuarios/${user.uid}`);
        const docSnap = await getDoc(userDoc);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          const plan = data['configuracionPlanes'];
          
          if (plan) {
            const planCorregido = this.corregirFechasPlan(plan);
            console.log('📊 Plan de usuario obtenido:', planCorregido);
            return planCorregido;
          }
        }
        
        console.log('📊 No se encontró plan de usuario');
        return null;
      } catch (error) {
        console.error('❌ Error obteniendo plan usuario:', error);
        return null;
      }
    });
  }

  // ✅ CORREGIDO: Guardar selección de dieta COMPLETAMENTE
  async guardarSeleccionDieta(dietaId: string, objetivoCalorico: number, duracion: string): Promise<void> {
    return this.ngZone.run(async () => {
      const user = this.auth.currentUser;
      if (!user) throw new Error('❌ Usuario no autenticado');

      try {
        const fechaInicio = new Date();
        const duracionDias = parseInt(duracion) || 30;
        const fechaFin = new Date(fechaInicio);
        fechaFin.setDate(fechaFin.getDate() + duracionDias);

        const plan: PlanUsuario = {
          dietaSeleccionada: dietaId,
          objetivoCaloricoPersonalizado: objetivoCalorico,
          duracionPlan: duracion,
          fechaInicio: fechaInicio,
          activo: true,
          progreso: {
            diasCompletados: 0,
            ultimoAcceso: new Date(),
            fechaInicio: fechaInicio,
            fechaFin: fechaFin,
            diasRestantes: duracionDias,
            porcentajeCompletado: 0,
            racha: 0,
            diasSeguidos: 0,
            historialDiario: [],
            alertasTiempo: [],
            estaVencida: false,
            excedeTiempoRecomendado: false
          },
          // ✅ CRÍTICO: Agregar usuarioId para reglas
          usuarioId: user.uid
        };

        const userDoc = doc(this.firestore, `usuarios/${user.uid}`);
        const userSnap = await getDoc(userDoc);
        
        if (userSnap.exists()) {
          await updateDoc(userDoc, {
            'configuracionPlanes': plan,
            'actualizadoEn': Timestamp.now()
          });
        } else {
          await setDoc(userDoc, {
            configuracionPlanes: plan,
            actualizadoEn: Timestamp.now(),
            creadoEn: Timestamp.now()
          });
        }
        
        // ✅ ACTUALIZAR ESTADO REACTIVO
        this.planUsuarioSubject.next(plan);
        
        console.log('✅ Selección de dieta guardada correctamente en configuracionPlanes');
      } catch (error) {
        console.error('❌ Error guardando selección de dieta:', error);
        throw error;
      }
    });
  }

  // ✅ CORREGIDO: Desactivar plan
  async desactivarPlan(): Promise<void> {
    return this.ngZone.run(async () => {
      const user = this.auth.currentUser;
      if (!user) throw new Error('❌ Usuario no autenticado');

      try {
        const userDoc = doc(this.firestore, `usuarios/${user.uid}`);
        await updateDoc(userDoc, {
          'configuracionPlanes.activo': false,
          'actualizadoEn': Timestamp.now()
        });
        
        // ✅ ACTUALIZAR ESTADO REACTIVO
        const planActual = this.planUsuarioSubject.value;
        if (planActual) {
          planActual.activo = false;
          this.planUsuarioSubject.next(planActual);
        }
        
        console.log('✅ Plan desactivado correctamente');
      } catch (error) {
        console.error('❌ Error desactivando plan:', error);
        throw error;
      }
    });
  }

  // ==========================================
  // 📈 MÉTODOS DE PROGRESO - MEJORADOS
  // ==========================================

  async calcularProgresoDieta(): Promise<ProgresoDieta | null> {
    return this.ngZone.run(async () => {
      const user = this.auth.currentUser;
      if (!user) return null;

      try {
        const planActual = await this.obtenerPlanUsuario();
        if (!planActual || !planActual.activo) return null;

        const progreso = await this.calcularProgreso(planActual);
        await this.actualizarProgreso(progreso);
        return progreso;
      } catch (error) {
        console.error('❌ Error calculando progreso:', error);
        return null;
      }
    });
  }

  // ✅ CORREGIDO: Marcar día como completado
  async marcarDiaCompletado(calorias?: number, notas?: string): Promise<boolean> {
    return this.ngZone.run(async () => {
      const user = this.auth.currentUser;
      if (!user) return false;

      try {
        const planActual = await this.obtenerPlanUsuario();
        if (!planActual || !planActual.activo) return false;

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const historial = planActual.progreso?.historialDiario || [];
        
        // Verificar si ya está registrado
        const yaRegistrado = historial.some(h => {
          const fecha = h.fecha instanceof Date ? h.fecha : (h.fecha as any).toDate();
          fecha.setHours(0, 0, 0, 0);
          return fecha.getTime() === hoy.getTime();
        });

        if (!yaRegistrado) {
          const nuevoRegistro: HistorialDiario = {
            fecha: hoy,
            completado: true,
            calorias: calorias,
            notas: notas
          };

          historial.push(nuevoRegistro);

          const userDoc = doc(this.firestore, `usuarios/${user.uid}`);
          await updateDoc(userDoc, {
            'configuracionPlanes.progreso.historialDiario': historial
          });

          // ✅ RECALCULAR PROGRESO
          await this.calcularProgresoDieta();
          
          console.log('✅ Día marcado como completado correctamente');
          return true;
        } else {
          console.log('ℹ️ El día ya estaba marcado como completado');
          return false;
        }
      } catch (error) {
        console.error('❌ Error marcando día completado:', error);
        return false;
      }
    });
  }

  // ==========================================
  // 🛠️ MÉTODOS AUXILIARES - NUEVOS
  // ==========================================

  private corregirFechasPlan(plan: any): PlanUsuario {
    if (plan.fechaInicio && typeof plan.fechaInicio.toDate === 'function') {
      plan.fechaInicio = plan.fechaInicio.toDate();
    }
    if (plan.progreso?.ultimoAcceso && typeof plan.progreso.ultimoAcceso.toDate === 'function') {
      plan.progreso.ultimoAcceso = plan.progreso.ultimoAcceso.toDate();
    }
    if (plan.progreso?.fechaInicio && typeof plan.progreso.fechaInicio.toDate === 'function') {
      plan.progreso.fechaInicio = plan.progreso.fechaInicio.toDate();
    }
    if (plan.progreso?.fechaFin && typeof plan.progreso.fechaFin.toDate === 'function') {
      plan.progreso.fechaFin = plan.progreso.fechaFin.toDate();
    }
    return plan;
  }

  private async calcularProgreso(plan: PlanUsuario): Promise<ProgresoDieta> {
    const fechaInicio = plan.fechaInicio;
    const duracionDias = parseInt(plan.duracionPlan) || 30;
    const fechaFin = new Date(fechaInicio);
    fechaFin.setDate(fechaFin.getDate() + duracionDias);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaInicioSinHora = new Date(fechaInicio);
    fechaInicioSinHora.setHours(0, 0, 0, 0);

    const diasTranscurridos = Math.floor(
      (hoy.getTime() - fechaInicioSinHora.getTime()) / (1000 * 60 * 60 * 24)
    );

    const diasRestantes = Math.max(0, duracionDias - diasTranscurridos);
    const porcentajeCompletado = Math.min((diasTranscurridos / duracionDias) * 100, 100);
    const estaVencida = hoy > fechaFin;
    const excedeTiempoRecomendado = diasTranscurridos > 84;

    const historial = plan.progreso?.historialDiario || [];
    const racha = this.calcularRacha(historial);
    const diasSeguidos = historial.filter(h => h.completado).length;

    const alertas = this.generarAlertasTiempo(
      diasTranscurridos,
      diasRestantes,
      estaVencida,
      excedeTiempoRecomendado,
      duracionDias
    );

    return {
      diasCompletados: diasTranscurridos,
      ultimoAcceso: new Date(),
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      diasRestantes: diasRestantes,
      porcentajeCompletado: Math.round(porcentajeCompletado),
      racha: racha,
      diasSeguidos: diasSeguidos,
      historialDiario: historial,
      alertasTiempo: alertas,
      estaVencida: estaVencida,
      excedeTiempoRecomendado: excedeTiempoRecomendado
    };
  }

  private async actualizarProgreso(progreso: ProgresoDieta): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) return;

    try {
      const userDoc = doc(this.firestore, `usuarios/${user.uid}`);
      await updateDoc(userDoc, {
        'configuracionPlanes.progreso': progreso
      });
    } catch (error) {
      console.error('❌ Error actualizando progreso:', error);
    }
  }

  private calcularRacha(historial: HistorialDiario[]): number {
    if (!historial || historial.length === 0) return 0;

    const historialOrdenado = [...historial].sort((a, b) => {
      const fechaA = a.fecha instanceof Date ? a.fecha : (a.fecha as any).toDate();
      const fechaB = b.fecha instanceof Date ? b.fecha : (b.fecha as any).toDate();
      return fechaB.getTime() - fechaA.getTime();
    });

    let racha = 0;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    for (const entrada of historialOrdenado) {
      const fecha = entrada.fecha instanceof Date ? entrada.fecha : (entrada.fecha as any).toDate();
      fecha.setHours(0, 0, 0, 0);
      const diferenciaDias = Math.floor((hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24));
      if (diferenciaDias === racha && entrada.completado) {
        racha++;
      } else {
        break;
      }
    }

    return racha;
  }

  private generarAlertasTiempo(
    diasTranscurridos: number,
    diasRestantes: number,
    estaVencida: boolean,
    excedeTiempo: boolean,
    duracionTotal: number
  ): AlertaTiempo[] {
    const alertas: AlertaTiempo[] = [];

    if (estaVencida) {
      alertas.push({
        tipo: 'danger',
        mensaje: '⚠️ Tu plan ha finalizado. Considera consultar con un nutricionista antes de continuar.',
        fechaGenerada: new Date(),
        leida: false
      });
    } else if (excedeTiempo) {
      alertas.push({
        tipo: 'warning',
        mensaje: '⚠️ Has excedido el tiempo recomendado (12 semanas). Consulta con un profesional de la salud.',
        fechaGenerada: new Date(),
        leida: false
      });
    } else if (diasRestantes <= 7 && diasRestantes > 0) {
      alertas.push({
        tipo: 'warning',
        mensaje: `📅 Te quedan ${diasRestantes} días de tu plan. Prepárate para el siguiente paso.`,
        fechaGenerada: new Date(),
        leida: false
      });
    }

    const porcentaje = (diasTranscurridos / duracionTotal) * 100;
    if (porcentaje >= 25 && porcentaje < 30) {
      alertas.push({
        tipo: 'info',
        mensaje: '🎉 ¡Has completado el 25% de tu plan! Sigue así.',
        fechaGenerada: new Date(),
        leida: false
      });
    } else if (porcentaje >= 50 && porcentaje < 55) {
      alertas.push({
        tipo: 'info',
        mensaje: '🎯 ¡Mitad del camino! Estás haciendo un gran trabajo.',
        fechaGenerada: new Date(),
        leida: false
      });
    } else if (porcentaje >= 75 && porcentaje < 80) {
      alertas.push({
        tipo: 'info',
        mensaje: '🔥 ¡75% completado! Ya casi llegas a tu meta.',
        fechaGenerada: new Date(),
        leida: false
      });
    }

    return alertas;
  }

  // ==========================================
  // 💾 MÉTODOS DE CACHE OFFLINE - NUEVOS
  // ==========================================

  private async guardarEnCache(key: string, data: any): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await Preferences.set({
          key: `planes_${key}`,
          value: JSON.stringify(data)
        });
      } catch (error) {
        console.warn('⚠️ Error guardando en cache:', error);
      }
    }
  }

    private cargarDesdeCache<T>(key: string): Observable<T[]> {
    return this.ngZone.run(() => {
      if (Capacitor.isNativePlatform()) {
        return from(this.cargarDesdeCacheAsync<T>(key)).pipe(
          map(cache => cache || []),
          catchError(error => {
            console.warn('⚠️ Error cargando desde cache:', error);
            return of([]);
          })
        );
      }
      return of([]);
    });
  }

  private async cargarDesdeCacheAsync<T>(key: string): Promise<T[]> {
    try {
      const { value } = await Preferences.get({ key: `planes_${key}` });
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.warn('⚠️ Error cargando desde cache:', error);
      return [];
    }
  }

  private async guardarEjercicioLocal(ejercicio: Partial<EjercicioUsuario>): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        const ejerciciosLocales = await this.cargarDesdeCacheAsync<EjercicioUsuario>('ejercicios_pendientes');
        ejerciciosLocales.push({
          ...ejercicio as EjercicioUsuario,
          id: 'local_' + Date.now(),
          fechaCreacion: new Date()
        });
        await this.guardarEnCache('ejercicios_pendientes', ejerciciosLocales);
        console.log('💾 Ejercicio guardado localmente para sincronizar después');
      } catch (error) {
        console.error('❌ Error guardando ejercicio local:', error);
      }
    }
  }

  private esErrorDeConexion(error: any): boolean {
    return error?.code === 'unavailable' || 
           error?.message?.includes('offline') ||
           error?.message?.includes('network');
  }

  // ==========================================
  // 🗺️ MÉTODOS DE MAPEO
  // ==========================================

  private mapearDietaFirestore(dietaData: any): Dieta {
    const iconosPorTipo: { [key: string]: string } = {
      'alta_proteina': '💪',
      'keto': '🥑',
      'mediterranea': '🌱',
      'sin_gluten': '🍚',
      'vegetariana': '🌿',
      'baja_fibra': '🩺',
      'cardiosaludable': '❤️',
      'baja_carbohidratos': '🥗'
    };

    const coloresPorTipo: { [key: string]: string } = {
      'alta_proteina': '#EF4444',
      'keto': '#8B5CF6',
      'mediterranea': '#10B981',
      'sin_gluten': '#F59E0B',
      'vegetariana': '#22C55E',
      'baja_fibra': '#8B5CF6',
      'cardiosaludable': '#EC4899',
      'baja_carbohidratos': '#06B6D4'
    };

    const tipos: { [key: string]: any } = {
      'alta_proteina': 'ganancia_muscular',
      'keto': 'perdida_peso',
      'mediterranea': 'mantenimiento',
      'sin_gluten': 'especial',
      'vegetariana': 'mantenimiento',
      'baja_fibra': 'especial',
      'cardiosaludable': 'mantenimiento',
      'baja_carbohidratos': 'perdida_peso'
    };

    return {
      id: dietaData.id,
      nombre: dietaData.nombre || 'Dieta sin nombre',
      descripcion: dietaData.descripcion || '',
      icon: iconosPorTipo[dietaData.id] || '🍽',
      color: coloresPorTipo[dietaData.id] || '#666666',
      tipo: tipos[dietaData.id] || 'mantenimiento',
      beneficios: dietaData.beneficios || [],
      recomendaciones: dietaData.consideraciones || [],
      caloriasRecomendadas: {
        min: dietaData.objetivoCaloricoRecomendado?.minimo || 1500,
        max: dietaData.objetivoCaloricoRecomendado?.maximo || 2500
      },
      alimentosPermitidos: dietaData.alimentosPermitidos || [],
      alimentosEvitar: dietaData.alimentosEvitar || [],
      consideraciones: dietaData.consideraciones || [],
      macronutrientes: dietaData.macronutrientes || { proteinas: '30%', carbohidratos: '40%', grasas: '30%' },
      duracionRecomendada: dietaData.duracionRecomendada || '4-12 semanas',
      dificultad: dietaData.dificultad || 'media',
      esActiva: dietaData.esActiva !== false
    };
  }

  private mapearRecetaFirestore(recetaData: any): Receta {
    let tiempoPreparacion = recetaData.tiempoPreparacion;
    let tiempoCoccion = recetaData.tiempoCoccion;
    let tiempoTotal = recetaData.tiempoTotal;
    
    if (tiempoPreparacion && typeof tiempoPreparacion === 'object' && tiempoPreparacion.seconds !== undefined) {
      tiempoPreparacion = tiempoPreparacion.seconds / 60;
    }
    if (tiempoCoccion && typeof tiempoCoccion === 'object' && tiempoCoccion.seconds !== undefined) {
      tiempoCoccion = tiempoCoccion.seconds / 60;
    }
    if (tiempoTotal && typeof tiempoTotal === 'object' && tiempoTotal.seconds !== undefined) {
      tiempoTotal = tiempoTotal.seconds / 60;
    }

    return {
      id: recetaData.id,
      titulo: recetaData.titulo || 'Receta sin título',
      descripcion: recetaData.descripcion || '',
      categoria: recetaData.categoria || 'general',
      tipoDieta: recetaData.tipoDieta || [],
      tiempoPreparacion: tiempoPreparacion || 0,
      tiempoCoccion: tiempoCoccion || 0,
      tiempoTotal: tiempoTotal || 0,
      calorias: recetaData.calorias || recetaData.nutricion?.calorias || 0,
      ingredientes: recetaData.ingredientes || [],
      instrucciones: recetaData.instrucciones || [],
      nutricion: recetaData.nutricion || { proteinas: 0, carbohidratos: 0, grasas: 0, fibra: 0 },
      porciones: recetaData.porciones || 1,
      dificultad: recetaData.dificultad || 'facil',
      etiquetas: recetaData.etiquetas || [],
      esVerificada: recetaData.esVerificada !== false,
      megusta: recetaData.megusta || 0,
      guardados: recetaData.guardados || 0
    };
  }

  private mapearPlantillaEjercicioFirestore(plantillaData: any): PlantillaEjercicio {
    return {
      id: plantillaData.id,
      nombre: plantillaData.nombre || 'Plantilla sin nombre',
      descripcion: plantillaData.descripcion || '',
      duracion: plantillaData.duracion || 0,
      dificultad: plantillaData.dificultad || 'principiante',
      tipo: plantillaData.tipo || 'general',
      caloriasEstimadas: plantillaData.caloriasEstimadas || 0,
      ejercicios: plantillaData.ejercicios || []
    };
  }

  private mapearEjercicioFirestore(ejercicioData: any): EjercicioUsuario {
    return {
      id: ejercicioData.id,
      nombre: ejercicioData.nombre,
      descripcion: ejercicioData.descripcion || '',
      duracion: ejercicioData.duracion || 0,
      categoria: ejercicioData.categoria || 'personalizado',
      temporizador: ejercicioData.temporizador || { trabajo: 30, descanso: 10, series: 3 },
      completado: ejercicioData.completado || false,
      fechaCreacion: ejercicioData.fechaCreacion?.toDate?.() || new Date(),
      ultimaModificacion: ejercicioData.ultimaModificacion?.toDate?.() || new Date(),
      vecesCompletado: ejercicioData.vecesCompletado || 0,
      historial: ejercicioData.historial || [],
      usuarioId: ejercicioData.usuarioId
    };
  }

  private calcularDuracionTotal(temporizador: { trabajo: number; descanso: number; series: number }): number {
    return (temporizador.trabajo + temporizador.descanso) * temporizador.series;
  }
}