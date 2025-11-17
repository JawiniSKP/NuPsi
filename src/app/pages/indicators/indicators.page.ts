import { Component, OnInit, inject, OnDestroy } from '@angular/core';
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
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
export class IndicatorsPage implements OnInit, OnDestroy {
  indicatorForm: FormGroup;
  
  userIndicators: Indicador[] = [];
  loading = false;
  esConfiguracionInicial = false;
  
  currentUserId: string = '';
  ultimosValores: UltimosValoresFisicos = {};
  errorMessage = '';

  // Estados
  submitted = false;
  guardando = false;

  private homeService = inject(HomeService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);

  private destroy$ = new Subject<void>();

  constructor() {
    this.indicatorForm = this.fb.group({
      peso: ['', [Validators.required, Validators.min(30), Validators.max(300)]],
      estatura: ['', [Validators.required, Validators.min(100), Validators.max(250)]],
      estadoAnimo: ['', Validators.required],
      emociones: [[], Validators.required],
      notas: ['']
    });

    addIcons({
      alertCircle, trendingUp, scale, heart, happy, water, 
      create, checkmarkCircle, resize, document,
      trendingUpOutline, scaleOutline, heartOutline, happyOutline, 
      waterOutline, createOutline, resizeOutline, documentOutline
    });
  }

  async ngOnInit() {
    // Verificar autenticación
    this.currentUserId = this.authService.getCurrentUserId();
    if (!this.currentUserId) {
      console.error('❌ No hay usuario autenticado');
      this.router.navigate(['/login']);
      return;
    }

    // Detectar modo
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.esConfiguracionInicial = params['setupInicial'] === 'true';
        console.log('📋 Modo:', this.esConfiguracionInicial ? 'Configuración Inicial' : 'Registro Diario');
        
        // ✅ CRÍTICO: Si NO es configuración inicial, verificar si ya está configurado
        if (!this.esConfiguracionInicial) {
          this.verificarConfiguracionCompletada();
        }
      });

    // Cargar datos
    await this.cargarDatosIniciales();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ✅ NUEVO: Verificar si ya completó configuración
  private async verificarConfiguracionCompletada() {
    try {
      const necesitaConfig = await this.homeService.necesitaConfiguracionInicial();
      
      if (!necesitaConfig) {
        console.log('✅ Usuario ya completó configuración, cargando historial...');
        await this.loadUserIndicators();
      } else {
        console.log('🔄 Usuario necesita configuración, redirigiendo a modo configuración...');
        this.router.navigate(['/indicators'], {
          queryParams: { setupInicial: 'true' },
          replaceUrl: true
        });
        return;
      }
    } catch (error) {
      console.error('❌ Error verificando configuración:', error);
    }
  }

  // ✅ CORREGIDO: Cargar datos iniciales
  private async cargarDatosIniciales() {
    this.loading = true;
    
    try {
      // Cargar últimos valores físicos
      await this.cargarUltimosValoresFisicos();
      
      // Solo cargar historial si NO es configuración inicial
      if (!this.esConfiguracionInicial) {
        await this.loadUserIndicators();
      }
      
    } catch (error) {
      console.error('❌ Error cargando datos iniciales:', error);
      this.errorMessage = 'Error al cargar los datos';
    } finally {
      this.loading = false;
    }
  }

  // ✅ CORREGIDO: Cargar últimos valores físicos
  async cargarUltimosValoresFisicos() {
    try {
      this.ultimosValores = await this.homeService.obtenerUltimosValoresFisicos();

      if (this.ultimosValores.peso && this.ultimosValores.estatura) {
        this.indicatorForm.patchValue({
          peso: this.ultimosValores.peso,
          estatura: this.ultimosValores.estatura
        });

        console.log('✅ Últimos valores cargados:', this.ultimosValores);
      }
    } catch (error) {
      console.error('❌ Error cargando últimos valores:', error);
    }
  }

  // ✅ CORREGIDO: Cargar historial
  async loadUserIndicators() {
    this.loading = true;
    
    this.homeService.getHistorialIndicadores(30)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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

  // ✅ CORREGIDO: Guardar indicador
  async submitIndicator() {
    this.submitted = true;
    this.errorMessage = '';

    if (!this.indicatorForm.valid) {
      Object.keys(this.indicatorForm.controls).forEach(key => {
        this.indicatorForm.get(key)?.markAsTouched();
      });
      
      this.errorMessage = 'Por favor completa todos los campos requeridos';
      this.showToast(this.errorMessage, 'warning');
      return;
    }

    this.guardando = true;

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
        notas: formData.notas || '',
        esConfiguracionInicial: this.esConfiguracionInicial,
        fecha: Timestamp.fromDate(new Date()),
        creadoEn: Timestamp.now()
      };

      console.log('💾 Guardando indicador:', indicadorData);

      this.homeService.guardarIndicadorCompleto(indicadorData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: async (success) => {
            await loading.dismiss();
            this.guardando = false;

            if (success) {
              // 🎯 SI ES CONFIGURACIÓN INICIAL → Marcar como completada y redirigir
              if (this.esConfiguracionInicial) {
                await this.completarConfiguracionInicial();
              } else {
                // Si es registro diario → Mostrar éxito y limpiar formulario
                await this.showToast('¡Indicador guardado correctamente! 🎉', 'success');
                this.limpiarFormularioParaNuevoRegistro();
                await this.loadUserIndicators();
              }
            } else {
              throw new Error('No se pudo guardar el indicador');
            }
          },
          error: async (error) => {
            await loading.dismiss();
            this.guardando = false;
            console.error('❌ Error guardando:', error);
            this.errorMessage = 'No se pudo guardar el indicador';
            this.showToast(this.errorMessage, 'danger');
          }
        });

    } catch (error: any) {
      await loading.dismiss();
      this.guardando = false;
      console.error('❌ Error inesperado:', error);
      this.errorMessage = 'Error al guardar. Intenta nuevamente';
      this.showToast(this.errorMessage, 'danger');
    }
  }

  // ✅ CORREGIDO: Completar configuración inicial
  private async completarConfiguracionInicial() {
    console.log('🎉 Completando configuración inicial...');

    const loading = await this.loadingController.create({
      message: 'Finalizando configuración...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      this.homeService.marcarConfiguracionInicialCompleta()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: async (success) => {
            await loading.dismiss();
            
            if (success) {
              console.log('✅ Configuración marcada correctamente');
              await this.showToast('¡Perfil configurado exitosamente! 🎉', 'success');
              
              // Esperar y redirigir al home
              setTimeout(() => {
                this.router.navigate(['/home'], { replaceUrl: true });
              }, 1500);
            } else {
              throw new Error('No se pudo marcar como completada');
            }
          },
          error: async (error) => {
            await loading.dismiss();
            console.error('❌ Error marcando configuración:', error);
            await this.showToast('Error al finalizar configuración', 'danger');
          }
        });

    } catch (error: any) {
      await loading.dismiss();
      console.error('❌ Error inesperado:', error);
      await this.showToast('Error al finalizar configuración', 'danger');
    }
  }

  // ✅ NUEVO: Limpiar formulario para nuevo registro
  private limpiarFormularioParaNuevoRegistro() {
    // Mantener peso y estatura, limpiar el resto
    const { peso, estatura } = this.indicatorForm.value;
    
    this.indicatorForm.reset({
      peso: peso,
      estatura: estatura
    });
    
    this.submitted = false;
  }

  // ============================================
  // ✅ MÉTODOS DE CÁLCULO Y UTILIDADES
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

  getMoodEmoji(estadoAnimo: string): string {
    const moodEmojis: { [key: string]: string } = {
      'excelente': '😊', 'bueno': '🙂', 'regular': '😐',
      'malo': '😔', 'muy-malo': '😢'
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
  // ✅ MANEJO DE EMOCIONES
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
    this.indicatorForm.get('emociones')?.markAsDirty();
  }

  isEmocionSelected(emocion: string): boolean {
    const emociones = this.indicatorForm.get('emociones')?.value || [];
    return emociones.includes(emocion);
  }

  // ============================================
  // ✅ UTILIDADES DE UI
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

  // ✅ NUEVO: Volver atrás inteligente
  async goBack() {
    if (this.esConfiguracionInicial) {
      const alert = await this.toastController.create({
        header: '¿Estás seguro?',
        message: 'Si cancelas ahora, deberás completar la configuración para usar la aplicación.',
        buttons: [
          {
            text: 'Continuar',
            role: 'cancel'
          },
          {
            text: 'Cancelar',
            handler: () => {
              this.router.navigate(['/login']);
            }
          }
        ]
      });
      await alert.present();
    } else {
      this.router.navigate(['/home']);
    }
  }
}