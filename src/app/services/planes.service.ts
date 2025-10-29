// src/app/services/planes.service.ts - VERSIÓN COMPLETA CON PROGRESO DE DIETAS
import { Injectable, inject } from '@angular/core';
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
import { Observable, from, map, of } from 'rxjs';

// ==========================================
// 📋 INTERFACES EXISTENTES
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

// ==========================================
// 📊 NUEVAS INTERFACES DE PROGRESO
// ==========================================

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
}

@Injectable({
  providedIn: 'root'
})
export class PlanesService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  // ==========================================
  // 🍽️ MÉTODOS DE DIETAS (EXISTENTES)
  // ==========================================

  obtenerDietas(): Observable<Dieta[]> {
    try {
      const dietasRef = collection(this.firestore, 'dietas');
      const q = query(dietasRef, where('esActiva', '==', true));
      
      return collectionData(q, { idField: 'id' }).pipe(
        map((dietas: any[]) => {
          console.log('📊 Dietas obtenidas:', dietas.length);
          return dietas.map(dieta => this.mapearDietaFirestore(dieta));
        })
      ) as Observable<Dieta[]>;
    } catch (error) {
      console.error('❌ Error obteniendo dietas:', error);
      return of([]);
    }
  }

  obtenerDietaPorId(id: string): Observable<Dieta | undefined> {
    try {
      const dietaDoc = doc(this.firestore, `dietas/${id}`);
      return from(getDoc(dietaDoc)).pipe(
        map(docSnap => {
          if (docSnap.exists()) {
            return this.mapearDietaFirestore({ id: docSnap.id, ...docSnap.data() });
          }
          return undefined;
        })
      );
    } catch (error) {
      console.error('❌ Error obteniendo dieta por ID:', error);
      return of(undefined);
    }
  }

  // ==========================================
  // 🍳 MÉTODOS DE RECETAS (EXISTENTES)
  // ==========================================

  obtenerRecetas(): Observable<Receta[]> {
    const user = this.auth.currentUser;
    if (!user) {
      console.warn('⚠️ Usuario no autenticado');
      return of([]);
    }
    return from(this.obtenerRecetasConManejoError());
  }

  private async obtenerRecetasConManejoError(): Promise<Receta[]> {
    try {
      const recetasRef = collection(this.firestore, 'recetas');
      
      try {
        const q = query(recetasRef, where('esVerificada', '==', true), orderBy('titulo'));
        const querySnapshot = await getDocs(q);
        const recetas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('📊 Recetas obtenidas (complejas):', recetas.length);
        return recetas.map(receta => this.mapearRecetaFirestore(receta));
      } catch (complexError) {
        console.warn('⚠️ Consulta compleja falló, intentando simple...', complexError);
        const qSimple = query(recetasRef, where('esVerificada', '==', true));
        const querySnapshot = await getDocs(qSimple);
        const recetas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('📊 Recetas obtenidas (simples):', recetas.length);
        return recetas.map(receta => this.mapearRecetaFirestore(receta));
      }
    } catch (error) {
      console.error('❌ Error crítico obteniendo recetas:', error);
      return [];
    }
  }

  obtenerRecetasPorTipoDieta(tipoDieta: string): Observable<Receta[]> {
    const user = this.auth.currentUser;
    if (!user) {
      console.warn('⚠️ Usuario no autenticado');
      return of([]);
    }
    return from(this.obtenerRecetasPorTipoDietaConErrorHandling(tipoDieta));
  }

  private async obtenerRecetasPorTipoDietaConErrorHandling(tipoDieta: string): Promise<Receta[]> {
    try {
      const recetasRef = collection(this.firestore, 'recetas');
      const q = query(
        recetasRef,
        where('tipoDieta', 'array-contains', tipoDieta),
        where('esVerificada', '==', true)
      );
      const querySnapshot = await getDocs(q);
      const recetas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(`📊 Recetas para dieta ${tipoDieta}:`, recetas.length);
      return recetas.map(receta => this.mapearRecetaFirestore(receta));
    } catch (error) {
      console.error(`❌ Error obteniendo recetas para dieta ${tipoDieta}:`, error);
      try {
        const todasLasRecetas = await this.obtenerRecetasConManejoError();
        return todasLasRecetas.filter(receta => receta.tipoDieta.includes(tipoDieta));
      } catch (fallbackError) {
        console.error('❌ Error en fallback:', fallbackError);
        return [];
      }
    }
  }

  async obtenerRecetaPorId(recetaId: string): Promise<Receta | null> {
    try {
      const recetaDocRef = doc(this.firestore, 'recetas', recetaId);
      const recetaDoc = await getDoc(recetaDocRef);
      
      if (recetaDoc.exists()) {
        const recetaData = { id: recetaDoc.id, ...recetaDoc.data() };
        console.log('✅ Receta obtenida por ID:', recetaData.id);
        return this.mapearRecetaFirestore(recetaData);
      }
      
      console.warn('⚠️ Receta no encontrada con ID:', recetaId);
      return null;
    } catch (error) {
      console.error('❌ Error obteniendo receta por ID:', error);
      throw error;
    }
  }

  // ==========================================
  // 💪 MÉTODOS DE EJERCICIOS (EXISTENTES)
  // ==========================================

  obtenerPlantillasEjercicio(): Observable<PlantillaEjercicio[]> {
    try {
      return from(this.obtenerPlantillasConManejoError());
    } catch (error) {
      console.error('❌ Error obteniendo plantillas de ejercicio:', error);
      return of([]);
    }
  }

  private async obtenerPlantillasConManejoError(): Promise<PlantillaEjercicio[]> {
    try {
      const plantillasRef = collection(this.firestore, 'plantillas');
      try {
        const q = query(plantillasRef, orderBy('nombre'));
        const querySnapshot = await getDocs(q);
        const plantillas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('📊 Plantillas obtenidas (ordenadas):', plantillas.length);
        return plantillas.map(plantilla => this.mapearPlantillaEjercicioFirestore(plantilla));
      } catch (orderError) {
        console.warn('⚠️ OrderBy falló, obteniendo sin ordenar...', orderError);
        const querySnapshot = await getDocs(plantillasRef);
        const plantillas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('📊 Plantillas obtenidas (sin ordenar):', plantillas.length);
        return plantillas.map(plantilla => this.mapearPlantillaEjercicioFirestore(plantilla));
      }
    } catch (error) {
      console.error('❌ Error crítico obteniendo plantillas:', error);
      return [];
    }
  }

  async crearEjercicio(ejercicio: Partial<EjercicioUsuario>): Promise<string> {
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
        ultimaModificacion: new Date()
      };

      const ejerciciosRef = collection(this.firestore, `usuarios/${user.uid}/ejercicios`);
      const docRef = await addDoc(ejerciciosRef, ejercicioCompleto);
      console.log('✅ Ejercicio creado con ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creando ejercicio:', error);
      throw error;
    }
  }

  obtenerEjerciciosUsuario(): Observable<EjercicioUsuario[]> {
    const user = this.auth.currentUser;
    if (!user) {
      console.warn('⚠️ Usuario no autenticado');
      return of([]);
    }

    try {
      const ejerciciosRef = collection(this.firestore, `usuarios/${user.uid}/ejercicios`);
      return collectionData(ejerciciosRef, { idField: 'id' }) as Observable<EjercicioUsuario[]>;
    } catch (error) {
      console.error('❌ Error obteniendo ejercicios usuario:', error);
      return of([]);
    }
  }

  async actualizarEjercicio(ejercicioId: string, ejercicio: Partial<EjercicioUsuario>): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('❌ Usuario no autenticado');

    try {
      const ejercicioDoc = doc(this.firestore, `usuarios/${user.uid}/ejercicios/${ejercicioId}`);
      const datosActualizados: any = { ...ejercicio, ultimaModificacion: new Date() };
      if (ejercicio.temporizador) {
        datosActualizados.duracion = this.calcularDuracionTotal(ejercicio.temporizador);
      }
      await updateDoc(ejercicioDoc, datosActualizados);
      console.log('✅ Ejercicio actualizado correctamente');
    } catch (error) {
      console.error('❌ Error actualizando ejercicio:', error);
      throw error;
    }
  }

  async eliminarEjercicio(ejercicioId: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('❌ Usuario no autenticado');

    try {
      const ejercicioDoc = doc(this.firestore, `usuarios/${user.uid}/ejercicios/${ejercicioId}`);
      await deleteDoc(ejercicioDoc);
      console.log('✅ Ejercicio eliminado correctamente');
    } catch (error) {
      console.error('❌ Error eliminando ejercicio:', error);
      throw error;
    }
  }

  async completarEjercicio(ejercicioId: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('❌ Usuario no autenticado');

    try {
      const ejercicioDoc = doc(this.firestore, `usuarios/${user.uid}/ejercicios/${ejercicioId}`);
      await updateDoc(ejercicioDoc, {
        completado: true,
        ultimaModificacion: new Date()
      });
      console.log('✅ Ejercicio marcado como completado');
    } catch (error) {
      console.error('❌ Error completando ejercicio:', error);
      throw error;
    }
  }

  // ==========================================
  // 📊 MÉTODOS DE PLAN DE USUARIO
  // ==========================================

  async obtenerPlanUsuario(): Promise<PlanUsuario | null> {
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
          
          console.log('📊 Plan de usuario obtenido:', plan);
          return plan;
        }
      }
      
      console.log('📊 No se encontró plan de usuario');
      return null;
    } catch (error) {
      console.error('❌ Error obteniendo plan usuario:', error);
      return null;
    }
  }

  async guardarSeleccionDieta(dietaId: string, objetivoCalorico: number, duracion: string): Promise<void> {
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
        }
      };

      const userDoc = doc(this.firestore, `usuarios/${user.uid}`);
      const userSnap = await getDoc(userDoc);
      
      if (userSnap.exists()) {
        await updateDoc(userDoc, {
          'configuracionPlanes': plan,
          'ultimaActualizacion': new Date()
        });
      } else {
        await setDoc(userDoc, {
          configuracionPlanes: plan,
          ultimaActualizacion: new Date(),
          fechaCreacion: new Date()
        });
      }
      
      console.log('✅ Selección de dieta guardada correctamente');
    } catch (error) {
      console.error('❌ Error guardando selección de dieta:', error);
      throw error;
    }
  }

  async desactivarPlan(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('❌ Usuario no autenticado');

    try {
      const userDoc = doc(this.firestore, `usuarios/${user.uid}`);
      await updateDoc(userDoc, {
        'configuracionPlanes.activo': false,
        'ultimaActualizacion': new Date()
      });
      console.log('✅ Plan desactivado correctamente');
    } catch (error) {
      console.error('❌ Error desactivando plan:', error);
      throw error;
    }
  }

  // ==========================================
  // 📊 NUEVOS MÉTODOS DE PROGRESO DE DIETAS
  // ==========================================

  /**
   * Calcula el progreso actual de la dieta del usuario
   */
  async calcularProgresoDieta(): Promise<ProgresoDieta | null> {
    const user = this.auth.currentUser;
    if (!user) return null;

    try {
      const planActual = await this.obtenerPlanUsuario();
      if (!planActual || !planActual.activo) return null;

      const fechaInicio = planActual.fechaInicio instanceof Date 
        ? planActual.fechaInicio 
        : (planActual.fechaInicio as any).toDate();
      
      const duracionDias = parseInt(planActual.duracionPlan) || 30;
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
      const excedeTiempoRecomendado = diasTranscurridos > 84; // 12 semanas

      const historial = planActual.progreso?.historialDiario || [];
      const racha = this.calcularRacha(historial);
      const diasSeguidos = historial.filter(h => h.completado).length;

      const alertas = this.generarAlertasTiempo(
        diasTranscurridos,
        diasRestantes,
        estaVencida,
        excedeTiempoRecomendado,
        duracionDias
      );

      const progreso: ProgresoDieta = {
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

      await this.actualizarProgreso(progreso);
      return progreso;
    } catch (error) {
      console.error('❌ Error calculando progreso:', error);
      return null;
    }
  }

  /**
   * Actualiza el progreso en Firestore
   */
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

  /**
   * Calcula la racha de días consecutivos
   */
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

  /**
   * Genera alertas automáticas según el progreso
   */
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

  /**
   * Marca el día de hoy como completado
   */
  async marcarDiaCompletado(calorias?: number, notas?: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) return;

    try {
      const planActual = await this.obtenerPlanUsuario();
      if (!planActual || !planActual.activo) return;

      const historial = planActual.progreso?.historialDiario || [];
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const yaRegistrado = historial.some(h => {
        const fecha = h.fecha instanceof Date ? h.fecha : (h.fecha as any).toDate();
        fecha.setHours(0, 0, 0, 0);
        return fecha.getTime() === hoy.getTime();
      });

      if (!yaRegistrado) {
        historial.push({
          fecha: hoy,
          completado: true,
          calorias: calorias,
          notas: notas
        });

        const userDoc = doc(this.firestore, `usuarios/${user.uid}`);
        await updateDoc(userDoc, {
          'configuracionPlanes.progreso.historialDiario': historial
        });

        await this.calcularProgresoDieta();
        console.log('✅ Día marcado como completado');
      }
    } catch (error) {
      console.error('❌ Error marcando día completado:', error);
    }
  }

  // ==========================================
  // 🛠️ MÉTODOS PRIVADOS DE MAPEO
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

  private calcularDuracionTotal(temporizador: { trabajo: number; descanso: number; series: number }): number {
    return (temporizador.trabajo + temporizador.descanso) * temporizador.series;
  }
}