import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonChip, IonLabel,
  IonIcon, IonSpinner, IonButton, IonBadge, IonNote,
  IonSegment, IonSegmentButton, IonRefresher, IonRefresherContent,
  LoadingController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline, happyOutline, sadOutline, waterOutline, 
  bedOutline, barbellOutline, restaurantOutline, analyticsOutline,
  chevronForwardOutline, filterOutline, timeOutline
} from 'ionicons/icons';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MLClassificationService, DailyMLInput } from '../../services/ml-classification.service';
import { AuthService } from '../../services/auth.service';
import { MenuComponent } from '../../components/menu/menu.component';

@Component({
  selector: 'app-ml-history',
  templateUrl: './ml-history.page.html',
  styleUrls: ['./ml-history.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonChip, IonLabel,
    IonIcon, IonSpinner, IonButton, IonBadge, IonNote,
    IonSegment, IonSegmentButton, IonRefresher, IonRefresherContent,
    MenuComponent
  ]
})
export class MlHistoryPage implements OnInit, OnDestroy {
  registros: DailyMLInput[] = [];
  registrosFiltrados: DailyMLInput[] = [];
  loading = true;
  userId: string | null = null;
  selectedPeriod: 'semana' | 'mes' | 'todo' = 'mes';

  private mlService = inject(MLClassificationService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);
  private destroy$ = new Subject<void>();

  constructor() {
    addIcons({
      calendarOutline, happyOutline, sadOutline, waterOutline,
      bedOutline, barbellOutline, restaurantOutline, analyticsOutline,
      chevronForwardOutline, filterOutline, timeOutline
    });
  }

  async ngOnInit() {
    this.userId = this.authService.getCurrentUserId();
    
    if (!this.userId) {
      this.router.navigate(['/login']);
      return;
    }

    await this.loadHistory();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadHistory() {
    this.loading = true;

    try {
      if (!this.userId) return;

      const dias = this.selectedPeriod === 'semana' ? 7 : this.selectedPeriod === 'mes' ? 30 : 90;
      this.registros = await this.mlService.getDailyMLInputs(this.userId, dias);
      this.registrosFiltrados = [...this.registros];

      console.log(`📊 Historial cargado: ${this.registros.length} registros`);
    } catch (error) {
      console.error('Error cargando historial:', error);
      await this.showToast('Error al cargar el historial', 'danger');
    } finally {
      this.loading = false;
    }
  }

  async onPeriodChange(event: any) {
    this.selectedPeriod = event.detail.value;
    await this.loadHistory();
  }

  async handleRefresh(event: any) {
    await this.loadHistory();
    event.target.complete();
  }

  verDetalle(registro: DailyMLInput) {
    this.router.navigate(['/ml-history-detail', registro.id]);
  }

  getEstadoAnimoColor(estadoAnimo: string): string {
    const colores: { [key: string]: string } = {
      'excelente': 'success',
      'bueno': 'primary',
      'regular': 'warning',
      'malo': 'danger',
      'muy-malo': 'danger'
    };
    return colores[estadoAnimo] || 'medium';
  }

  getEstadoAnimoEmoji(estadoAnimo: string): string {
    const emojis: { [key: string]: string } = {
      'excelente': '😄',
      'bueno': '🙂',
      'regular': '😐',
      'malo': '😔',
      'muy-malo': '😢'
    };
    return emojis[estadoAnimo] || '😐';
  }

  getNivelEstresColor(nivel: number): string {
    if (nivel <= 3) return 'success';
    if (nivel <= 6) return 'warning';
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

  formatDate(timestamp: any): string {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString('es-ES', { 
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  formatTime(timestamp: any): string {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
