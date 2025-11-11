import { Injectable, inject, NgZone } from '@angular/core'; // ✅ NgZone AGREGADO
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
import { Observable, from, of } from 'rxjs';

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
}

export interface HistorialEjercicio {
  fecha: Date;
  duracionReal: number; // en segundos
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

export interface EstadisticasEjercicio {
  totalEjercicios: number;
  ejerciciosCompletados: number;
  tiempoTotalEntrenamiento: number; // en segundos
  racha: number; // días consecutivos
  ultimoEntrenamiento?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class EjerciciosService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private ngZone = inject(NgZone); // ✅ NgZone AGREGADO

  // ==========================================
  // 📊 MÉTODOS DE PLANTILLAS - CORREGIDOS
  // ==========================================

  /**
   * Obtiene todas las plantillas de ejercicio disponibles
   */
  obtenerPlantillasEjercicio(): Observable<PlantillaEjercicio[]> {
    return this.ngZone.run(() => {
      try {
        return from(this.obtenerPlantillasConManejoError());
      } catch (error) {
        console.error('❌ Error obteniendo plantillas de ejercicio:', error);
        return of([]);
      }
    });
  }

  private async obtenerPlantillasConManejoError(): Promise<PlantillaEjercicio[]> {
    return this.ngZone.run(() => {
      try {
        const plantillasRef = collection(this.firestore, 'plantillas');
        
        // Intentar con orderBy primero
        return getDocs(query(plantillasRef, orderBy('nombre'))).then(querySnapshot => {
          const plantillas = this.mapearPlantillas(querySnapshot);
          console.log('📊 Plantillas obtenidas (ordenadas):', plantillas.length);
          return plantillas;
        }).catch(async (orderError) => {
          console.warn('⚠️ OrderBy falló, obteniendo sin ordenar...', orderError);
          
          // Fallback: Sin orderBy
          const querySnapshot = await getDocs(plantillasRef);
          const plantillas = this.mapearPlantillas(querySnapshot);
          console.log('📊 Plantillas obtenidas (sin ordenar):', plantillas.length);
          return plantillas;
        });
      } catch (error) {
        console.error('❌ Error crítico obteniendo plantillas:', error);
        return [];
      }
    });
  }

  private mapearPlantillas(querySnapshot: any): PlantillaEjercicio[] {
    const plantillas = querySnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
    return plantillas as PlantillaEjercicio[];
  }

  // ==========================================
  // 💪 MÉTODOS DE EJERCICIOS DEL USUARIO - CORREGIDOS
  // ==========================================

  /**
   * Crea un nuevo ejercicio para el usuario
   */
  async crearEjercicio(ejercicio: Partial<EjercicioUsuario>): Promise<string> {
    return this.ngZone.run(() => {
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
          historial: []
        };

        const ejerciciosRef = collection(this.firestore, `usuarios/${user.uid}/ejercicios`);
        return addDoc(ejerciciosRef, ejercicioCompleto).then(docRef => {
          console.log('✅ Ejercicio creado con ID:', docRef.id);
          return docRef.id;
        });
      } catch (error) {
        console.error('❌ Error creando ejercicio:', error);
        throw error;
      }
    });
  }

  /**
   * Obtiene todos los ejercicios del usuario
   */
  obtenerEjerciciosUsuario(): Observable<EjercicioUsuario[]> {
    return this.ngZone.run(() => {
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
    });
  }

  /**
   * Obtiene un ejercicio específico por ID
   */
  async obtenerEjercicioPorId(ejercicioId: string): Promise<EjercicioUsuario | null> {
    return this.ngZone.run(() => {
      const user = this.auth.currentUser;
      if (!user) throw new Error('❌ Usuario no autenticado');

      try {
        const ejercicioDoc = doc(this.firestore, `usuarios/${user.uid}/ejercicios/${ejercicioId}`);
        return getDoc(ejercicioDoc).then(ejercicioSnap => {
          if (ejercicioSnap.exists()) {
            return {
              id: ejercicioSnap.id,
              ...ejercicioSnap.data()
            } as EjercicioUsuario;
          }
          return null;
        });
      } catch (error) {
        console.error('❌ Error obteniendo ejercicio por ID:', error);
        return null;
      }
    });
  }

  /**
   * Actualiza un ejercicio existente
   */
  async actualizarEjercicio(ejercicioId: string, ejercicio: Partial<EjercicioUsuario>): Promise<void> {
    return this.ngZone.run(() => {
      const user = this.auth.currentUser;
      if (!user) throw new Error('❌ Usuario no autenticado');

      try {
        const ejercicioDoc = doc(this.firestore, `usuarios/${user.uid}/ejercicios/${ejercicioId}`);
        
        const datosActualizados: any = {
          ...ejercicio,
          ultimaModificacion: new Date()
        };

        if (ejercicio.temporizador) {
          datosActualizados.duracion = this.calcularDuracionTotal(ejercicio.temporizador);
        }

        return updateDoc(ejercicioDoc, datosActualizados).then(() => {
          console.log('✅ Ejercicio actualizado correctamente');
        });
      } catch (error) {
        console.error('❌ Error actualizando ejercicio:', error);
        throw error;
      }
    });
  }

  /**
   * Elimina un ejercicio
   */
  async eliminarEjercicio(ejercicioId: string): Promise<void> {
    return this.ngZone.run(() => {
      const user = this.auth.currentUser;
      if (!user) throw new Error('❌ Usuario no autenticado');

      try {
        const ejercicioDoc = doc(this.firestore, `usuarios/${user.uid}/ejercicios/${ejercicioId}`);
        return deleteDoc(ejercicioDoc).then(() => {
          console.log('✅ Ejercicio eliminado correctamente');
        });
      } catch (error) {
        console.error('❌ Error eliminando ejercicio:', error);
        throw error;
      }
    });
  }

  // ==========================================
  // 📈 MÉTODOS DE PROGRESO Y HISTORIAL - CORREGIDOS
  // ==========================================

  /**
   * Completa un ejercicio y registra en el historial
   */
  async completarEjercicio(ejercicioId: string, duracionReal: number, notas?: string): Promise<void> {
    return this.ngZone.run(() => {
      const user = this.auth.currentUser;
      if (!user) throw new Error('❌ Usuario no autenticado');

      try {
        const ejercicioDoc = doc(this.firestore, `usuarios/${user.uid}/ejercicios/${ejercicioId}`);
        return getDoc(ejercicioDoc).then(async (ejercicioSnap) => {
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
              ultimaModificacion: new Date()
            });
            
            console.log('✅ Ejercicio completado y registrado en historial');
          }
        });
      } catch (error) {
        console.error('❌ Error completando ejercicio:', error);
        throw error;
      }
    });
  }

  /**
   * Resetea el estado de completado de un ejercicio
   */
  async resetearEjercicio(ejercicioId: string): Promise<void> {
    return this.ngZone.run(() => {
      const user = this.auth.currentUser;
      if (!user) throw new Error('❌ Usuario no autenticado');

      try {
        const ejercicioDoc = doc(this.firestore, `usuarios/${user.uid}/ejercicios/${ejercicioId}`);
        return updateDoc(ejercicioDoc, {
          completado: false,
          ultimaModificacion: new Date()
        }).then(() => {
          console.log('✅ Ejercicio reseteado correctamente');
        });
      } catch (error) {
        console.error('❌ Error reseteando ejercicio:', error);
        throw error;
      }
    });
  }

  /**
   * Obtiene el historial de un ejercicio específico
   */
  async obtenerHistorialEjercicio(ejercicioId: string): Promise<HistorialEjercicio[]> {
    return this.ngZone.run(() => {
      const user = this.auth.currentUser;
      if (!user) throw new Error('❌ Usuario no autenticado');

      try {
        const ejercicioDoc = doc(this.firestore, `usuarios/${user.uid}/ejercicios/${ejercicioId}`);
        return getDoc(ejercicioDoc).then(ejercicioSnap => {
          if (ejercicioSnap.exists()) {
            const ejercicioData = ejercicioSnap.data() as EjercicioUsuario;
            return ejercicioData.historial || [];
          }
          return [];
        });
      } catch (error) {
        console.error('❌ Error obteniendo historial:', error);
        return [];
      }
    });
  }

  /**
   * Obtiene estadísticas generales de ejercicios del usuario
   */
  async obtenerEstadisticas(): Promise<EstadisticasEjercicio> {
    return this.ngZone.run(() => {
      const user = this.auth.currentUser;
      if (!user) throw new Error('❌ Usuario no autenticado');

      try {
        const ejerciciosRef = collection(this.firestore, `usuarios/${user.uid}/ejercicios`);
        return getDocs(ejerciciosRef).then(querySnapshot => {
          let totalEjercicios = 0;
          let ejerciciosCompletados = 0;
          let tiempoTotalEntrenamiento = 0;
          let ultimoEntrenamiento: Date | undefined = undefined;

          querySnapshot.forEach((doc) => {
            const ejercicio = doc.data() as EjercicioUsuario;
            totalEjercicios++;
            
            if (ejercicio.completado) {
              ejerciciosCompletados++;
            }
            
            if (ejercicio.historial && ejercicio.historial.length > 0) {
              ejercicio.historial.forEach((entrada: any) => {
                tiempoTotalEntrenamiento += entrada.duracionReal;
                
                const fechaEntrada = entrada.fecha instanceof Date 
                  ? entrada.fecha 
                  : entrada.fecha.toDate();
                
                if (!ultimoEntrenamiento || fechaEntrada > ultimoEntrenamiento) {
                  ultimoEntrenamiento = fechaEntrada;
                }
              });
            }
          });

          // Calcular racha (días consecutivos)
          return this.calcularRacha().then(racha => {
            return {
              totalEjercicios,
              ejerciciosCompletados,
              tiempoTotalEntrenamiento,
              racha,
              ultimoEntrenamiento
            };
          });
        });
      } catch (error) {
        console.error('❌ Error obteniendo estadísticas:', error);
        return {
          totalEjercicios: 0,
          ejerciciosCompletados: 0,
          tiempoTotalEntrenamiento: 0,
          racha: 0
        };
      }
    });
  }

  /**
   * Calcula la racha de días consecutivos con entrenamientos
   */
  private async calcularRacha(): Promise<number> {
    return this.ngZone.run(() => {
      const user = this.auth.currentUser;
      if (!user) return 0;

      try {
        const ejerciciosRef = collection(this.firestore, `usuarios/${user.uid}/ejercicios`);
        return getDocs(ejerciciosRef).then(querySnapshot => {
          const fechasEntrenamiento: Date[] = [];
          
          querySnapshot.forEach((doc) => {
            const ejercicio = doc.data() as EjercicioUsuario;
            if (ejercicio.historial) {
              ejercicio.historial.forEach((entrada: any) => {
                const fecha = entrada.fecha instanceof Date 
                  ? entrada.fecha 
                  : entrada.fecha.toDate();
                fechasEntrenamiento.push(fecha);
              });
            }
          });

          if (fechasEntrenamiento.length === 0) return 0;

          // Ordenar fechas de más reciente a más antigua
          fechasEntrenamiento.sort((a, b) => b.getTime() - a.getTime());

          let racha = 0;
          const hoy = new Date();
          hoy.setHours(0, 0, 0, 0);

          let fechaActual = new Date(hoy);
          
          for (const fechaEntrenamiento of fechasEntrenamiento) {
            const fecha = new Date(fechaEntrenamiento);
            fecha.setHours(0, 0, 0, 0);
            
            if (fecha.getTime() === fechaActual.getTime()) {
              racha++;
              fechaActual.setDate(fechaActual.getDate() - 1);
            } else if (fecha.getTime() < fechaActual.getTime()) {
              break;
            }
          }

          return racha;
        });
      } catch (error) {
        console.error('❌ Error calculando racha:', error);
        return 0;
      }
    });
  }

  // ==========================================
  // 🛠️ MÉTODOS AUXILIARES
  // ==========================================

  /**
   * Calcula la duración total de un ejercicio en segundos
   */
  private calcularDuracionTotal(temporizador: { trabajo: number; descanso: number; series: number }): number {
    return (temporizador.trabajo + temporizador.descanso) * temporizador.series;
  }

  /**
   * Formatea segundos a formato mm:ss
   */
  formatearTiempo(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  }

  /**
   * Formatea duración en formato legible (ej: "1h 30m" o "45m")
   */
  formatearDuracion(segundos: number): string {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    
    if (horas > 0) {
      return `${horas}h ${minutos}m`;
    }
    return `${minutos}m`;
  }
}