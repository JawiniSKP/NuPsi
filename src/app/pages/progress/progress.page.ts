import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButtons,
  IonMenuButton,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonRadioGroup,
  IonRadio,
  AlertController,
  LoadingController
} from '@ionic/angular/standalone';
import { IndicatorsService } from '../../services/indicators.service';
import { AuthService } from '../../services/auth.service';
import { addIcons } from 'ionicons';
import { add, happy, statsChart } from 'ionicons/icons';

// Para gráficos - instalar: npm install chart.js
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.page.html',
  styleUrls: ['./progress.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButtons,
    IonMenuButton,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonRadioGroup,
    IonRadio
  ]
})
export class ProgressPage implements OnInit, AfterViewInit {
  @ViewChild('weightChart') weightChartRef!: ElementRef;
  @ViewChild('bmiChart') bmiChartRef!: ElementRef;
  @ViewChild('moodChart') moodChartRef!: ElementRef;

  userIndicators: any[] = [];
  userHeight: number = 0;
  currentWeight: number | null = null;
  currentMood: string = '';
  
  weightData: any[] = [];
  moodData: any[] = [];
  
  private weightChart: any;
  private bmiChart: any;
  private moodChart: any;

  constructor(
    private indicatorsService: IndicatorsService,
    private authService: AuthService,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    addIcons({ add, happy, statsChart });
  }

  ngOnInit() {
    this.loadUserData();
  }

  ngAfterViewInit() {
    // Los gráficos se inicializan después de cargar los datos
  }

  async loadUserData() {
    const userId = this.authService.getCurrentUserId();
    if (userId) {
      // Cargar indicadores
      this.indicatorsService.getIndicators(userId).subscribe({
        next: (data) => {
          this.userIndicators = data;
          this.processData();
          this.initCharts();
        },
        error: (error) => {
          console.error('Error loading indicators:', error);
        }
      });

      // Cargar perfil para obtener estatura
      try {
        const profile = await this.authService.getUserProfile(userId);
        this.userHeight = profile?.height || 0;
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }
  }

  processData() {
    // Separar datos de peso y emociones
    this.weightData = this.userIndicators
      .filter(ind => ind.weight)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    this.moodData = this.userIndicators
      .filter(ind => ind.mood)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  initCharts() {
    if (this.weightData.length > 1) {
      this.createWeightChart();
      if (this.userHeight) {
        this.createBMIChart();
      }
    }

    if (this.moodData.length > 0) {
      this.createMoodChart();
    }
  }

  createWeightChart() {
    const ctx = this.weightChartRef.nativeElement.getContext('2d');
    const labels = this.weightData.map(d => new Date(d.createdAt).toLocaleDateString()).reverse();
    const data = this.weightData.map(d => d.weight).reverse();

    this.weightChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Peso (kg)',
          data: data,
          borderColor: '#3880ff',
          backgroundColor: 'rgba(56, 128, 255, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Progreso de Peso'
          }
        }
      }
    });
  }

  createBMIChart() {
    const ctx = this.bmiChartRef.nativeElement.getContext('2d');
    const labels = this.weightData.map(d => new Date(d.createdAt).toLocaleDateString()).reverse();
    const data = this.weightData.map(d => 
      this.indicatorsService.calculateBMI(d.weight, this.userHeight)
    ).reverse();

    this.bmiChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'IMC',
          data: data,
          borderColor: '#10dc60',
          backgroundColor: 'rgba(16, 220, 96, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Evolución del IMC'
          }
        }
      }
    });
  }

  createMoodChart() {
    const ctx = this.moodChartRef.nativeElement.getContext('2d');
    const moodCounts = this.countMoods();
    
    this.moodChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(moodCounts),
        datasets: [{
          data: Object.values(moodCounts),
          backgroundColor: [
            '#10dc60', // Excelente - verde
            '#ffce00', // Bueno - amarillo
            '#ffc409', // Regular - naranja
            '#eb445a'  // Malo - rojo
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Distribución de Estados de Ánimo'
          }
        }
      }
    });
  }

  // Métodos de utilidad
  countMoods(): { [key: string]: number } {
    const counts: { [key: string]: number } = {};
    this.moodData.forEach(ind => {
      counts[ind.mood] = (counts[ind.mood] || 0) + 1;
    });
    return counts;
  }

  getMostFrequentMood(): string {
    const counts = this.countMoods();
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  }

  getMoodCountThisMonth(): number {
    const now = new Date();
    return this.moodData.filter(ind => {
      const indDate = new Date(ind.createdAt);
      return indDate.getMonth() === now.getMonth() && indDate.getFullYear() === now.getFullYear();
    }).length;
  }

  getWeightChange(): number {
    if (this.weightData.length < 2) return 0;
    const latest = this.weightData[0].weight;
    const oldest = this.weightData[this.weightData.length - 1].weight;
    return latest - oldest;
  }

  getCurrentBMI(): number {
    if (!this.weightData.length || !this.userHeight) return 0;
    return this.indicatorsService.calculateBMI(this.weightData[0].weight, this.userHeight);
  }

  // Lógica de registro
  canRegisterWeight(): boolean {
    if (this.weightData.length === 0) return true;
    
    const lastWeightDate = new Date(this.weightData[0].createdAt);
    const today = new Date();
    const daysSinceLast = (today.getTime() - lastWeightDate.getTime()) / (1000 * 3600 * 24);
    
    return daysSinceLast >= 5; // Permitir cada 5 días
  }

  getNextWeightDate(): Date {
    if (this.weightData.length === 0) return new Date();
    
    const lastWeightDate = new Date(this.weightData[0].createdAt);
    const nextDate = new Date(lastWeightDate);
    nextDate.setDate(nextDate.getDate() + 5);
    return nextDate;
  }

  hasRegisteredMoodToday(): boolean {
    if (this.moodData.length === 0) return false;
    
    const today = new Date().toDateString();
    const lastMoodDate = new Date(this.moodData[0].createdAt).toDateString();
    return today === lastMoodDate;
  }

  // Acciones
  async registerWeight() {
    if (!this.currentWeight || !this.canRegisterWeight()) return;

    const loading = await this.loadingController.create({
      message: 'Registrando peso...'
    });
    await loading.present();

    try {
      const userId = this.authService.getCurrentUserId();
      if (userId) {
        await this.indicatorsService.addIndicator(userId, {
          weight: this.currentWeight,
          height: this.userHeight,
          mood: this.currentMood,
          type: 'weight_progress'
        });
        
        this.currentWeight = null;
        await this.loadUserData(); // Recargar datos
      }
    } catch (error) {
      console.error('Error registering weight:', error);
      this.showAlert('Error', 'No se pudo registrar el peso');
    } finally {
      await loading.dismiss();
    }
  }

  async registerMood() {
    if (!this.currentMood || this.hasRegisteredMoodToday()) return;

    const loading = await this.loadingController.create({
      message: 'Registrando estado de ánimo...'
    });
    await loading.present();

    try {
      const userId = this.authService.getCurrentUserId();
      if (userId) {
        await this.indicatorsService.addIndicator(userId, {
          mood: this.currentMood,
          type: 'mood_daily'
        });
        
        this.currentMood = '';
        await this.loadUserData(); // Recargar datos
      }
    } catch (error) {
      console.error('Error registering mood:', error);
      this.showAlert('Error', 'No se pudo registrar el estado de ánimo');
    } finally {
      await loading.dismiss();
    }
  }

  async updateHeight() {
    const userId = this.authService.getCurrentUserId();
    if (userId && this.userHeight) {
      try {
        // Aquí necesitarías un método en authService para actualizar la estatura
        // await this.authService.updateUserHeight(userId, this.userHeight);
        console.log('Height updated to:', this.userHeight);
      } catch (error) {
        console.error('Error updating height:', error);
      }
    }
  }

  getBMICategory(bmi: number): string {
    return this.indicatorsService.getBMICategory(bmi);
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}