import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonTextarea,
  IonList,
  IonNote,
  IonLoading
} from '@ionic/angular/standalone';

// ✅ IMPORTAR CORRECTAMENTE
import { IndicatorsService, Indicator } from '../../services/indicators.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-indicators',
  templateUrl: './indicators.page.html',
  styleUrls: ['./indicators.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    ReactiveFormsModule,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonTextarea,
    IonList,
    IonNote,
    IonLoading
  ]
})
export class IndicatorsPage implements OnInit {
  indicatorForm: FormGroup;
  userIndicators: Indicator[] = []; // ✅ Ahora Indicator está definido
  loading = false;

  private indicatorsService = inject(IndicatorsService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  constructor() {
    this.indicatorForm = this.fb.group({
      weight: ['', [Validators.required, Validators.min(30), Validators.max(300)]],
      height: ['', [Validators.required, Validators.min(100), Validators.max(250)]],
      mood: ['', Validators.required],
      notes: [''],
      date: [new Date().toISOString().substring(0, 10)]
    });
  }

  async ngOnInit() {
    await this.loadUserIndicators();
  }

  async loadUserIndicators() {
    this.loading = true;
    const userId = this.authService.getCurrentUserId();
    
    if (userId) {
      this.indicatorsService.getIndicators(userId).subscribe({
        next: (data: Indicator[]) => {
          // Ordenar localmente temporalmente
          this.userIndicators = data.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          this.loading = false;
          console.log('Indicadores cargados:', this.userIndicators);
        },
        error: (error: any) => {
          console.error('Error loading indicators:', error);
          this.loading = false;
        }
      });
    } else {
      console.warn('No user ID available');
      this.loading = false;
    }
  }

  async submitIndicator() {
    if (this.indicatorForm.valid) {
      this.loading = true;
      const userId = this.authService.getCurrentUserId();
      
      if (userId) {
        try {
          const formData = {
            ...this.indicatorForm.value,
            bmi: this.calculateBMI(
              Number(this.indicatorForm.value.weight), 
              Number(this.indicatorForm.value.height)
            )
          };
          
          await this.indicatorsService.addIndicator(userId, formData);
          
          // Reset form
          this.indicatorForm.reset({
            date: new Date().toISOString().substring(0, 10),
            mood: '',
            notes: ''
          });
          
          // Recargar indicadores
          await this.loadUserIndicators();
          
          // Mostrar mensaje de éxito
          this.showSuccessMessage();
          
        } catch (error: any) {
          console.error('Error saving indicator:', error);
          this.showErrorMessage();
        } finally {
          this.loading = false;
        }
      } else {
        console.warn('No user ID available for saving indicator');
        this.loading = false;
      }
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.indicatorForm.controls).forEach(key => {
        this.indicatorForm.get(key)?.markAsTouched();
      });
    }
  }

  calculateBMI(weight: number, height: number): number {
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return Number(bmi.toFixed(1));
  }

  getBMICategory(bmi: number): string {
    if (bmi < 18.5) return 'Bajo peso';
    if (bmi < 25) return 'Peso normal';
    if (bmi < 30) return 'Sobrepeso';
    return 'Obesidad';
  }

  getBMIColor(bmi: number): string {
    if (bmi < 18.5) return 'warning';
    if (bmi < 25) return 'success';
    if (bmi < 30) return 'warning';
    return 'danger';
  }

  getMoodEmoji(mood: string): string {
    const moodEmojis: { [key: string]: string } = {
      'excelente': '😊',
      'bueno': '🙂',
      'regular': '😐',
      'malo': '😔',
      'terrible': '😢'
    };
    return moodEmojis[mood] || '❓';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  private async showSuccessMessage() {
    const toast = document.createElement('ion-toast');
    toast.message = 'Indicador guardado correctamente';
    toast.duration = 2000;
    toast.position = 'top';
    toast.color = 'success';

    document.body.appendChild(toast);
    await toast.present();
  }

  private async showErrorMessage() {
    const toast = document.createElement('ion-toast');
    toast.message = 'Error al guardar el indicador';
    toast.duration = 3000;
    toast.position = 'top';
    toast.color = 'danger';

    document.body.appendChild(toast);
    await toast.present();
  }

  // Método para debug
  get formControls() {
    return this.indicatorForm.controls;
  }
}