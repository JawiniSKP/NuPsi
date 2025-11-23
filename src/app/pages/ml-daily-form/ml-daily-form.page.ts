import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel,
  IonInput, IonButton, IonIcon, IonRange, IonCheckbox, IonTextarea,
  IonSpinner, IonChip, IonProgressBar, IonNote, ToastController,
  LoadingController, AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  heartOutline, waterOutline, bedOutline, barbellOutline, restaurantOutline,
  happyOutline, analyticsOutline, checkmarkCircle, arrowForward, timeOutline
} from 'ionicons/icons';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MLClassificationService, DailyMLInput } from '../../services/ml-classification.service';
import { AuthService } from '../../services/auth.service';
import { MenuComponent } from '../../components/menu/menu.component';

@Component({
  selector: 'app-ml-daily-form',
  templateUrl: './ml-daily-form.page.html',
  styleUrls: ['./ml-daily-form.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel,
    IonInput, IonButton, IonIcon, IonRange, IonCheckbox, IonTextarea,
    IonSpinner, IonChip, IonProgressBar, IonNote,
    MenuComponent
  ]
})
export class MlDailyFormPage implements OnInit, OnDestroy {
  dailyForm!: FormGroup;
  loading = false;
  saving = false;
  currentStep = 1;
  totalSteps = 5;
  progress = 0;

  // Modo edición
  modoEdicion = false;
  registroId: string | null = null;
  registroOriginal: DailyMLInput | null = null;

  private mlService = inject(MLClassificationService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastController = inject(ToastController);
  private loadingController = inject(LoadingController);
  private alertController = inject(AlertController);
  private destroy$ = new Subject<void>();

  // Opciones para selección
  emocionesDisponibles = [
    { value: 'feliz', label: 'Feliz', emoji: '😊', selected: false },
    { value: 'tranquilo', label: 'Tranquilo', emoji: '😌', selected: false },
    { value: 'motivado', label: 'Motivado', emoji: '💪', selected: false },
    { value: 'cansado', label: 'Cansado', emoji: '😴', selected: false },
    { value: 'estresado', label: 'Estresado', emoji: '😰', selected: false },
    { value: 'ansioso', label: 'Ansioso', emoji: '😨', selected: false },
    { value: 'triste', label: 'Triste', emoji: '😢', selected: false },
    { value: 'enojado', label: 'Enojado', emoji: '😠', selected: false }
  ];

  estadosAnimo = [
    { value: 'excelente', label: 'Excelente', emoji: '😄' },
    { value: 'bueno', label: 'Bueno', emoji: '😊' },
    { value: 'regular', label: 'Regular', emoji: '😐' },
    { value: 'malo', label: 'Malo', emoji: '😟' },
    { value: 'muy-malo', label: 'Muy Malo', emoji: '😢' }
  ];

  constructor() {
    addIcons({
      heartOutline,
      waterOutline,
      bedOutline,
      barbellOutline,
      restaurantOutline,
      happyOutline,
      analyticsOutline,
      checkmarkCircle,
      arrowForward,
      timeOutline
    });
  }

  async ngOnInit() {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.initForm();

    // Detectar modo edición
    this.route.queryParams.subscribe(async params => {
      if (params['id']) {
        this.modoEdicion = true;
        this.registroId = params['id'];
        if (this.registroId) {
          await this.cargarRegistro(userId, this.registroId);
        }
      }
    });

    this.updateProgress();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm() {
    this.dailyForm = this.fb.group({
      // Paso 1: Estado Emocional
      emociones: [[], Validators.required],
      estadoAnimo: ['', Validators.required],
      nivelEstres: [5, [Validators.required, Validators.min(1), Validators.max(10)]],

      // Paso 2: Sueño
      horasSueno: [0, [Validators.required, Validators.min(0), Validators.max(24)]],
      calidadSueno: [5, [Validators.required, Validators.min(1), Validators.max(10)]],

      // Paso 3: Hábitos
      vasosAgua: [0, [Validators.required, Validators.min(0), Validators.max(20)]],
      actividadFisica: [false],
      tipoActividad: [''],
      duracionActividad: [0, [Validators.min(0)]],

      // Paso 4: Alimentación
      comidas: [0, [Validators.required, Validators.min(0), Validators.max(10)]],
      calidadAlimentacion: [5, [Validators.required, Validators.min(1), Validators.max(10)]],

      // Paso 5: Datos Físicos (Opcional)
      peso: [null, [Validators.min(30), Validators.max(300)]],
      estatura: [null, [Validators.min(100), Validators.max(250)]],

      // Notas
      notas: ['']
    });

    // Calcular IMC automáticamente
    this.dailyForm.get('peso')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.calcularIMC());

    this.dailyForm.get('estatura')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.calcularIMC());
  }

  async cargarRegistro(userId: string, registroId: string) {
    this.loading = true;
    try {
      const registro = await this.mlService.getDailyMLInputById(userId, registroId);
      
      if (!registro) {
        await this.showToast('No se pudo cargar el registro', 'danger');
        this.router.navigate(['/ml-history']);
        return;
      }

      this.registroOriginal = registro;

      // Pre-llenar formulario
      this.dailyForm.patchValue({
        estadoAnimo: registro.estadoAnimo,
        nivelEstres: registro.nivelEstres,
        horasSueno: registro.horasSueno,
        calidadSueno: registro.calidadSueno,
        vasosAgua: registro.vasosAgua,
        actividadFisica: registro.actividadFisica,
        tipoActividad: registro.tipoActividad || '',
        duracionActividad: registro.duracionActividad || 0,
        comidas: registro.comidas,
        calidadAlimentacion: registro.calidadAlimentacion,
        peso: registro.peso || null,
        estatura: registro.estatura || null,
        notas: registro.notas || ''
      });

      // Marcar emociones seleccionadas
      if (registro.emociones && registro.emociones.length > 0) {
        this.emocionesDisponibles.forEach(emocion => {
          emocion.selected = registro.emociones.includes(emocion.value);
        });
        this.dailyForm.patchValue({ emociones: registro.emociones });
      }

      console.log('✅ Registro cargado para edición');
    } catch (error) {
      console.error('Error cargando registro:', error);
      await this.showToast('Error al cargar el registro', 'danger');
    } finally {
      this.loading = false;
    }
  }

  calcularIMC(): number | null {
    const peso = this.dailyForm.get('peso')?.value;
    const estatura = this.dailyForm.get('estatura')?.value;

    if (peso && estatura && estatura > 0) {
      const estaturaMetros = estatura / 100;
      return parseFloat((peso / (estaturaMetros * estaturaMetros)).toFixed(1));
    }
    return null;
  }

  toggleEmocion(emocion: any) {
    emocion.selected = !emocion.selected;
    
    const emocionesSeleccionadas = this.emocionesDisponibles
      .filter(e => e.selected)
      .map(e => e.value);
    
    this.dailyForm.patchValue({ emociones: emocionesSeleccionadas });
  }

  selectEstadoAnimo(estado: any) {
    this.dailyForm.patchValue({ estadoAnimo: estado.value });
  }

  nextStep() {
    if (this.validateCurrentStep()) {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
        this.updateProgress();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      this.showToast('Por favor completa todos los campos requeridos', 'warning');
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateProgress();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.dailyForm.get('emociones')?.valid && 
               this.dailyForm.get('estadoAnimo')?.valid &&
               this.dailyForm.get('nivelEstres')?.valid || false;
      case 2:
        return this.dailyForm.get('horasSueno')?.valid &&
               this.dailyForm.get('calidadSueno')?.valid || false;
      case 3:
        return this.dailyForm.get('vasosAgua')?.valid || false;
      case 4:
        return this.dailyForm.get('comidas')?.valid &&
               this.dailyForm.get('calidadAlimentacion')?.valid || false;
      case 5:
        return true; // Paso opcional
      default:
        return false;
    }
  }

  updateProgress() {
    this.progress = (this.currentStep / this.totalSteps);
  }

  async submitForm() {
    console.log('🚀 submitForm() iniciado');
    
    if (!this.dailyForm.valid) {
      console.warn('⚠️ Formulario inválido');
      await this.showToast('Por favor completa todos los campos obligatorios', 'danger');
      return;
    }

    console.log('✅ Formulario válido, procediendo a guardar...');

    const loading = await this.loadingController.create({
      message: this.modoEdicion ? 'Actualizando datos...' : 'Guardando datos y generando insights IA...',
      spinner: 'crescent'
    });
    await loading.present();

    this.saving = true;

    try {
      const userId = this.authService.getCurrentUserId();
      if (!userId) {
        await loading.dismiss();
        await this.showToast('Error: usuario no autenticado', 'danger');
        return;
      }

      const formValue = this.dailyForm.value;
      console.log('📝 Valores del formulario:', formValue);
      
      const imc = this.calcularIMC();
      console.log('📊 IMC calculado:', imc);

      const dailyInput: Partial<DailyMLInput> = {
        ...formValue,
        imc
      };

      let success: boolean;

      if (this.modoEdicion && this.registroId) {
        console.log('🔄 Modo edición: actualizando registro', this.registroId);
        success = await this.mlService.updateDailyMLInput(userId, this.registroId, dailyInput);
      } else {
        console.log('💾 Modo creación: guardando nuevo registro');
        success = await this.mlService.saveDailyMLInput(dailyInput);
      }

      console.log('📤 Resultado:', success);

      await loading.dismiss();

      if (success) {
        console.log('🎉 Guardado exitoso');
        if (this.modoEdicion) {
          await this.showToast('✅ Registro actualizado exitosamente', 'success');
          this.router.navigate(['/ml-history']);
        } else {
          await this.showSuccessAlert();
        }
      } else {
        console.error('❌ Guardado falló (success = false)');
        await this.showToast('Error al guardar los datos', 'danger');
      }
    } catch (error) {
      console.error('💥 Excepción en submitForm:', error);
      await loading.dismiss();
      await this.showToast('Error al guardar los datos', 'danger');
    } finally {
      this.saving = false;
      console.log('🏁 submitForm() finalizado');
    }
  }

  async showSuccessAlert() {
    const alert = await this.alertController.create({
      header: '¡Datos Guardados! 🎉',
      message: 'Tus datos han sido registrados exitosamente. Los modelos de IA están analizando tu información para generar insights personalizados.',
      buttons: [
        {
          text: 'Ver Insights IA Aura',
          handler: () => {
            this.router.navigate(['/aura-insights']);
          }
        },
        {
          text: 'Ver Bienestar Integral',
          handler: () => {
            this.router.navigate(['/bienestar-integral']);
          }
        },
        {
          text: 'Volver al Inicio',
          role: 'cancel',
          handler: () => {
            this.router.navigate(['/home']);
          }
        }
      ]
    });

    await alert.present();
  }

  async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'top',
      color
    });
    await toast.present();
  }

  getStepTitle(): string {
    switch (this.currentStep) {
      case 1: return 'Estado Emocional';
      case 2: return 'Calidad del Sueño';
      case 3: return 'Hábitos Diarios';
      case 4: return 'Alimentación';
      case 5: return 'Datos Físicos';
      default: return '';
    }
  }

  getStepIcon(): string {
    switch (this.currentStep) {
      case 1: return 'happy-outline';
      case 2: return 'bed-outline';
      case 3: return 'water-outline';
      case 4: return 'restaurant-outline';
      case 5: return 'analytics-outline';
      default: return '';
    }
  }

  get selectedEmotions(): string[] {
    return this.emocionesDisponibles
      .filter(e => e.selected)
      .map(e => e.label);
  }

  get selectedEstadoAnimo(): any {
    const valor = this.dailyForm.get('estadoAnimo')?.value;
    return this.estadosAnimo.find(e => e.value === valor);
  }
}
