// src/app/pages/temporizador-ejercicio/temporizador-ejercicio.page.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';

import { EjerciciosService, EjercicioUsuario } from '../../services/ejercicios.service';

type EstadoTemporizador = 'preparacion' | 'trabajo' | 'descanso' | 'pausado' | 'completado';

@Component({
  selector: 'app-temporizador-ejercicio',
  templateUrl: './temporizador-ejercicio.page.html',
  styleUrls: ['./temporizador-ejercicio.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class TemporizadorEjercicioPage implements OnInit, OnDestroy {
  ejercicio: EjercicioUsuario | null = null;
  ejercicioId: string = '';
  
  // Estados del temporizador
  estado: EstadoTemporizador = 'preparacion';
  tiempoRestante: number = 5; // Cuenta regresiva de preparación
  serieActual: number = 1;
  
  // 🆕 AGREGADO: Variable para el mensaje motivacional
  mensajeMotivacional: string = '';
  
  // Configuración
  tiempoPreparacion: number = 5;
  tiempoTrabajo: number = 30;
  tiempoDescanso: number = 15;
  totalSeries: number = 3;
  
  // Control
  iniciado: boolean = false;
  pausado: boolean = false;
  tiempoTotalTranscurrido: number = 0;
  
  // Subscripciones
  private timerSubscription?: Subscription;
  private subscriptions: Subscription[] = [];

  // Audio (opcional)
  private audioContext?: AudioContext;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ejerciciosService: EjerciciosService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    // Obtener ID del ejercicio desde la URL
    this.ejercicioId = this.route.snapshot.paramMap.get('id') || '';
    
    if (!this.ejercicioId) {
      this.mostrarToast('Error: No se encontró el ejercicio', 'danger');
      this.router.navigate(['/ejercicios']);
      return;
    }

    await this.cargarEjercicio();
    this.configurarAudio();
    
    // 🆕 AGREGADO: Inicializar mensaje motivacional
    this.actualizarMensajeMotivacional();
  }

  ngOnDestroy() {
    this.detenerTemporizador();
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // ==========================================
  // 📊 CARGA DE DATOS
  // ==========================================

  async cargarEjercicio() {
    try {
      this.ejercicio = await this.ejerciciosService.obtenerEjercicioPorId(this.ejercicioId);
      
      if (!this.ejercicio) {
        this.mostrarToast('No se encontró el ejercicio', 'danger');
        this.router.navigate(['/ejercicios']);
        return;
      }

      // Configurar temporizador con los valores del ejercicio
      this.tiempoTrabajo = this.ejercicio.temporizador.trabajo;
      this.tiempoDescanso = this.ejercicio.temporizador.descanso;
      this.totalSeries = this.ejercicio.temporizador.series;
      
      console.log('✅ Ejercicio cargado:', this.ejercicio);
    } catch (error) {
      console.error('❌ Error cargando ejercicio:', error);
      this.mostrarToast('Error al cargar el ejercicio', 'danger');
      this.router.navigate(['/ejercicios']);
    }
  }

  // ==========================================
  // ⏱️ CONTROL DEL TEMPORIZADOR
  // ==========================================

  iniciarTemporizador() {
    if (this.iniciado && !this.pausado) return;

    this.iniciado = true;
    this.pausado = false;
    
    if (this.estado === 'preparacion') {
      this.tiempoRestante = this.tiempoPreparacion;
    }

    // 🆕 AGREGADO: Actualizar mensaje al iniciar
    this.actualizarMensajeMotivacional();

    this.timerSubscription = interval(1000).subscribe(() => {
      this.tick();
    });

    this.reproducirSonido('inicio');
  }

  pausarTemporizador() {
    if (!this.iniciado || this.pausado) return;
    
    this.pausado = true;
    this.estado = 'pausado';
    this.detenerTemporizador();
    this.reproducirSonido('pausa');
  }

  reanudarTemporizador() {
    if (!this.pausado) return;
    
    this.pausado = false;
    
    // Restaurar estado anterior
    if (this.serieActual <= this.totalSeries) {
      if (this.tiempoRestante > 0) {
        this.estado = this.serieActual === 1 && this.tiempoRestante === this.tiempoPreparacion 
          ? 'preparacion' 
          : 'trabajo';
      }
    }
    
    // 🆕 AGREGADO: Actualizar mensaje al reanudar
    this.actualizarMensajeMotivacional();
    
    this.iniciarTemporizador();
  }

  detenerTemporizador() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = undefined;
    }
  }

  async reiniciarTemporizador() {
    const alert = await this.alertController.create({
      header: 'Reiniciar Ejercicio',
      message: '¿Estás seguro de que quieres reiniciar el ejercicio?',
      cssClass: 'custom-alert',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Reiniciar',
          handler: () => {
            this.detenerTemporizador();
            this.resetearEstado();
            this.reproducirSonido('reinicio');
          }
        }
      ]
    });

    await alert.present();
  }

  resetearEstado() {
    this.estado = 'preparacion';
    this.tiempoRestante = this.tiempoPreparacion;
    this.serieActual = 1;
    this.iniciado = false;
    this.pausado = false;
    this.tiempoTotalTranscurrido = 0;
    
    // 🆕 AGREGADO: Resetear mensaje motivacional
    this.actualizarMensajeMotivacional();
  }

  // ==========================================
  // 🔄 LÓGICA DEL TICK
  // ==========================================

  private tick() {
    this.tiempoRestante--;
    this.tiempoTotalTranscurrido++;

    // 🆕 AGREGADO: Actualizar mensaje motivacional cada ciertos segundos
    // Solo actualizar cada 3 segundos para no cambiar tan rápido
    if (this.tiempoRestante % 3 === 0) {
      this.actualizarMensajeMotivacional();
    }

    // Si el tiempo llegó a 0
    if (this.tiempoRestante <= 0) {
      this.cambiarEstado();
    }

    // Sonidos de advertencia (últimos 3 segundos)
    if (this.tiempoRestante <= 3 && this.tiempoRestante > 0) {
      this.reproducirSonido('tick');
    }
  }

  private cambiarEstado() {
    switch (this.estado) {
      case 'preparacion':
        // Pasar a trabajo
        this.estado = 'trabajo';
        this.tiempoRestante = this.tiempoTrabajo;
        this.reproducirSonido('trabajo');
        this.actualizarMensajeMotivacional(); // 🆕 AGREGADO
        break;

      case 'trabajo':
        // Verificar si hay más series
        if (this.serieActual < this.totalSeries) {
          // Pasar a descanso
          this.estado = 'descanso';
          this.tiempoRestante = this.tiempoDescanso;
          this.reproducirSonido('descanso');
          this.actualizarMensajeMotivacional(); // 🆕 AGREGADO
        } else {
          // Ejercicio completado
          this.completarEjercicio();
        }
        break;

      case 'descanso':
        // Siguiente serie
        this.serieActual++;
        this.estado = 'trabajo';
        this.tiempoRestante = this.tiempoTrabajo;
        this.reproducirSonido('trabajo');
        this.actualizarMensajeMotivacional(); // 🆕 AGREGADO
        break;
    }
  }

  private async completarEjercicio() {
    this.estado = 'completado';
    this.detenerTemporizador();
    this.reproducirSonido('completado');
    
    // 🆕 AGREGADO: Limpiar mensaje al completar
    this.mensajeMotivacional = '';

    try {
      // Guardar en Firestore
      await this.ejerciciosService.completarEjercicio(
        this.ejercicioId,
        this.tiempoTotalTranscurrido,
        `Completado ${this.totalSeries} series`
      );

      // Mostrar modal de felicitaciones
      await this.mostrarModalCompletado();
    } catch (error) {
      console.error('❌ Error guardando ejercicio:', error);
      this.mostrarToast('Error al guardar el progreso', 'danger');
    }
  }

  // ==========================================
  // 💪 MENSAJES MOTIVACIONALES
  // ==========================================

  // 🆕 NUEVO MÉTODO: Actualiza el mensaje motivacional
  private actualizarMensajeMotivacional(): void {
    if (this.estado === 'trabajo') {
      const mensajes = [
        '¡Tú puedes!',
        '¡Sigue así!',
        '¡Excelente!',
        '¡No pares!',
        '¡Eres fuerte!'
      ];
      this.mensajeMotivacional = mensajes[Math.floor(Math.random() * mensajes.length)];
    } else if (this.estado === 'descanso') {
      const mensajes = [
        'Respira profundo',
        'Recupérate bien',
        'Descansa un poco',
        'Hidrátate',
        'Relájate'
      ];
      this.mensajeMotivacional = mensajes[Math.floor(Math.random() * mensajes.length)];
    } else if (this.estado === 'preparacion') {
      this.mensajeMotivacional = 'Prepárate para comenzar';
    } else {
      this.mensajeMotivacional = '';
    }
  }

  // ❌ ELIMINADO: getMensajeMotivacional() - Ya no es necesario

  // ==========================================
  // 🎉 MODAL DE COMPLETADO
  // ==========================================

  private async mostrarModalCompletado() {
    const alert = await this.alertController.create({
      header: '🎉 ¡Felicidades!',
      message: `
        <div style="text-align: center; padding: 20px 0;">
          <p style="font-size: 18px; font-weight: 600; color: #2C3E50; margin-bottom: 12px;">
            Has completado el ejercicio "${this.ejercicio?.nombre}"
          </p>
          <p style="font-size: 16px; color: #5A6C7D; margin-bottom: 8px;">
            <strong>${this.totalSeries}</strong> series completadas
          </p>
          <p style="font-size: 16px; color: #5A6C7D;">
            Tiempo total: <strong>${this.formatearTiempo(this.tiempoTotalTranscurrido)}</strong>
          </p>
        </div>
      `,
      cssClass: 'custom-alert-completado',
      buttons: [
        {
          text: 'Ver Ejercicios',
          handler: () => {
            this.router.navigate(['/ejercicios']);
          }
        },
        {
          text: 'Repetir',
          handler: () => {
            this.resetearEstado();
          }
        }
      ]
    });

    await alert.present();
  }

  // ==========================================
  // 🔊 AUDIO
  // ==========================================

  private configurarAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('⚠️ AudioContext no disponible');
    }
  }

  private reproducirSonido(tipo: 'inicio' | 'trabajo' | 'descanso' | 'pausa' | 'tick' | 'completado' | 'reinicio') {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Configurar frecuencias según el tipo
    switch (tipo) {
      case 'inicio':
      case 'trabajo':
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.3;
        break;
      case 'descanso':
        oscillator.frequency.value = 600;
        gainNode.gain.value = 0.3;
        break;
      case 'tick':
        oscillator.frequency.value = 400;
        gainNode.gain.value = 0.2;
        break;
      case 'completado':
        oscillator.frequency.value = 1000;
        gainNode.gain.value = 0.4;
        break;
      case 'pausa':
      case 'reinicio':
        oscillator.frequency.value = 500;
        gainNode.gain.value = 0.25;
        break;
    }

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  // ==========================================
  // 🛠️ MÉTODOS AUXILIARES
  // ==========================================

  formatearTiempo(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  }

  getPorcentajeProgreso(): number {
    const tiempoTotal = (this.tiempoTrabajo + this.tiempoDescanso) * this.totalSeries + this.tiempoPreparacion;
    return Math.min((this.tiempoTotalTranscurrido / tiempoTotal) * 100, 100);
  }

  getColorEstado(): string {
    switch (this.estado) {
      case 'preparacion': return '#FFC107';
      case 'trabajo': return '#F44336';
      case 'descanso': return '#4CAF50';
      case 'pausado': return '#FF9800';
      case 'completado': return '#00C6B2';
      default: return '#00C6B2';
    }
  }

  getIconoEstado(): string {
    switch (this.estado) {
      case 'preparacion': return 'hourglass';
      case 'trabajo': return 'fitness';
      case 'descanso': return 'bed';
      case 'pausado': return 'pause';
      case 'completado': return 'checkmark-circle';
      default: return 'time';
    }
  }

  getTextoEstado(): string {
    switch (this.estado) {
      case 'preparacion': return 'PREPÁRATE';
      case 'trabajo': return 'EJERCICIO';
      case 'descanso': return 'DESCANSO';
      case 'pausado': return 'PAUSADO';
      case 'completado': return 'COMPLETADO';
      default: return '';
    }
  }

  // ==========================================
  // 🎨 UI HELPERS
  // ==========================================

  getCircunferencia(): number {
    return 2 * Math.PI * 140; // Radio de 140
  }

  getOffsetCirculo(): number {
    const circunferencia = this.getCircunferencia();
    let porcentaje = 0;

    if (this.estado === 'preparacion') {
      porcentaje = (this.tiempoRestante / this.tiempoPreparacion) * 100;
    } else if (this.estado === 'trabajo') {
      porcentaje = (this.tiempoRestante / this.tiempoTrabajo) * 100;
    } else if (this.estado === 'descanso') {
      porcentaje = (this.tiempoRestante / this.tiempoDescanso) * 100;
    }

    return circunferencia - (porcentaje / 100) * circunferencia;
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

  // ==========================================
  // 🧭 NAVEGACIÓN
  // ==========================================

  async salir() {
    if (this.iniciado && this.estado !== 'completado') {
      const alert = await this.alertController.create({
        header: 'Salir del Ejercicio',
        message: '¿Estás seguro? El progreso no se guardará.',
        cssClass: 'custom-alert',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Salir',
            role: 'destructive',
            handler: () => {
              this.detenerTemporizador();
              this.router.navigate(['/ejercicios']);
            }
          }
        ]
      });

      await alert.present();
    } else {
      this.router.navigate(['/ejercicios']);
    }
  }
}