// planes.page.ts - VERSIÓN CORREGIDA CON GUARDADO CORRECTO
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { 
  PlanesService, 
  Dieta, 
  PlanUsuario, 
  Receta, 
  ProgresoDieta 
} from '../../services/planes.service';
import { EjerciciosService, EstadisticasEjercicio } from '../../services/ejercicios.service';

@Component({
  selector: 'app-planes',
  templateUrl: './planes.page.html',
  styleUrls: ['./planes.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class PlanesPage implements OnInit, OnDestroy {
  // ==========================================
  // 📊 PROPIEDADES DE ESTADO
  // ==========================================
  seccionActiva: 'nutricion' | 'ejercicio' = 'nutricion';
  planActual: PlanUsuario | null = null;
  progresoDieta: ProgresoDieta | null = null;
  cargando: boolean = true;
  diaYaMarcado: boolean = false;
  
  // ==========================================
  // 🍽️ DATOS DE NUTRICIÓN
  // ==========================================
  dietas: Dieta[] = [];
  recetasDelDia: Receta[] = [];
  
  // ==========================================
  // 💪 DATOS DE EJERCICIOS
  // ==========================================
  estadisticasEjercicios: EstadisticasEjercicio | null = null;
  
  // ==========================================
  // 🎪 ESTADOS DE MODALES
  // ==========================================
  mostrarModalDieta: boolean = false;
  dietaSeleccionadaModal: Dieta | null = null;
  mostrarDetallesDieta: boolean = false;
  dietaDetallada: Dieta | null = null;
  mostrarRecetasDieta: boolean = false;
  recetasDietaSeleccionada: Receta[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private planesService: PlanesService,
    private ejerciciosService: EjerciciosService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  // ==========================================
  // 🎬 LIFECYCLE HOOKS
  // ==========================================

  async ngOnInit() {
    await this.cargarDatosIniciales();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // ==========================================
  // 📥 CARGA DE DATOS
  // ==========================================

  async cargarDatosIniciales() {
    try {
      this.cargando = true;
      
      // Cargar dietas desde Firestore
      const dietasSub = this.planesService.obtenerDietas().subscribe({
        next: (dietas) => {
          this.dietas = dietas;
          console.log('✅ Dietas cargadas:', dietas.length);
        },
        error: (error: any) => {
          console.error('❌ Error cargando dietas:', error);
          this.mostrarToast('Error al cargar las dietas', 'danger');
        }
      });
      
      // Cargar plan actual
      this.planActual = await this.planesService.obtenerPlanUsuario();
      console.log('📊 Plan actual cargado:', this.planActual);
      
      // Si tiene plan activo, calcular progreso y cargar recetas
      if (this.planActual?.activo) {
        await this.actualizarProgreso();
        await this.cargarRecetasDelDia();
        this.verificarDiaMarcado();
      }

      // Cargar estadísticas de ejercicios
      await this.cargarEstadisticasEjercicios();
      
      this.subscriptions.push(dietasSub);
      
    } catch (error: any) {
      console.error('❌ Error cargando datos:', error);
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
            // Obtener 3 recetas aleatorias para el día
            this.recetasDelDia = this.obtenerRecetasAleatorias(recetas, 3);
            console.log('✅ Recetas del día cargadas:', this.recetasDelDia.length);
          },
          error: (error: any) => {
            console.error('❌ Error cargando recetas:', error);
          }
        });
      
      this.subscriptions.push(recetasSub);
    } catch (error: any) {
      console.error('❌ Error cargando recetas:', error);
    }
  }

  async cargarEstadisticasEjercicios() {
    try {
      this.estadisticasEjercicios = await this.ejerciciosService.obtenerEstadisticas();
      console.log('✅ Estadísticas de ejercicios cargadas:', this.estadisticasEjercicios);
    } catch (error: any) {
      console.error('❌ Error cargando estadísticas de ejercicios:', error);
    }
  }

  private obtenerRecetasAleatorias(recetas: Receta[], cantidad: number): Receta[] {
    const recetasBarajadas = [...recetas].sort(() => Math.random() - 0.5);
    return recetasBarajadas.slice(0, cantidad);
  }

  // ==========================================
  // 📊 SISTEMA DE PROGRESO DE DIETAS
  // ==========================================

  async actualizarProgreso() {
    try {
      this.progresoDieta = await this.planesService.calcularProgresoDieta();
      
      if (this.progresoDieta) {
        console.log('✅ Progreso de dieta calculado:', this.progresoDieta);
        
        // Mostrar alertas si existen
        if (this.progresoDieta.alertasTiempo && this.progresoDieta.alertasTiempo.length > 0) {
          const alertasNoLeidas = this.progresoDieta.alertasTiempo.filter(a => !a.leida);
          if (alertasNoLeidas.length > 0) {
            this.mostrarAlertasProgreso(alertasNoLeidas);
          }
        }
      }
    } catch (error: any) {
      console.error('❌ Error actualizando progreso:', error);
    }
  }

  private async mostrarAlertasProgreso(alertas: any[]) {
    // Mostrar solo la primera alerta no leída
    const alerta = alertas[0];
    
    const alert = await this.alertController.create({
      header: alerta.tipo === 'danger' ? '⚠️ Atención' : alerta.tipo === 'warning' ? '⏰ Aviso' : '📢 Información',
      message: alerta.mensaje,
      cssClass: 'custom-alert',
      buttons: ['Entendido']
    });

    await alert.present();
  }

  verificarDiaMarcado() {
    if (!this.progresoDieta?.historialDiario) {
      this.diaYaMarcado = false;
      return;
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    this.diaYaMarcado = this.progresoDieta.historialDiario.some(h => {
      const fecha = h.fecha instanceof Date ? h.fecha : (h.fecha as any).toDate();
      fecha.setHours(0, 0, 0, 0);
      return fecha.getTime() === hoy.getTime() && h.completado;
    });
  }

  async marcarDiaCompletado() {
    if (this.diaYaMarcado) {
      this.mostrarToast('El día de hoy ya está marcado como completado', 'warning');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Marcar Día Completado',
      message: '¿Seguiste tu plan alimenticio hoy?',
      cssClass: 'custom-alert',
      inputs: [
        {
          name: 'calorias',
          type: 'number',
          placeholder: 'Calorías consumidas (opcional)',
          min: 0,
          max: 10000
        },
        {
          name: 'notas',
          type: 'textarea',
          placeholder: 'Notas adicionales (opcional)'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Marcar como Completado',
          handler: async (data) => {
            try {
              this.cargando = true;
              
              const calorias = data.calorias ? parseInt(data.calorias) : undefined;
              const notas = data.notas || undefined;
              
              await this.planesService.marcarDiaCompletado(calorias, notas);
              
              // Actualizar progreso
              await this.actualizarProgreso();
              this.verificarDiaMarcado();
              
              this.mostrarToast('¡Día marcado como completado! 🎉', 'success');
            } catch (error: any) {
              console.error('❌ Error marcando día:', error);
              this.mostrarToast('Error al marcar el día', 'danger');
            } finally {
              this.cargando = false;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // ==========================================
  // 🔄 CAMBIO DE SECCIÓN
  // ==========================================

  cambiarSeccion(event: any) {
    const seccion = event.detail.value;
    
    if (seccion === 'nutricion' || seccion === 'ejercicio') {
      this.seccionActiva = seccion;
      console.log('📍 Sección cambiada a:', seccion);
    }
  }

  // ==========================================
  // 🍽️ GESTIÓN DE DIETAS - CORREGIDO
  // ==========================================

  seleccionarDieta(dieta: Dieta) {
    this.dietaSeleccionadaModal = dieta;
    this.mostrarModalDieta = true;
  }

  async confirmarSeleccionDieta() {
    if (!this.dietaSeleccionadaModal) return;

    try {
      this.cargando = true;
      
      const caloriasPromedio = Math.round(
        (this.dietaSeleccionadaModal.caloriasRecomendadas.min + 
         this.dietaSeleccionadaModal.caloriasRecomendadas.max) / 2
      );

      // Extraer duración en días
      const duracionStr = this.dietaSeleccionadaModal.duracionRecomendada || '30 días';
      const duracion = this.extraerDuracionDias(duracionStr);

      console.log('💾 Guardando dieta:', {
        dietaId: this.dietaSeleccionadaModal.id,
        calorias: caloriasPromedio,
        duracion: duracion
      });

      // ✅ CORREGIDO: Usar el método del servicio que guarda correctamente
      await this.planesService.guardarSeleccionDieta(
        this.dietaSeleccionadaModal.id,
        caloriasPromedio,
        duracion.toString()
      );

      // Recargar plan actual y calcular progreso
      this.planActual = await this.planesService.obtenerPlanUsuario();
      console.log('🔄 Plan actual recargado:', this.planActual);
      
      if (this.planActual?.activo) {
        await this.actualizarProgreso();
        await this.cargarRecetasDelDia();
        this.verificarDiaMarcado();
      }

      this.mostrarModalDieta = false;
      this.dietaSeleccionadaModal = null;
      
      this.mostrarToast('¡Dieta seleccionada exitosamente! 🎉', 'success');

    } catch (error: any) {
      console.error('❌ Error guardando dieta:', error);
      this.mostrarToast('Error al guardar la dieta: ' + error.message, 'danger');
    } finally {
      this.cargando = false;
    }
  }

  private extraerDuracionDias(duracionStr: string): number {
    if (duracionStr.includes('semanas')) {
      const match = duracionStr.match(/(\d+)-(\d+)/);
      if (match) {
        const min = parseInt(match[1]);
        const max = parseInt(match[2]);
        const promedio = Math.round((min + max) / 2);
        return promedio * 7;
      }
      return 30;
    } else if (duracionStr.includes('días')) {
      const match = duracionStr.match(/(\d+)/);
      return match ? parseInt(match[1]) : 30;
    }
    return 30;
  }

  cancelarSeleccionDieta() {
    this.mostrarModalDieta = false;
    this.dietaSeleccionadaModal = null;
  }

  async cambiarPlan() {
    const alert = await this.alertController.create({
      header: 'Cambiar Plan',
      message: '¿Estás seguro de que quieres cambiar tu plan actual? Se perderá tu progreso.',
      cssClass: 'custom-alert',
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
              this.progresoDieta = null;
              this.recetasDelDia = [];
              this.diaYaMarcado = false;
              this.mostrarToast('Plan desactivado. Selecciona una nueva dieta.', 'success');
            } catch (error: any) {
              console.error('❌ Error cambiando plan:', error);
              this.mostrarToast('Error al cambiar el plan', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  verDetallesDieta(dieta: Dieta) {
    this.dietaDetallada = dieta;
    this.mostrarDetallesDieta = true;
  }

  async verRecetasDieta(dieta: Dieta) {
    try {
      this.cargando = true;
      this.dietaDetallada = dieta;
      
      const recetasSub = this.planesService
        .obtenerRecetasPorTipoDieta(dieta.id)
        .subscribe({
          next: (recetas: Receta[]) => {
            this.recetasDietaSeleccionada = recetas;
            this.mostrarRecetasDieta = true;
            this.cargando = false;
          },
          error: (error: any) => {
            console.error('❌ Error cargando recetas:', error);
            this.mostrarToast('Error al cargar las recetas', 'danger');
            this.cargando = false;
          }
        });
      
      this.subscriptions.push(recetasSub);
    } catch (error: any) {
      console.error('❌ Error:', error);
      this.cargando = false;
    }
  }

  verRecetasDietaSiExiste() {
    const dietaActual = this.getDietaActual();
    if (dietaActual) {
      this.verRecetasDieta(dietaActual);
    } else {
      this.mostrarToast('No se pudo encontrar la dieta actual', 'warning');
    }
  }

  // ==========================================
  // 🍳 GESTIÓN DE RECETAS
  // ==========================================

  seleccionarComida(receta: Receta, index: number) {
    const tiempoComida = this.getTiempoComida(index);
    
    this.router.navigate(['/receta-detalle', receta.id], {
      state: { 
        receta: receta,
        tiempoComida: tiempoComida
      }
    });
  }

  verReceta(recetaId: string) {
    this.router.navigate(['/receta-detalle', recetaId]);
  }

  // ==========================================
  // 💪 NAVEGACIÓN A EJERCICIOS
  // ==========================================

  irAEjercicios() {
    this.router.navigate(['/ejercicios']);
  }

  // ==========================================
  // 🛠️ MÉTODOS AUXILIARES
  // ==========================================

  getDietaActual(): Dieta | undefined {
    if (!this.planActual?.dietaSeleccionada) return undefined;
    return this.dietas.find(d => d.id === this.planActual?.dietaSeleccionada);
  }

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
    if (!this.progresoDieta) return 'neutral';
    
    if (this.progresoDieta.estaVencida) return 'danger';
    if (this.progresoDieta.excedeTiempoRecomendado) return 'warning';
    
    const porcentaje = this.progresoDieta.porcentajeCompletado || 0;
    if (porcentaje >= 75) return 'excelente';
    if (porcentaje >= 50) return 'bueno';
    if (porcentaje >= 25) return 'regular';
    return 'iniciando';
  }

  getProgresoPorcentaje(): number {
    return this.progresoDieta?.porcentajeCompletado || 0;
  }

  formatearFecha(fecha: Date | undefined): string {
    if (!fecha) return 'N/A';
    
    const fechaObj = fecha instanceof Date ? fecha : (fecha as any).toDate();
    
    return fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getTiempoComida(index: number): string {
    const tiempos = ['Desayuno', 'Almuerzo', 'Cena'];
    return tiempos[index] || 'Comida';
  }

  getComidaIcon(index: number): string {
    const iconos = ['☕', '🍳', '🍲'];
    return iconos[index] || '🍽️';
  }

  // ==========================================
  // 🧭 NAVEGACIÓN
  // ==========================================

  verPlanCompleto() {
    if (this.planActual?.dietaSeleccionada) {
      this.mostrarToast('Función de planificación completa en desarrollo', 'warning');
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  cerrarModales() {
    this.mostrarDetallesDieta = false;
    this.dietaDetallada = null;
    this.mostrarRecetasDieta = false;
    this.recetasDietaSeleccionada = [];
  }

  tieneAlimentosEvitar(receta: Receta): boolean {
    // Esta lógica verificaría si la receta tiene ingredientes que el usuario evita
    // Necesitarías cargar los alimentosEvitar del usuario en este componente también
    return false; // Implementar lógica similar a receta-detalle
  }

  // ==========================================
  // 💬 TOAST
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
}