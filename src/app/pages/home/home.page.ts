import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { User } from 'firebase/auth';
import { AuthService } from '../../services/auth.service';
import { EmotionService } from '../../services/emotion.service';
import { MenuComponent } from '../../components/menu/menu.component';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    MenuComponent
  ]
})
export class HomePage implements OnInit {
  user: User | null = null;
  userName: string = 'Usuario';
  currentDate: Date = new Date();
  selectedEmotions: string[] = [];

  emotionButtons = [
    { value: 'excelente', emoji: '😁', label: 'Excelente', selected: false, color: 'success' },
    { value: 'bueno', emoji: '☺️', label: 'Bueno', selected: false, color: 'primary' },
    { value: 'regular', emoji: '😐', label: 'Regular', selected: false, color: 'medium' },
    { value: 'malo', emoji: '😔', label: 'Malo', selected: false, color: 'warning' },
    { value: 'ansioso', emoji: '😣', label: 'Ansioso', selected: false, color: 'danger' }
  ];

  private auth = inject(Auth);
  private emotionService = inject(EmotionService);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    console.log('HomePage initialized - testing interactivity');

    try {
      const currentUser = this.auth.currentUser;
      console.log('Current user:', currentUser);

      if (currentUser) {
        this.user = currentUser;
        await this.loadUserData(currentUser);
        await this.loadTodayEmotions(currentUser.uid);
      }

      this.authService.user.subscribe(async (user) => {
        console.log('Auth state changed:', user);
        this.user = user;
        if (user) {
          await this.loadUserData(user);
          await this.loadTodayEmotions(user.uid);
        } else {
          this.userName = 'Usuario';
          this.selectedEmotions = [];
          this.resetEmotionButtons();
        }
      });
    } catch (error) {
      console.error('Error in ngOnInit:', error);
    }
  }

  // ✅ NUEVO MÉTODO: Menú de perfil con opción de cerrar sesión
  async openProfileMenu(event: any) {
    // Crear el action sheet (menú de acciones)
    const actionSheet = document.createElement('ion-action-sheet');
    
    // Configurar el action sheet
    actionSheet.header = this.userName || 'Usuario';
    actionSheet.subHeader = this.user?.email || '';
    actionSheet.buttons = [
      {
        text: 'Ver Perfil',
        icon: 'person-outline',
        handler: () => {
          this.openProfile();
        }
      },
      {
        text: 'Cerrar Sesión',
        icon: 'log-out-outline',
        role: 'destructive',
        handler: () => {
          this.logout();
        }
      },
      {
        text: 'Cancelar',
        icon: 'close',
        role: 'cancel'
      }
    ];

    // Agregar al DOM y mostrar
    document.body.appendChild(actionSheet);
    await actionSheet.present();
  }

  // ✅ NUEVO MÉTODO: Cerrar sesión
  async logout() {
    try {
      console.log('Cerrando sesión...');
      
      // Mostrar loading mientras se procesa
      const loading = document.createElement('ion-loading');
      loading.message = 'Cerrando sesión...';
      document.body.appendChild(loading);
      await loading.present();

      // Cerrar sesión con el servicio de autenticación
      await this.authService.logout();
      
      // Ocultar loading
      await loading.dismiss();
      
      // Mostrar confirmación de cierre de sesión
      await this.showLogoutConfirmation();
      
      // Redirigir al login
      this.router.navigate(['/login']);
      
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      
      // Ocultar loading si existe
      const loading = document.querySelector('ion-loading');
      if (loading) {
        await loading.dismiss();
      }
      
      // Mostrar error
      await this.showLogoutError();
    }
  }

  // ✅ NUEVO MÉTODO: Confirmación de cierre de sesión
  async showLogoutConfirmation() {
    const toast = document.createElement('ion-toast');
    toast.message = 'Sesión cerrada correctamente';
    toast.duration = 2000;
    toast.position = 'top';
    toast.color = 'success';

    document.body.appendChild(toast);
    await toast.present();
  }

  // ✅ NUEVO MÉTODO: Error en cierre de sesión
  async showLogoutError() {
    const alert = document.createElement('ion-alert');
    alert.header = 'Error';
    alert.message = 'No se pudo cerrar la sesión. Intenta nuevamente.';
    alert.buttons = ['OK'];

    document.body.appendChild(alert);
    await alert.present();
  }

  // ✅ Método para debug de interactividad
  testClick() {
    console.log('✅ DEBUG: Content is interactive!');
    alert('✅ El contenido es interactivo - Puedes hacer click/tocar');
  }

  async loadUserData(user: User) {
    try {
      console.log('Loading user data for:', user.email);

      if (user.providerData && user.providerData.length > 0) {
        const googleProvider = user.providerData.find(
          (provider: any) => provider.providerId === 'google.com'
        );

        if (googleProvider?.displayName) {
          this.userName = googleProvider.displayName;
          console.log('✅ Nombre obtenido de Google Auth:', this.userName);
          return;
        }
      }

      if (user.displayName) {
        this.userName = user.displayName;
        console.log('✅ Nombre obtenido de displayName:', this.userName);
        return;
      }

      const name = await this.authService.getCurrentUserName();
      this.userName = name || 'Usuario';
      console.log('✅ Nombre obtenido del servicio:', this.userName);

    } catch (error) {
      console.error('Error loading user data:', error);
      this.userName = 'Usuario';
    }
  }

  async loadTodayEmotions(userId: string) {
    try {
      this.emotionService.loadTodayEmotions(userId).subscribe({
        next: (emotionRecord) => {
          if (emotionRecord) {
            this.selectedEmotions = emotionRecord.emociones;
            this.emotionButtons.forEach(button => {
              button.selected = this.selectedEmotions.includes(button.value);
            });
            console.log('Emociones cargadas desde servicio:', this.selectedEmotions);
          } else {
            this.selectedEmotions = [];
            this.resetEmotionButtons();
            console.log('No hay emociones guardadas para hoy');
          }
        },
        error: (error) => {
          console.error('Error loading today emotions:', error);
          this.selectedEmotions = [];
          this.resetEmotionButtons();
        }
      });
    } catch (error) {
      console.error('Error in loadTodayEmotions:', error);
    }
  }

  resetEmotionButtons() {
    this.emotionButtons.forEach(button => button.selected = false);
  }

  async toggleEmotion(emotion: any) {
    if (!this.user) {
      console.warn('⚠️ Usuario no autenticado');
      return;
    }

    emotion.selected = !emotion.selected;

    if (emotion.selected) {
      if (!this.selectedEmotions.includes(emotion.value)) {
        this.selectedEmotions.push(emotion.value);
      }
    } else {
      this.selectedEmotions = this.selectedEmotions.filter(e => e !== emotion.value);
    }

    await this.saveEmotionsToFirebase();
  }

  async saveEmotionsToFirebase() {
    if (!this.user) return;

    try {
      this.emotionService.saveTodayEmotions(this.user.uid, this.selectedEmotions).subscribe({
        next: () => {
          console.log('✅ Emociones guardadas a través del servicio:', this.selectedEmotions);
          this.showSaveConfirmation();
        },
        error: (error) => {
          console.error('❌ Error guardando emociones a través del servicio:', error);
        }
      });
    } catch (error) {
      console.error('❌ Error in saveEmotionsToFirebase:', error);
    }
  }

  async showSaveConfirmation() {
    const toast = document.createElement('ion-toast');
    toast.message = 'Tus emociones se han guardado correctamente';
    toast.duration = 2000;
    toast.position = 'top';
    toast.color = 'success';

    document.body.appendChild(toast);
    await toast.present();
  }

  openProfile() {
    this.showComingSoon('Perfil');
  }

  openDailyRegister() {
    this.router.navigate(['/indicators']);
  }

  private async showComingSoon(feature: string) {
    const alert = document.createElement('ion-alert');
    alert.header = 'Próximamente';
    alert.message = `${feature} estará disponible en la próxima actualización.`;
    alert.buttons = ['OK'];

    document.body.appendChild(alert);
    await alert.present();

    alert.onDidDismiss().then(() => {
      document.body.removeChild(alert);
    });
  }
}