// planes.page.ts - VERSIÓN COMPLETAMENTE CORREGIDA
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { PlanesService, Dieta, PlanUsuario, EjercicioUsuario, Receta, PlantillaEjercicio } from '../../services/planes.service';

@Component({
  selector: 'app-planes',
  templateUrl: './planes.page.html',
  styleUrls: ['./planes.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class PlanesPage implements OnInit, OnDestroy {
  seccionActiva: 'nutricion' | 'ejercicio' = 'nutricion';
  planActual: PlanUsuario | null = null;
  cargando: boolean = true;
  dietas: Dieta[] = [];
  recetasDelDia: Receta[] = [];
  ejercicios: EjercicioUsuario[] = [];
  plantillasEjercicio: PlantillaEjercicio[] = [];
  
  // Para el modal de selección de dieta
  mostrarModalDieta: boolean = false;
  dietaSeleccionadaModal: Dieta | null = null;
  
  // Para edición de ejercicio
  ejercicioEditando: EjercicioUsuario | null = null;
  modoEdicion: boolean = false;

  // Para mostrar detalles de dieta
  mostrarDetallesDieta: boolean = false;
  dietaDetallada: Dieta | null = null;

  // Para mostrar recetas de dieta
  mostrarRecetasDieta: boolean = false;
  recetasDietaSeleccionada: Receta[] = [];

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

  private subscriptions: Subscription[] = [];

  constructor(
    private planesService: PlanesService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    await this.cargarDatosIniciales();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  async cargarDatosIniciales() {
    try {
      this.cargando = true;
      
      // Cargar dietas desde Firestore
      const dietasSub = this.planesService.obtenerDietas().subscribe({
        next: (dietas) => {
          this.dietas = dietas;
        },
        error: (error: any) => {
          console.error('Error cargando dietas:', error);
          this.mostrarToast('Error al cargar las dietas', 'danger');
        }
      });
      
      // Cargar plan actual
      this.planActual = await this.planesService.obtenerPlanUsuario();
      
      // Si tiene plan activo, cargar recetas
      if (this.planActual?.activo && this.planActual.dietaSeleccionada) {
        await this.cargarRecetasDelDia();
      }
      
      // Cargar ejercicios del usuario
      this.cargarEjercicios();

      // Cargar plantillas de ejercicio
      this.cargarPlantillasEjercicio();
      
      this.subscriptions.push(dietasSub);
      
    } catch (error: any) {
      console.error('Error cargando datos:', error);
      this.mostrarToast('Error al cargar los datos', 'danger');
    } finally {
      this.cargando = false;
    }
  }

  async cargarRecetasDelDia() {
    if (!this.planActual?.dietaSeleccionada) return;
    
    try {
      const recetasSub = this.planesService
        .obtenerRecetasPorTipoDieta(this.planActual.dietaSeleccionada)
        .subscribe({
          next: (recetas: Receta[]) => {
            this.recetasDelDia = recetas.slice(0, 3);
          },
          error: (error: any) => {
            console.error('Error cargando recetas:', error);
          }
        });
      
      this.subscriptions.push(recetasSub);
    } catch (error: any) {
      console.error('Error cargando recetas:', error);
    }
  }

  cargarEjercicios() {
    try {
      const ejerciciosSub = this.planesService
        .obtenerEjerciciosUsuario()
        .subscribe({
          next: (ejercicios: EjercicioUsuario[]) => {
            this.ejercicios = ejercicios;
          },
          error: (error: any) => {
            console.error('Error cargando ejercicios:', error);
            this.mostrarToast('Error al cargar los ejercicios', 'danger');
          }
        });
      
      this.subscriptions.push(ejerciciosSub);
    } catch (error: any) {
      console.error('Error cargando ejercicios:', error);
    }
  }

  // ✅ NUEVO MÉTODO PARA MANEJAR EL CASO UNDEFINED
  verRecetasDietaSiExiste() {
    const dietaActual = this.getDietaActual();
    if (dietaActual) {
      this.verRecetasDieta(dietaActual);
    } else {
      this.mostrarToast('No se pudo encontrar la dieta actual', 'warning');
    }
  }

  cargarPlantillasEjercicio() {
    try {
      const plantillasSub = this.planesService
        .obtenerPlantillasEjercicio()
        .subscribe({
          next: (plantillas: PlantillaEjercicio[]) => {
            this.plantillasEjercicio = plantillas;
          },
          error: (error: any) => {
            console.error('Error cargando plantillas:', error);
          }
        });
      
      this.subscriptions.push(plantillasSub);
    } catch (error: any) {
      console.error('Error cargando plantillas:', error);
    }
  }

  // ✅ MÉTODO PARA OBTENER ICONO DE TIPO DE EJERCICIO - CORREGIDO
  getIconoTipoEjercicio(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'cardio': 'walk',
      'fuerza': 'barbell',
      'flexibilidad': 'body',
      'yoga': 'leaf'
    };
    return iconos[tipo] || 'fitness';
  }

  // ✅ MÉTODO PARA OBTENER DIETA ACTUAL - NUEVO MÉTODO
  getDietaActual(): Dieta | undefined {
    if (!this.planActual?.dietaSeleccionada) return undefined;
    return this.dietas.find(d => d.id === this.planActual?.dietaSeleccionada);
  }

  cambiarSeccion(event: any) {
    const seccion = event.detail.value;
    
    if (seccion === 'nutricion' || seccion === 'ejercicio') {
      this.seccionActiva = seccion;
    }
  }

  seleccionarDieta(dieta: Dieta) {
    this.dietaSeleccionadaModal = dieta;
    this.mostrarModalDieta = true;
  }

  verDetallesDieta(dieta: Dieta) {
    this.dietaDetallada = dieta;
    this.mostrarDetallesDieta = true;
  }

  async verRecetasDieta(dieta: Dieta) {
    try {
      this.cargando = true;
      const recetasSub = this.planesService
        .obtenerRecetasPorTipoDieta(dieta.id)
        .subscribe({
          next: (recetas: Receta[]) => {
            this.recetasDietaSeleccionada = recetas;
            this.mostrarRecetasDieta = true;
            this.cargando = false;
          },
          error: (error: any) => {
            console.error('Error cargando recetas:', error);
            this.mostrarToast('Error al cargar las recetas', 'danger');
            this.cargando = false;
          }
        });
      
      this.subscriptions.push(recetasSub);
    } catch (error: any) {
      console.error('Error:', error);
      this.cargando = false;
    }
  }

  async confirmarSeleccionDieta() {
    if (!this.dietaSeleccionadaModal) return;

    try {
      this.cargando = true;
      
      const caloriasPromedio = Math.round(
        (this.dietaSeleccionadaModal.caloriasRecomendadas.min + 
         this.dietaSeleccionadaModal.caloriasRecomendadas.max) / 2
      );

      await this.planesService.guardarSeleccionDieta(
        this.dietaSeleccionadaModal.id,
        caloriasPromedio,
        this.dietaSeleccionadaModal.duracionRecomendada || '30'
      );

      this.planActual = await this.planesService.obtenerPlanUsuario();
      if (this.planActual?.activo) {
        await this.cargarRecetasDelDia();
      }

      this.mostrarModalDieta = false;
      this.dietaSeleccionadaModal = null;
      
      this.mostrarToast('¡Dieta seleccionada exitosamente!', 'success');

    } catch (error: any) {
      console.error('Error guardando dieta:', error);
      this.mostrarToast('Error al guardar la dieta', 'danger');
    } finally {
      this.cargando = false;
    }
  }

  cancelarSeleccionDieta() {
    this.mostrarModalDieta = false;
    this.dietaSeleccionadaModal = null;
  }

  async cambiarPlan() {
    const alert = await this.alertController.create({
      header: 'Cambiar Plan',
      message: '¿Estás seguro de que quieres cambiar tu plan actual?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cambiar',
          handler: async () => {
            try {
              await this.planesService.desactivarPlan();
              this.planActual = await this.planesService.obtenerPlanUsuario();
              this.recetasDelDia = [];
              this.mostrarToast('Plan cambiado exitosamente', 'success');
            } catch (error: any) {
              console.error('Error cambiando plan:', error);
              this.mostrarToast('Error al cambiar el plan', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async crearEjercicio() {
    if (!this.nuevoEjercicio.nombre.trim()) {
      this.mostrarToast('Por favor ingresa un nombre para el ejercicio', 'warning');
      return;
    }

    try {
      this.cargando = true;
      
      await this.planesService.crearEjercicio({
        nombre: this.nuevoEjercicio.nombre,
        descripcion: this.nuevoEjercicio.descripcion,
        temporizador: this.nuevoEjercicio.temporizador,
        categoria: 'personalizado'
      });

      this.resetFormEjercicio();
      this.mostrarToast('Ejercicio creado exitosamente', 'success');

    } catch (error: any) {
      console.error('Error creando ejercicio:', error);
      this.mostrarToast('Error al crear el ejercicio', 'danger');
    } finally {
      this.cargando = false;
    }
  }

  usarPlantillaEjercicio(plantilla: PlantillaEjercicio) {
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
  }

  editarEjercicio(ejercicio: EjercicioUsuario) {
    this.ejercicioEditando = { ...ejercicio };
    this.nuevoEjercicio = {
      nombre: ejercicio.nombre,
      descripcion: ejercicio.descripcion,
      temporizador: { ...ejercicio.temporizador }
    };
    this.modoEdicion = true;
  }

  async actualizarEjercicio() {
    if (!this.ejercicioEditando?.id || !this.nuevoEjercicio.nombre.trim()) {
      this.mostrarToast('Error al actualizar el ejercicio', 'danger');
      return;
    }

    try {
      this.cargando = true;
      
      await this.planesService.actualizarEjercicio(this.ejercicioEditando.id, {
        nombre: this.nuevoEjercicio.nombre,
        descripcion: this.nuevoEjercicio.descripcion,
        temporizador: this.nuevoEjercicio.temporizador
      });

      this.mostrarToast('Ejercicio actualizado exitosamente', 'success');
      this.cancelarEdicion();

    } catch (error: any) {
      console.error('Error actualizando ejercicio:', error);
      this.mostrarToast('Error al actualizar el ejercicio', 'danger');
    } finally {
      this.cargando = false;
    }
  }

  async eliminarEjercicio(ejercicio: EjercicioUsuario) {
    if (!ejercicio.id) return;

    const alert = await this.alertController.create({
      header: 'Eliminar Ejercicio',
      message: `¿Estás seguro de que quieres eliminar "${ejercicio.nombre}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: async () => {
            try {
              await this.planesService.eliminarEjercicio(ejercicio.id!);
              this.mostrarToast('Ejercicio eliminado', 'success');
            } catch (error: any) {
              console.error('Error eliminando ejercicio:', error);
              this.mostrarToast('Error al eliminar el ejercicio', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  cancelarEdicion() {
    this.modoEdicion = false;
    this.ejercicioEditando = null;
    this.resetFormEjercicio();
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

  async iniciarEjercicio(ejercicio: EjercicioUsuario) {
    if (ejercicio.id) {
      // Navegar a la página del temporizador
      this.router.navigate(['/temporizador-ejercicio'], {
        state: { ejercicio }
      });
    }
  }

  // ✅ MÉTODOS AUXILIARES
  getDietaIcon(dietaId: string | undefined): string {
    if (!dietaId) return '🍽';
    const dieta = this.dietas.find(d => d.id === dietaId);
    return dieta?.icon || '🍽';
  }

  getDietaNombre(dietaId: string | undefined): string {
    if (!dietaId) return 'Dieta no seleccionada';
    const dieta = this.dietas.find(d => d.id === dietaId);
    return dieta?.nombre || dietaId;
  }

  getProgresoClase(): string {
    if (!this.planActual?.progreso?.diasCompletados) return 'neutral';
    const porcentaje = this.getProgresoPorcentaje();
    if (porcentaje >= 75) return 'excelente';
    if (porcentaje >= 50) return 'bueno';
    if (porcentaje >= 25) return 'regular';
    return 'iniciando';
  }

  getProgresoPorcentaje(): number {
    if (!this.planActual?.duracionPlan || !this.planActual.progreso?.diasCompletados) return 0;
    
    const duracion = parseInt(this.planActual.duracionPlan) || 30;
    const diasCompletados = this.planActual.progreso.diasCompletados;
    
    return Math.min((diasCompletados / duracion) * 100, 100);
  }

  getTiempoComida(index: number): string {
    const tiempos = ['Desayuno', 'Almuerzo', 'Cena'];
    return tiempos[index] || 'Comida';
  }

  // ✅ MÉTODO PARA SELECCIONAR COMIDA - NUEVO MÉTODO
  seleccionarComida(receta: Receta, index: number) {
  const tiempoComida = this.getTiempoComida(index);
  
  // Navegar a la página de detalle de receta
  this.router.navigate(['/receta-detalle', receta.id], {
    state: { 
      receta: receta,
      tiempoComida: tiempoComida
    }
  });
}

  // ✅ MÉTODO PARA OBTENER ICONO DE COMIDA - NUEVO MÉTODO
  getComidaIcon(index: number): string {
    const iconos = ['☕', '🍳', '🍲', '🥗'];
    return iconos[index] || '🍽️';
  }

  verPlanCompleto() {
    if (this.planActual?.dietaSeleccionada) {
      this.router.navigate(['/plan-detalle'], {
        state: { dietaId: this.planActual.dietaSeleccionada }
      });
    }
  }

  verReceta(recetaId: string) {
    this.router.navigate(['/receta-detalle', recetaId]);
  }

  // ✅ MOSTRAR TOAST
  private async mostrarToast(mensaje: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }

  // Navegación
  goBack() {
    this.router.navigate(['/home']);
  }

  // Cerrar modales
  cerrarModales() {
    this.mostrarDetallesDieta = false;
    this.dietaDetallada = null;
    this.mostrarRecetasDieta = false;
    this.recetasDietaSeleccionada = [];
  }
}