// planes.service.ts - VERSIÓN COMPLETAMENTE CORREGIDA
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
  limit,
  DocumentData,
  Timestamp
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, from, map, of } from 'rxjs';

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
  progreso: {
    diasCompletados: number;
    ultimoAcceso: Date;
  };
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

@Injectable({
  providedIn: 'root'
})
export class PlanesService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  // ✅ OBTENER DIETAS DESDE FIRESTORE - CORREGIDO
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

  // ✅ OBTENER DIETA POR ID DESDE FIRESTORE
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

  // ✅ OBTENER RECETAS - VERSIÓN CORREGIDA CON MANEJO DE ÍNDICES
  obtenerRecetas(): Observable<Receta[]> {
    const user = this.auth.currentUser;
    if (!user) {
      console.warn('⚠️ Usuario no autenticado');
      return of([]);
    }

    return from(this.obtenerRecetasConManejoError());
  }

  // ✅ MÉTODO PRIVADO PARA MANEJAR ERRORES DE ÍNDICES
  private async obtenerRecetasConManejoError(): Promise<Receta[]> {
    try {
      const recetasRef = collection(this.firestore, 'recetas');
      
      // INTENTAR CONSULTA COMPLEJA PRIMERO
      try {
        const q = query(
          recetasRef,
          where('esVerificada', '==', true),
          orderBy('titulo')
        );
        
        const querySnapshot = await getDocs(q);
        const recetas = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('📊 Recetas obtenidas (complejas):', recetas.length);
        return recetas.map(receta => this.mapearRecetaFirestore(receta));
        
      } catch (complexError) {
        console.warn('⚠️ Consulta compleja falló, intentando simple...', complexError);
        
        // FALLBACK: CONSULTA SIMPLE
        const qSimple = query(
          recetasRef,
          where('esVerificada', '==', true)
        );
        
        const querySnapshot = await getDocs(qSimple);
        const recetas = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('📊 Recetas obtenidas (simples):', recetas.length);
        return recetas.map(receta => this.mapearRecetaFirestore(receta));
      }
      
    } catch (error) {
      console.error('❌ Error crítico obteniendo recetas:', error);
      return [];
    }
  }

  // ✅ OBTENER RECETAS POR TIPO DE DIETA - CORREGIDO
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
      
      // USAR array-contains PARA CAMPOS ARRAY
      const q = query(
        recetasRef,
        where('tipoDieta', 'array-contains', tipoDieta),
        where('esVerificada', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const recetas = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`📊 Recetas para dieta ${tipoDieta}:`, recetas.length);
      return recetas.map(receta => this.mapearRecetaFirestore(receta));
      
    } catch (error) {
      console.error(`❌ Error obteniendo recetas para dieta ${tipoDieta}:`, error);
      
      // FALLBACK: Obtener todas las recetas y filtrar localmente
      try {
        const todasLasRecetas = await this.obtenerRecetasConManejoError();
        return todasLasRecetas.filter(receta => 
          receta.tipoDieta.includes(tipoDieta)
        );
      } catch (fallbackError) {
        console.error('❌ Error en fallback:', fallbackError);
        return [];
      }
    }
  }

  // ✅ OBTENER RECETAS POR DIETA Y CATEGORÍA - CORREGIDO
  obtenerRecetasPorDietaYCategoria(dietaId: string, categoria: string): Observable<Receta[]> {
    const user = this.auth.currentUser;
    if (!user) {
      console.warn('⚠️ Usuario no autenticado');
      return of([]);
    }

    return from(this.obtenerRecetasPorDietaYCategoriaConErrorHandling(dietaId, categoria));
  }

  private async obtenerRecetasPorDietaYCategoriaConErrorHandling(dietaId: string, categoria: string): Promise<Receta[]> {
    try {
      const recetasRef = collection(this.firestore, 'recetas');
      
      const q = query(
        recetasRef,
        where('tipoDieta', 'array-contains', dietaId),
        where('categoria', '==', categoria),
        where('esVerificada', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const recetas = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`📊 Recetas para dieta ${dietaId} y categoría ${categoria}:`, recetas.length);
      return recetas.map(receta => this.mapearRecetaFirestore(receta));
      
    } catch (error) {
      console.error(`❌ Error obteniendo recetas para dieta ${dietaId} y categoría ${categoria}:`, error);
      return [];
    }
  }
  // planes.service.ts - AÑADIR ESTE MÉTODO
async obtenerRecetaPorId(recetaId: string): Promise<Receta | null> {
  try {
    const recetaDoc = await getDoc(doc(this.firestore, 'recetas', recetaId));
    
    if (recetaDoc.exists()) {
      return {
        id: recetaDoc.id,
        ...recetaDoc.data()
      } as Receta;
    }
    
    return null;
  } catch (error) {
    console.error('Error obteniendo receta:', error);
    return null;
  }
}

  // ✅ OBTENER PLANTILLAS DE EJERCICIO - CORREGIDO
  obtenerPlantillasEjercicio(): Observable<PlantillaEjercicio[]> {
    try {
      const plantillasRef = collection(this.firestore, 'plantillas');
      
      return from(this.obtenerPlantillasConManejoError());
    } catch (error) {
      console.error('❌ Error obteniendo plantillas de ejercicio:', error);
      return of([]);
    }
  }

  private async obtenerPlantillasConManejoError(): Promise<PlantillaEjercicio[]> {
    try {
      const plantillasRef = collection(this.firestore, 'plantillas');
      
      // INTENTAR CON ORDERBY PRIMERO
      try {
        const q = query(plantillasRef, orderBy('nombre'));
        const querySnapshot = await getDocs(q);
        const plantillas = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('📊 Plantillas obtenidas (ordenadas):', plantillas.length);
        return plantillas.map(plantilla => this.mapearPlantillaEjercicioFirestore(plantilla));
        
      } catch (orderError) {
        console.warn('⚠️ OrderBy falló, obteniendo sin ordenar...', orderError);
        
        // FALLBACK: SIN ORDERBY
        const querySnapshot = await getDocs(plantillasRef);
        const plantillas = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('📊 Plantillas obtenidas (sin ordenar):', plantillas.length);
        return plantillas.map(plantilla => this.mapearPlantillaEjercicioFirestore(plantilla));
      }
      
    } catch (error) {
      console.error('❌ Error crítico obteniendo plantillas:', error);
      return [];
    }
  }

  // ✅ OBTENER PLAN ACTUAL DEL USUARIO
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
          // Convertir fechas de Firestore a Date objects si es necesario
          if (plan.fechaInicio && typeof plan.fechaInicio.toDate === 'function') {
            plan.fechaInicio = plan.fechaInicio.toDate();
          }
          if (plan.progreso && plan.progreso.ultimoAcceso && typeof plan.progreso.ultimoAcceso.toDate === 'function') {
            plan.progreso.ultimoAcceso = plan.progreso.ultimoAcceso.toDate();
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

  // ✅ GUARDAR SELECCIÓN DE DIETA
  async guardarSeleccionDieta(dietaId: string, objetivoCalorico: number, duracion: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('❌ Usuario no autenticado');

    try {
      const plan: PlanUsuario = {
        dietaSeleccionada: dietaId,
        objetivoCaloricoPersonalizado: objetivoCalorico,
        duracionPlan: duracion,
        fechaInicio: new Date(),
        activo: true,
        progreso: {
          diasCompletados: 0,
          ultimoAcceso: new Date()
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

  // ✅ DESACTIVAR PLAN ACTUAL
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

  // ✅ CREAR NUEVO EJERCICIO - CORREGIDO
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

  // ✅ OBTENER EJERCICIOS DEL USUARIO - CORREGIDO
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

  // ✅ ACTUALIZAR EJERCICIO
  async actualizarEjercicio(ejercicioId: string, ejercicio: Partial<EjercicioUsuario>): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('❌ Usuario no autenticado');

    try {
      const ejercicioDoc = doc(this.firestore, `usuarios/${user.uid}/ejercicios/${ejercicioId}`);
      
      const datosActualizados: any = {
        ...ejercicio,
        ultimaModificacion: new Date()
      };

      // Calcular duración si se actualiza el temporizador
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

  // ✅ ELIMINAR EJERCICIO
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

  // ✅ MARCAR EJERCICIO COMO COMPLETADO
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

  // ✅ MÉTODOS PRIVADOS DE MAPEO
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
    // Convertir Timestamp a número si es necesario
    let tiempoPreparacion = recetaData.tiempoPreparacion;
    let tiempoCoccion = recetaData.tiempoCoccion;
    let tiempoTotal = recetaData.tiempoTotal;
    
    // Si son Timestamp de Firestore, convertirlos a minutos
    if (tiempoPreparacion && typeof tiempoPreparacion === 'object' && tiempoPreparacion.seconds !== undefined) {
      tiempoPreparacion = tiempoPreparacion.seconds / 60; // Convertir a minutos
    }
    if (tiempoCoccion && typeof tiempoCoccion === 'object' && tiempoCoccion.seconds !== undefined) {
      tiempoCoccion = tiempoCoccion.seconds / 60; // Convertir a minutos
    }
    if (tiempoTotal && typeof tiempoTotal === 'object' && tiempoTotal.seconds !== undefined) {
      tiempoTotal = tiempoTotal.seconds / 60; // Convertir a minutos
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
