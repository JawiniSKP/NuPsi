// src/app/pages/ejercicios/ejercicios.page.ts
import { Component, OnInit, OnDestroy, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { 
  EjerciciosService, 
  EjercicioUsuario, 
  PlantillaEjercicio,
  EstadisticasEjercicio 
} from '../../services/ejercicios.service';

@Component({
  selector: 'app-ejercicios',
  templateUrl: './ejercicios.page.html',
  styleUrls: ['./ejercicios.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class EjerciciosPage implements OnInit, OnDestroy {
  cargando: boolean = true;
  ejercicios: EjercicioUsuario[] = [];
  plantillasEjercicio: PlantillaEjercicio[] = [];
  estadisticas: EstadisticasEjercicio | null = null;
  
  // Para edición de ejercicio
  ejercicioEditando: EjercicioUsuario | null = null;
  modoEdicion: boolean = false;

  // Nuevo ejercicio con valores por defecto
  nuevoEjercicio = {
    nombre: '',
    descripcion: '',
    temporizador: {
      trabajo: 30,
      descanso: 15,
      series: 3
    }
  };

  private ejerciciosService = inject(EjerciciosService);
  private router = inject(Router);
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);
  private ngZone = inject(NgZone);
  private subscriptions: Subscription[] = [];

  async ngOnInit() {
    await this.cargarDatosIniciales();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // ==========================================
  // 📊 CARGA DE DATOS - CORREGIDO CON NgZone
  // ==========================================

  async cargarDatosIniciales() {
    try {
      this.cargando = true;
      
      // Cargar ejercicios del usuario
      this.cargarEjercicios();

      // Cargar plantillas de ejercicio
      this.cargarPlantillasEjercicio();

      // Cargar estadísticas
      await this.cargarEstadisticas();
      
    } catch (error: any) {
      console.error('Error cargando datos:', error);
      this.mostrarToast('Error al cargar los datos', 'danger');
    } finally {
      this.cargando = false;
    }
  }

  cargarEjercicios() {
    try {
      const ejerciciosSub = this.ejerciciosService
        .obtenerEjerciciosUsuario()
        .subscribe({
          next: (ejercicios: EjercicioUsuario[]) => {
            this.ngZone.run(() => {
              this.ejercicios = ejercicios;
              console.log('✅ Ejercicios cargados:', ejercicios.length);
            });
          },
          error: (error: any) => {
            this.ngZone.run(() => {
              console.error('Error cargando ejercicios:', error);
              this.mostrarToast('Error al cargar los ejercicios', 'danger');
            });
          }
        });
      
      this.subscriptions.push(ejerciciosSub);
    } catch (error: any) {
      console.error('Error cargando ejercicios:', error);
    }
  }

  cargarPlantillasEjercicio() {
    try {
      const plantillasSub = this.ejerciciosService
        .obtenerPlantillasEjercicio()
        .subscribe({
          next: (plantillas: PlantillaEjercicio[]) => {
            this.ngZone.run(() => {
              this.plantillasEjercicio = plantillas;
              console.log('✅ Plantillas cargadas:', plantillas.length);
            });
          },
          error: (error: any) => {
            this.ngZone.run(() => {
              console.error('Error cargando plantillas:', error);
            });
          }
        });
      
      this.subscriptions.push(plantillasSub);
    } catch (error: any) {
      console.error('Error cargando plantillas:', error);
    }
  }

  async cargarEstadisticas() {
    try {
      const estadisticas = await this.ejerciciosService.obtenerEstadisticas();
      this.ngZone.run(() => {
        this.estadisticas = estadisticas;
        console.log('✅ Estadísticas cargadas:', this.estadisticas);
      });
    } catch (error: any) {
      this.ngZone.run(() => {
        console.error('Error cargando estadísticas:', error);
      });
    }
  }

  // ==========================================
  // 💪 CRUD DE EJERCICIOS - CORREGIDO CON NgZone
  // ==========================================

  async crearEjercicio() {
    if (!this.nuevoEjercicio.nombre.trim()) {
      this.mostrarToast('Por favor ingresa un nombre para el ejercicio', 'warning');
      return;
    }

    try {
      this.cargando = true;
      
      await this.ejerciciosService.crearEjercicio({
        nombre: this.nuevoEjercicio.nombre,
        descripcion: this.nuevoEjercicio.descripcion,
        temporizador: this.nuevoEjercicio.temporizador,
        categoria: 'personalizado'
      });

      this.ngZone.run(() => {
        this.resetFormEjercicio();
        this.mostrarToast('Ejercicio creado exitosamente', 'success');
      });
      
      await this.cargarEstadisticas();

    } catch (error: any) {
      this.ngZone.run(() => {
        console.error('Error creando ejercicio:', error);
        this.mostrarToast('Error al crear el ejercicio', 'danger');
      });
    } finally {
      this.cargando = false;
    }
  }

  editarEjercicio(ejercicio: EjercicioUsuario) {
    this.ngZone.run(() => {
      this.ejercicioEditando = { ...ejercicio };
      this.nuevoEjercicio = {
        nombre: ejercicio.nombre,
        descripcion: ejercicio.descripcion,
        temporizador: { ...ejercicio.temporizador }
      };
      this.modoEdicion = true;
    });

    // Scroll al formulario
    setTimeout(() => {
      const formElement = document.querySelector('.crear-ejercicio-card');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  async actualizarEjercicio() {
    if (!this.ejercicioEditando?.id || !this.nuevoEjercicio.nombre.trim()) {
      this.mostrarToast('Error al actualizar el ejercicio', 'danger');
      return;
    }

    try {
      this.cargando = true;
      
      await this.ejerciciosService.actualizarEjercicio(this.ejercicioEditando.id, {
        nombre: this.nuevoEjercicio.nombre,
        descripcion: this.nuevoEjercicio.descripcion,
        temporizador: this.nuevoEjercicio.temporizador
      });

      this.ngZone.run(() => {
        this.mostrarToast('Ejercicio actualizado exitosamente', 'success');
        this.cancelarEdicion();
      });

    } catch (error: any) {
      this.ngZone.run(() => {
        console.error('Error actualizando ejercicio:', error);
        this.mostrarToast('Error al actualizar el ejercicio', 'danger');
      });
    } finally {
      this.cargando = false;
    }
  }

  async eliminarEjercicio(ejercicio: EjercicioUsuario) {
    if (!ejercicio.id) return;

    const alert = await this.alertController.create({
      header: 'Eliminar Ejercicio',
      message: `¿Estás seguro de que quieres eliminar "${ejercicio.nombre}"?`,
      cssClass: 'custom-alert',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.ejerciciosService.eliminarEjercicio(ejercicio.id!);
              this.ngZone.run(() => {
                this.mostrarToast('Ejercicio eliminado', 'success');
              });
              await this.cargarEstadisticas();
            } catch (error: any) {
              this.ngZone.run(() => {
                console.error('Error eliminando ejercicio:', error);
                this.mostrarToast('Error al eliminar el ejercicio', 'danger');
              });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  cancelarEdicion() {
    this.ngZone.run(() => {
      this.modoEdicion = false;
      this.ejercicioEditando = null;
      this.resetFormEjercicio();
    });
  }

  resetFormEjercicio() {
    this.nuevoEjercicio = {
      nombre: '',
      descripcion: '',
      temporizador: {
        trabajo: 30,
        descanso: 15,
        series: 3
      }
    };
  }

  // ==========================================
  // 🎯 PLANTILLAS - CORREGIDO CON NgZone
  // ==========================================

  usarPlantillaEjercicio(plantilla: PlantillaEjercicio) {
    this.ngZone.run(() => {
      this.nuevoEjercicio = {
        nombre: plantilla.nombre,
        descripcion: plantilla.descripcion,
        temporizador: {
          trabajo: 30,
          descanso: 15,
          series: 3
        }
      };
      
      this.mostrarToast('Plantilla cargada. Personaliza los tiempos si lo deseas.', 'success');
    });

    // Scroll al formulario
    setTimeout(() => {
      const formElement = document.querySelector('.crear-ejercicio-card');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  // ==========================================
  // ⏱️ INICIAR EJERCICIO - CORREGIDO CON NgZone
  // ==========================================

  async iniciarEjercicio(ejercicio: EjercicioUsuario) {
    if (ejercicio.id) {
      this.ngZone.run(() => {
        this.router.navigate(['/temporizador-ejercicio', ejercicio.id]);
      });
    }
  }

  async resetearEjercicio(ejercicio: EjercicioUsuario) {
    if (!ejercicio.id) return;

    const alert = await this.alertController.create({
      header: 'Reiniciar Ejercicio',
      message: `¿Quieres volver a hacer "${ejercicio.nombre}"?`,
      cssClass: 'custom-alert',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Reiniciar',
          handler: async () => {
            try {
              await this.ejerciciosService.resetearEjercicio(ejercicio.id!);
              this.ngZone.run(() => {
                this.mostrarToast('Ejercicio reiniciado', 'success');
              });
            } catch (error: any) {
              this.ngZone.run(() => {
                console.error('Error reseteando ejercicio:', error);
                this.mostrarToast('Error al reiniciar el ejercicio', 'danger');
              });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async verHistorial(ejercicio: EjercicioUsuario) {
    if (!ejercicio.id) return;

    try {
      const historial = await this.ejerciciosService.obtenerHistorialEjercicio(ejercicio.id);
      
      if (historial.length === 0) {
        this.ngZone.run(() => {
          this.mostrarToast('Este ejercicio no tiene historial aún', 'warning');
        });
        return;
      }

      // Formatear historial para mostrar
      const mensaje = historial
        .slice(-5) // Últimas 5 entradas
        .map((entrada, index) => {
          const fecha = entrada.fecha instanceof Date 
            ? entrada.fecha 
            : (entrada.fecha as any).toDate();
          const duracion = this.ejerciciosService.formatearDuracion(entrada.duracionReal);
          return `${index + 1}. ${fecha.toLocaleDateString()} - ${duracion}`;
        })
        .join('\n');

      const alert = await this.alertController.create({
        header: `Historial de ${ejercicio.nombre}`,
        message: `Completado ${ejercicio.vecesCompletado || 0} veces\n\nÚltimos entrenamientos:\n${mensaje}`,
        cssClass: 'custom-alert',
        buttons: ['Cerrar']
      });

      await alert.present();
    } catch (error: any) {
      this.ngZone.run(() => {
        console.error('Error obteniendo historial:', error);
        this.mostrarToast('Error al cargar el historial', 'danger');
      });
    }
  }

  // ==========================================
  // 🛠️ MÉTODOS AUXILIARES
  // ==========================================

  getIconoTipoEjercicio(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'cardio': 'walk',
      'fuerza': 'barbell',
      'flexibilidad': 'body',
      'yoga': 'leaf'
    };
    return iconos[tipo] || 'fitness';
  }

  getDuracionFormateada(segundos: number): string {
    return this.ejerciciosService.formatearDuracion(segundos);
  }

  getTiempoTotalFormateado(): string {
    if (!this.estadisticas) return '0m';
    return this.ejerciciosService.formatearDuracion(this.estadisticas.tiempoTotalEntrenamiento);
  }

  getPorcentajeCompletado(): number {
    if (!this.estadisticas || this.estadisticas.totalEjercicios === 0) return 0;
    return Math.round((this.estadisticas.ejerciciosCompletados / this.estadisticas.totalEjercicios) * 100);
  }

  // ==========================================
  // 🎨 TOAST - CORREGIDO CON NgZone
  // ==========================================

  private async mostrarToast(mensaje: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }

  // ==========================================
  // 🧭 NAVEGACIÓN - CORREGIDO CON NgZone
  // ==========================================

  goBack() {
    this.ngZone.run(() => {
      this.router.navigate(['/planes']);
    });
  }
}