import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonChip, IonLabel,
  IonIcon, IonSpinner, IonButton, IonProgressBar,
  LoadingController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  heartCircleOutline, trendingUpOutline, trendingDownOutline, removeOutline,
  alertCircleOutline, checkmarkCircleOutline, starOutline, refreshOutline,
  ribbonOutline, analyticsOutline
} from 'ionicons/icons';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MLClassificationService, BienestarIntegral } from '../../services/ml-classification.service';
import { AuthService } from '../../services/auth.service';
import { MenuComponent } from '../../components/menu/menu.component';

@Component({
  selector: 'app-bienestar-integral',
  templateUrl: './bienestar-integral.page.html',
  styleUrls: ['./bienestar-integral.page.scss'],
  standalone: true,
  imports: [
    DecimalPipe,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonChip, IonLabel,
    IonIcon, IonSpinner, IonButton, IonProgressBar,
    MenuComponent
  ]
})
export class BienestarIntegralPage implements OnInit, OnDestroy {
  bienestar: BienestarIntegral | null = null;
  loading = true;
  userId: string | null = null;

  private mlService = inject(MLClassificationService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);
  private destroy$ = new Subject<void>();

  constructor() {
    addIcons({
      heartCircleOutline, trendingUpOutline, trendingDownOutline, removeOutline,
      alertCircleOutline, checkmarkCircleOutline, starOutline, refreshOutline,
      ribbonOutline, analyticsOutline
    });
  }

  async ngOnInit() {
    this.userId = this.authService.getCurrentUserId();
    
    if (!this.userId) {
      this.router.navigate(['/login']);
      return;
    }

    await this.loadBienestar();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadBienestar() {
    this.loading = true;

    try {
      if (!this.userId) return;

      // Primero intentamos obtener el último análisis
      this.bienestar = await this.mlService.getLatestBienestarIntegral(this.userId);

      // Si no hay análisis, intentamos generar uno
      if (!this.bienestar) {
        const loading = await this.loadingController.create({
          message: 'Analizando tu bienestar integral...',
          spinner: 'crescent'
        });
        await loading.present();

        try {
          await this.mlService.generateBienestarIntegralManual(this.userId);
          this.bienestar = await this.mlService.getLatestBienestarIntegral(this.userId);
          await loading.dismiss();
          
          if (this.bienestar) {
            await this.showToast('✨ Análisis generado exitosamente', 'success');
          } else {
            await this.showToast('No hay datos suficientes. Completa el formulario diario primero.', 'warning');
          }
        } catch (error) {
          await loading.dismiss();
          console.error('Error generando análisis:', error);
          await this.showToast('Completa el formulario diario para generar el análisis', 'warning');
        }
      }
    } catch (error) {
      console.error('Error cargando bienestar:', error);
      await this.showToast('Error al cargar los datos', 'danger');
    } finally {
      this.loading = false;
    }
  }

  async refreshBienestar() {
    const loading = await this.loadingController.create({
      message: 'Regenerando análisis ML...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      if (this.userId) {
        await this.mlService.generateBienestarIntegralManual(this.userId);
        await this.loadBienestar();
        await this.showToast('✨ Análisis actualizado', 'success');
      }
    } catch (error) {
      console.error('Error regenerando análisis:', error);
      await this.showToast('Error al actualizar el análisis', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  getNivelColor(nivel: string): string {
    const colores: { [key: string]: string } = {
      'optimo': 'success',
      'bueno': 'primary',
      'regular': 'warning',
      'bajo': 'warning',
      'critico': 'danger'
    };
    return colores[nivel] || 'medium';
  }

  getTendenciaIcon(tendencia: string): string {
    const iconos: { [key: string]: string } = {
      'ascendente': 'trending-up-outline',
      'estable': 'remove-outline',
      'descendente': 'trending-down-outline'
    };
    return iconos[tendencia] || 'remove-outline';
  }

  getTendenciaColor(tendencia: string): string {
    const colores: { [key: string]: string } = {
      'ascendente': 'success',
      'estable': 'primary',
      'descendente': 'danger'
    };
    return colores[tendencia] || 'medium';
  }

  getSeveridadColor(severidad: string): string {
    const colores: { [key: string]: string } = {
      'info': 'primary',
      'warning': 'warning',
      'danger': 'danger'
    };
    return colores[severidad] || 'medium';
  }

  getDimensionColor(valor: number): string {
    if (valor >= 80) return 'success';
    if (valor >= 60) return 'primary';
    if (valor >= 40) return 'warning';
    return 'danger';
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

  navigateToForm() {
    this.router.navigate(['/ml-daily-form']);
  }

  formatDate(timestamp: any): string {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}
