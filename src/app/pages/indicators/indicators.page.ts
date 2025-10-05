import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonTextarea,
  IonRadioGroup,
  IonRadio,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent
} from '@ionic/angular/standalone';
import { IndicatorsService } from '../../services/indicators.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-indicators',
  templateUrl: './indicators.page.html',
  styleUrls: ['./indicators.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonTextarea,
    IonRadioGroup,
    IonRadio,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent
  ]
})
export class IndicatorsPage implements OnInit {
  currentStep: number = 1;
  
  // 🔄 CAMBIADO: Inicializar con valores por defecto
  indicatorForm = {
    weight: 0, // ✅ Cambiado de null a 0
    height: 0, // ✅ Cambiado de null a 0
    mood: '',
    notes: '',
    date: new Date().toISOString()
  };

  constructor(
    private indicatorsService: IndicatorsService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('IndicatorsPage initialized');
  }

  nextStep() {
    if (this.currentStep < 5) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  async saveIndicators() {
    console.log('Saving indicators:', this.indicatorForm);
    
    // 🔄 CAMBIADO: Verificar que los valores sean mayores que 0
    if (this.indicatorForm.weight > 0 && this.indicatorForm.height > 0 && this.indicatorForm.mood) {
      const userId = this.authService.getCurrentUserId();
      
      if (userId) {
        try {
          const formData = {
            ...this.indicatorForm,
            bmi: this.calculateBMI(this.indicatorForm.weight, this.indicatorForm.height),
            date: new Date().toISOString()
          };
          
          console.log('Saving data:', formData);
          
          await this.indicatorsService.addIndicator(userId, formData);
          
          // Ir al paso de resumen
          this.currentStep = 5;
          
        } catch (error) {
          console.error('Error saving indicator:', error);
        }
      }
    } else {
      console.log('Form validation failed');
    }
  }

  goToHome() {
    console.log('Navigating to home');
    this.router.navigate(['/home']);
  }

  calculateBMI(weight: number, height: number): number {
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  }

  getBMICategory(bmi: number): string {
    if (bmi < 18.5) return 'Bajo peso';
    if (bmi < 25) return 'Peso normal';
    if (bmi < 30) return 'Sobrepeso';
    return 'Obesidad';
  }

  getMoodEmoji(mood: string): string {
    const moodEmojis: { [key: string]: string } = {
      'excelente': '😊',
      'bueno': '🙂',
      'regular': '😐',
      'malo': '😔'
    };
    return moodEmojis[mood] || '❓';
  }

  // 🔄 NUEVO: Métodos seguros para el template
  getSafeBMI(): number {
    return this.calculateBMI(this.indicatorForm.weight, this.indicatorForm.height);
  }

  getSafeBMICategory(): string {
    return this.getBMICategory(this.getSafeBMI());
  }
}