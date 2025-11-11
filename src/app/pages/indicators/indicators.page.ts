import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonSelect,
  IonSelectOption, IonButton, IonTextarea, IonNote, IonSpinner,
  IonButtons, IonBackButton, IonChip, IonIcon
} from '@ionic/angular/standalone';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { HomeService, Indicador, UltimosValoresFisicos } from '../../services/home.service';
import { Timestamp } from '@angular/fire/firestore';
import { addIcons } from 'ionicons';
import { 
  checkmarkCircle, alertCircle, water, scale, resize,
  happy, heart, trendingUp, create, document,
  waterOutline, scaleOutline, resizeOutline, happyOutline, 
  heartOutline, trendingUpOutline, createOutline, documentOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-indicators',
  templateUrl: './indicators.page.html',
  styleUrls: ['./indicators.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonSelect,
    IonSelectOption, IonButton, IonTextarea, IonNote, IonSpinner,
    IonButtons, IonBackButton, IonChip, IonIcon
  ]
})
export class IndicatorsPage implements OnInit {
  indicatorForm: FormGroup;
  
  // ✅ CORREGIDO: Usando propiedades normales en lugar de signals para compatibilidad con template
  userIndicators: Indicador[] = [];
  loading = false;
  esConfiguracionInicial = false;
  
  currentUserId: string = '';
  ultimosValores: UltimosValoresFisicos = {};
  errorMessage = '';

  // ✅ CORRECTO: Inyección de dependencias
  private homeService = inject(HomeService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);

  constructor() {
    // ✅ CORREGIDO: Formulario SIN vasos de agua
    this.indicatorForm = this.fb.group({
      peso: ['', [Validators.required, Validators.min(30), Validators.max(300)]],
      estatura: ['', [Validators.required, Validators.min(100), Validators.max(250)]],
      estadoAnimo: ['', Validators.required],
      emociones: [[], Validators.required],
      notas: ['']
      // ❌ ELIMINADO: vasosAgua - Ahora solo en home
    });

    // ✅ CORREGIDO: Iconos correctamente importados
    addIcons({
      alertCircle, trendingUp, scale, heart, happy, water, 
      create, checkmarkCircle, resize, document,
      trendingUpOutline, scaleOutline, heartOutline, happyOutline, 
      waterOutline, createOutline, resizeOutline, documentOutline
    });
  }

  async ngOnInit() {
    // 🎯 Detectar si es configuración inicial desde URL
    this.route.queryParams.subscribe(params => {
      this.esConfiguracionInicial = params['setupInicial'] === 'true';
      console.log('📋 Modo:', this.esConfiguracionInicial ? 'Configuración Inicial' : 'Registro Diario');
    });

    this.currentUserId = this.authService.getCurrentUserId();

    if (!this.currentUserId) {
      console.error('❌ No hay usuario autenticado');
      this.router.navigate(['/login']);
      return;
    }

    // Cargar últimos valores físicos SIEMPRE
    await this.cargarUltimosValoresFisicos();

    // Cargar historial solo si NO es configuración inicial
    if (!this.esConfiguracionInicial) {
      await this.loadUserIndicators();
    }
  }

  // ============================================
  // 🎯 CARGAR ÚLTIMOS VALORES FÍSICOS
  // ============================================
  async cargarUltimosValoresFisicos() {
    try {
      this.ultimosValores = await this.homeService.obtenerUltimosValoresFisicos(this.currentUserId);

      if (this.ultimosValores.peso && this.ultimosValores.estatura) {
        // Pre-llenar el formulario con los últimos valores
        this.indicatorForm.patchValue({
          peso: this.ultimosValores.peso,
          estatura: this.ultimosValores.estatura
        });

        console.log('✅ Últimos valores cargados en formulario:', this.ultimosValores);
      } else {
        console.log('ℹ️ No hay valores físicos previos, campos vacíos');
      }
    } catch (error) {
      console.error('❌ Error cargando últimos valores:', error);
    }
  }

  // ============================================
  // ✅ CORREGIDO: CARGAR HISTORIAL
  // ============================================
  async loadUserIndicators() {
    this.loading = true;
    
    this.homeService.getHistorialIndicadores(this.currentUserId, 30).subscribe({
      next: (indicadores) => {
        this.userIndicators = indicadores;
        console.log('✅ Indicadores cargados:', indicadores.length);
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error cargando indicadores:', error);
        this.loading = false;
      }
    });
  }

  // ============================================
  // ✅ CORREGIDO: GUARDAR INDICADOR (SIN VASOS DE AGUA)
  // ============================================
  async submitIndicator() {
    this.errorMessage = '';

    if (!this.indicatorForm.valid) {
      Object.keys(this.indicatorForm.controls).forEach(key => {
        this.indicatorForm.get(key)?.markAsTouched();
      });
      
      this.errorMessage = 'Por favor completa todos los campos requeridos';
      this.showToast(this.errorMessage, 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: this.esConfiguracionInicial 
        ? 'Guardando tu configuración...' 
        : 'Guardando indicador...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const formData = this.indicatorForm.value;
      const imc = this.calculateBMI(Number(formData.peso), Number(formData.estatura));

      const indicadorData: Partial<Indicador> = {
        peso: Number(formData.peso),
        estatura: Number(formData.estatura),
        imc: imc,
        estadoAnimo: formData.estadoAnimo,
        emociones: formData.emociones || [],
        // ❌ ELIMINADO: vasosAgua - Ahora solo en home
        notas: formData.notas || '',
        esConfiguracionInicial: this.esConfiguracionInicial,
        fecha: Timestamp.fromDate(new Date()),
        creadoEn: Timestamp.now()
      };

      console.log('💾 Guardando indicador:', indicadorData);

      this.homeService.guardarIndicadorCompleto(this.currentUserId, indicadorData).subscribe({
        next: async (success) => {
          if (success) {
            await loading.dismiss();

            // 🎯 SI ES CONFIGURACIÓN INICIAL → Marcar como completada
            if (this.esConfiguracionInicial) {
              await this.completarConfiguracionInicial();
            } else {
              // Si es registro diario → Mantener peso/estatura, limpiar resto
              await this.showToast('¡Indicador guardado correctamente! 🎉', 'success');
              
              this.indicatorForm.patchValue({
                estadoAnimo: '',
                emociones: [],
                notas: ''
                // ❌ ELIMINADO: vasosAgua
              });
              
              await this.loadUserIndicators();
            }
          } else {
            throw new Error('No se pudo guardar');
          }
        },
        error: async (error) => {
          console.error('❌ Error:', error);
          await loading.dismiss();
          this.errorMessage = 'No se pudo guardar el indicador';
          this.showToast(this.errorMessage, 'danger');
        }
      });

    } catch (error: any) {
      console.error('❌ Error guardando:', error);
      await loading.dismiss();
      this.errorMessage = 'Error al guardar. Intenta nuevamente';
      this.showToast(this.errorMessage, 'danger');
    }
  }

  // ============================================
  // 🎯 COMPLETAR CONFIGURACIÓN INICIAL - CORREGIDO
  // ============================================
  private async completarConfiguracionInicial() {
    console.log('🎉 Completando configuración inicial...');

    const loading = await this.loadingController.create({
      message: 'Finalizando configuración...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      this.homeService.marcarConfiguracionInicialCompleta(this.currentUserId).subscribe({
        next: async (success) => {
          console.log('📡 Respuesta de marcarConfiguracion:', success);
          
          await loading.dismiss();

          if (success) {
            console.log('✅ Configuración marcada correctamente');
            await this.showToast('¡Perfil configurado exitosamente! 🎉', 'success');
            
            // Esperar 2 segundos antes de redirigir
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            console.log('🚀 Navegando al home...');
            
            // Navegar con replaceUrl para limpiar historial
            await this.router.navigate(['/home'], { replaceUrl: true });
            
            console.log('✅ Navegación completada');
          } else {
            throw new Error('No se pudo marcar como completada');
          }
        },
        error: async (error) => {
          await loading.dismiss();
          console.error('❌ Error marcando configuración:', error);
          await this.handleConfiguracionError(error);
        }
      });

    } catch (error: any) {
      await loading.dismiss();
      console.error('❌ Error inesperado:', error);
      await this.handleConfiguracionError(error);
    }
  }

  // ============================================
  // 🛠️ MANEJO DE ERRORES DE CONFIGURACIÓN
  // ============================================
  private async handleConfiguracionError(error: any) {
    // Mostrar mensaje específico según el error
    if (error?.message?.includes('ERR_BLOCKED_BY_CLIENT') || 
        error?.message?.includes('blocked') ||
        error?.code === 'unavailable') {
      await this.showToast(
        '⚠️ Tu navegador está bloqueando la conexión. Desactiva extensiones de privacidad (AdBlock/Brave Shields) e intenta nuevamente.',
        'warning'
      );
    } else if (error?.code === 'permission-denied') {
      await this.showToast(
        '❌ Error de permisos. Cierra sesión e inicia nuevamente.',
        'danger'
      );
    } else {
      await this.showToast(
        '❌ Error al finalizar configuración. Verifica tu conexión a internet.',
        'danger'
      );
    }
    
    console.log('⚠️ No se redirige al home debido al error');
  }

  // ============================================
  // CALCULAR IMC
  // ============================================
  calculateBMI(peso: number, estatura: number): number {
    const estaturaEnMetros = estatura / 100;
    const imc = peso / (estaturaEnMetros * estaturaEnMetros);
    return Number(imc.toFixed(1));
  }

  getBMICategory(imc: number): string {
    if (imc < 18.5) return 'Bajo peso';
    if (imc < 25) return 'Peso normal';
    if (imc < 30) return 'Sobrepeso';
    return 'Obesidad';
  }

  getBMIColor(imc: number): string {
    if (imc < 18.5) return 'warning';
    if (imc < 25) return 'success';
    if (imc < 30) return 'warning';
    return 'danger';
  }

  // ============================================
  // EMOJIS Y FORMATOS
  // ============================================
  getMoodEmoji(estadoAnimo: string): string {
    const moodEmojis: { [key: string]: string } = {
      'excelente': '😊',
      'bueno': '🙂',
      'regular': '😐',
      'malo': '😔',
      'muy-malo': '😢'
    };
    return moodEmojis[estadoAnimo] || '❓';
  }

  formatDate(timestamp: any): string {
    let date: Date;
    
    if (timestamp?.toDate) {
      date = timestamp.toDate();
    } else if (timestamp?.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  // ============================================
  // EMOCIONES
  // ============================================
  emocionesDisponibles = [
    { value: 'feliz', label: 'Feliz', emoji: '😊' },
    { value: 'tranquilo', label: 'Tranquilo', emoji: '😌' },
    { value: 'motivado', label: 'Motivado', emoji: '💪' },
    { value: 'cansado', label: 'Cansado', emoji: '😴' },
    { value: 'estresado', label: 'Estresado', emoji: '😰' },
    { value: 'ansioso', label: 'Ansioso', emoji: '😨' },
    { value: 'triste', label: 'Triste', emoji: '😢' },
    { value: 'enojado', label: 'Enojado', emoji: '😠' }
  ];

  toggleEmocion(emocion: string) {
    const emociones = this.indicatorForm.get('emociones')?.value || [];
    const index = emociones.indexOf(emocion);
    
    if (index > -1) {
      emociones.splice(index, 1);
    } else {
      emociones.push(emocion);
    }
    
    this.indicatorForm.patchValue({ emociones });
  }

  isEmocionSelected(emocion: string): boolean {
    const emociones = this.indicatorForm.get('emociones')?.value || [];
    return emociones.includes(emocion);
  }

  // ============================================
  // UTILIDADES
  // ============================================
  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: color,
      cssClass: 'custom-toast',
      buttons: [{ icon: 'close', role: 'cancel' }]
    });
    await toast.present();
  }

  clearError() {
    this.errorMessage = '';
  }

  get formControls() {
    return this.indicatorForm.controls;
  }
}