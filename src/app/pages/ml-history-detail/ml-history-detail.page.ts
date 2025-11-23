import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonChip, IonLabel,
  IonIcon, IonButton, IonBadge, IonNote, IonSpinner,
  AlertController, ToastController, LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline, happyOutline, waterOutline, bedOutline, barbellOutline,
  restaurantOutline, trashOutline, createOutline, timeOutline, heartOutline,
  fitnessOutline, nutritionOutline
} from 'ionicons/icons';

import { MLClassificationService, DailyMLInput } from '../../services/ml-classification.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-ml-history-detail',
  templateUrl: './ml-history-detail.page.html',
  styleUrls: ['./ml-history-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonLabel,
    IonIcon, IonButton, IonBadge, IonSpinner, IonChip
  ]
})
export class MlHistoryDetailPage implements OnInit {
  registro: DailyMLInput | null = null;
  loading = true;
  registroId: string = '';
  userId: string | null = null;

  private mlService = inject(MLClassificationService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private loadingController = inject(LoadingController);

  constructor() {
    addIcons({
      calendarOutline, happyOutline, waterOutline, bedOutline, barbellOutline,
      restaurantOutline, trashOutline, createOutline, timeOutline, heartOutline,
      fitnessOutline, nutritionOutline
    });
  }

  async ngOnInit() {
    this.userId = this.authService.getCurrentUserId();
    
    if (!this.userId) {
      this.router.navigate(['/login']);
      return;
    }

    // Obtener ID del registro desde los parámetros de ruta
    this.registroId = this.route.snapshot.paramMap.get('id') || '';
    
    if (!this.registroId) {
      await this.showToast('Error: No se encontró el registro', 'danger');
      this.router.navigate(['/ml-history']);
      return;
    }

    await this.loadRegistro();
  }

  async loadRegistro() {
    this.loading = true;

    try {
      if (!this.userId) return;

      // Obtener el registro específico
      const registro = await this.mlService.getDailyMLInputById(this.userId, this.registroId);
      
      if (!registro) {
        await this.showToast('Registro no encontrado', 'warning');
        this.router.navigate(['/ml-history']);
        return;
      }

      this.registro = registro;
    } catch (error) {
      console.error('Error cargando registro:', error);
      await this.showToast('Error al cargar el registro', 'danger');
    } finally {
      this.loading = false;
    }
  }

  async confirmarEliminar() {
    const alert = await this.alertController.create({
      header: '¿Eliminar registro?',
      message: 'Esta acción no se puede deshacer. ¿Estás seguro de eliminar este registro?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.eliminarRegistro();
          }
        }
      ]
    });

    await alert.present();
  }

  async eliminarRegistro() {
    const loading = await this.loadingController.create({
      message: 'Eliminando registro...'
    });
    await loading.present();

    try {
      if (!this.userId) return;

      await this.mlService.deleteDailyMLInput(this.userId, this.registroId);
      
      await loading.dismiss();
      await this.showToast('✅ Registro eliminado exitosamente', 'success');
      this.router.navigate(['/ml-history']);
    } catch (error) {
      await loading.dismiss();
      console.error('Error eliminando registro:', error);
      await this.showToast('Error al eliminar el registro', 'danger');
    }
  }

  editarRegistro() {
    // Navegar al formulario con el ID del registro para edición
    this.router.navigate(['/ml-daily-form'], {
      queryParams: { id: this.registroId }
    });
  }

  formatFecha(timestamp: any): string {
    if (!timestamp) return '';
    const fecha = timestamp.toDate();
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatHora(timestamp: any): string {
    if (!timestamp) return '';
    const fecha = timestamp.toDate();
    return fecha.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getEstadoAnimoColor(estado: string): string {
    const colores: { [key: string]: string } = {
      'muy-bueno': 'success',
      'bueno': 'primary',
      'neutral': 'warning',
      'malo': 'danger',
      'muy-malo': 'danger'
    };
    return colores[estado] || 'medium';
  }

  getCalidadColor(calidad: number): string {
    if (calidad >= 8) return 'success';
    if (calidad >= 5) return 'warning';
    return 'danger';
  }

  getEstresColor(nivel: number): string {
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
}
