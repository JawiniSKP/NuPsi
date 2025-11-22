import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonChip, IonLabel,
  IonIcon, IonSpinner, IonButton, IonBadge, IonProgressBar, IonNote,
  LoadingController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  sparklesOutline, trendingUpOutline, trendingDownOutline, removeOutline,
  alertCircleOutline, checkmarkCircleOutline, informationCircleOutline,
  heartOutline, waterOutline, bedOutline, barbellOutline, refreshOutline
} from 'ionicons/icons';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MLClassificationService, AuraInsight } from '../../services/ml-classification.service';
import { AuthService } from '../../services/auth.service';
import { MenuComponent } from '../../components/menu/menu.component';

@Component({
  selector: 'app-aura-insights',
  templateUrl: './aura-insights.page.html',
  styleUrls: ['./aura-insights.page.scss'],
  standalone: true,
  imports: [
    DecimalPipe, TitleCasePipe,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonChip, IonLabel,
    IonIcon, IonSpinner, IonButton, IonBadge, IonProgressBar, IonNote,
    MenuComponent
  ]
})
export class AuraInsightsPage implements OnInit, OnDestroy {
  insight: AuraInsight | null = null;
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
      sparklesOutline,
      trendingUpOutline,
      trendingDownOutline,
      removeOutline,
      alertCircleOutline,
      checkmarkCircleOutline,
      informationCircleOutline,
      heartOutline,
      waterOutline,
      bedOutline,
      barbellOutline,
      refreshOutline
    });
  }

  async ngOnInit() {
    this.userId = this.authService.getCurrentUserId();
    
    if (!this.userId) {
      this.router.navigate(['/login']);
      return;
    }

    await this.loadInsights();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadInsights() {
    this.loading = true;

    try {
      if (!this.userId) return;

      // Primero intentamos obtener el último insight
      this.insight = await this.mlService.getLatestAuraInsight(this.userId);

      // Si no hay insight, intentamos generar uno
      if (!this.insight) {
        const loading = await this.loadingController.create({
          message: 'Generando insights con IA...',
          spinner: 'crescent'
        });
        await loading.present();

        try {
          await this.mlService.generateAuraInsightManual(this.userId);
          this.insight = await this.mlService.getLatestAuraInsight(this.userId);
          await loading.dismiss();
          
          if (this.insight) {
            await this.showToast('✨ Insights generados exitosamente', 'success');
          } else {
            await this.showToast('No hay datos suficientes. Completa el formulario diario primero.', 'warning');
          }
        } catch (error) {
          await loading.dismiss();
          console.error('Error generando insights:', error);
          await this.showToast('Completa el formulario diario para generar insights', 'warning');
        }
      }
    } catch (error) {
      console.error('Error cargando insights:', error);
      await this.showToast('Error al cargar los insights', 'danger');
    } finally {
      this.loading = false;
    }
  }

  async refreshInsights() {
    const loading = await this.loadingController.create({
      message: 'Regenerando insights con IA...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      if (this.userId) {
        await this.mlService.generateAuraInsightManual(this.userId);
        await this.loadInsights();
        await this.showToast('✨ Insights actualizados', 'success');
      }
    } catch (error) {
      console.error('Error regenerando insights:', error);
      await this.showToast('Error al actualizar insights', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  getClasificacionColor(categoria: string): string {
    const colores: { [key: string]: string } = {
      'positivo': 'success',
      'neutral': 'primary',
      'negativo': 'warning',
      'critico': 'danger'
    };
    return colores[categoria] || 'medium';
  }

  getClasificacionIcon(categoria: string): string {
    const iconos: { [key: string]: string } = {
      'positivo': 'checkmark-circle-outline',
      'neutral': 'information-circle-outline',
      'negativo': 'alert-circle-outline',
      'critico': 'alert-circle-outline'
    };
    return iconos[categoria] || 'help-circle-outline';
  }

  getTendenciaIcon(tendencia: string): string {
    const iconos: { [key: string]: string } = {
      'mejorando': 'trending-up-outline',
      'estable': 'remove-outline',
      'empeorando': 'trending-down-outline'
    };
    return iconos[tendencia] || 'remove-outline';
  }

  getTendenciaColor(tendencia: string): string {
    const colores: { [key: string]: string } = {
      'mejorando': 'success',
      'estable': 'primary',
      'empeorando': 'danger'
    };
    return colores[tendencia] || 'medium';
  }

  getPrioridadColor(prioridad: string): string {
    const colores: { [key: string]: string } = {
      'alta': 'danger',
      'media': 'warning',
      'baja': 'primary'
    };
    return colores[prioridad] || 'medium';
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'success';
    if (score >= 60) return 'primary';
    if (score >= 40) return 'warning';
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
