import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { User } from 'firebase/auth';
import { AuthService } from '../../services/auth.service';
import { HomeService, Indicador, Usuario } from '../../services/home.service';
import { MenuComponent } from '../../components/menu/menu.component';
import { Firestore } from '@angular/fire/firestore';
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
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { addIcons } from 'ionicons';
import {
  locationOutline,
  createOutline,
  statsChartOutline,
  addOutline,
  removeCircleOutline,
  addCircleOutline,
  personCircleOutline,
  waterOutline,
  bulbOutline,
  personOutline,
  logOutOutline,
  closeOutline,
  menu,
  home,
  statsChart,
  chatbubble,
  analytics,
  settingsOutline,
  close,
  heartOutline,
  trendingUpOutline,
  calendarNumber,
  rocketOutline,
  sparkles,
  gridOutline,
  water,
  addCircle,
  trendingUp
} from 'ionicons/icons';

// Registrar todos los iconos necesarios
addIcons({
  locationOutline,
  createOutline,
  statsChartOutline,
  addOutline,
  removeCircleOutline,
  addCircleOutline,
  personCircleOutline,
  waterOutline,
  bulbOutline,
  personOutline,
  logOutOutline,
  closeOutline,
  menu,
  home,
  statsChart,
  chatbubble,
  analytics,
  settingsOutline,
  close,
  heartOutline,
  trendingUpOutline,
  calendarNumber,
  rocketOutline,
  sparkles,
  gridOutline,
  water,
  addCircle,
  trendingUp
});

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
export class HomePage implements OnInit, OnDestroy {
  // Usuario actual
  user: User | null = null;
  userName: string = 'Usuario';
  currentDate: Date = new Date();

  // Emociones seleccionadas
  selectedEmotions: string[] = [];

  // Datos de Firebase
  usuarioData: Usuario | null = null;
  indicadorHoy: Indicador | null = null;
  
  // Hidratación
  vasosAgua: number = 0;
  metaVasosAgua: number = 8;
  
  // Motivación
  fraseMotivacional: string = 'Recuerda que pequeños cambios generan grandes resultados. ¡Tú puedes!';

  // Próximas funciones
  upcomingFeatures = [
    { emoji: '📊', name: 'Estadísticas detalladas', available: true },
    { emoji: '🍽️', name: 'Recetas saludables', available: false },
    { emoji: '👨‍⚕️', name: 'Directorio de profesionales', available: false },
    { emoji: '🤖', name: 'Chatbot de apoyo emocional', available: false }
  ];

  // Botones de emociones
  emotionButtons = [
    { value: 'excelente', emoji: '😄', label: 'Excelente', selected: false, color: 'success' },
    { value: 'bueno', emoji: '☺️', label: 'Bueno', selected: false, color: 'primary' },
    { value: 'regular', emoji: '😐', label: 'Regular', selected: false, color: 'medium' },
    { value: 'malo', emoji: '😟', label: 'Malo', selected: false, color: 'warning' },
    { value: 'ansioso', emoji: '😰', label: 'Ansioso', selected: false, color: 'danger' }
  ];

  private auth = inject(Auth);
  private homeService = inject(HomeService);
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private firestore: Firestore = inject(Firestore)
  ) {
    this.onLogoError = this.onLogoError.bind(this);
  }

  ngOnInit() {
    console.log('🚀 HomePage initialized');

    // ✅ CORREGIDO: Suscribirse una sola vez al usuario
    this.authService.user
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (user) => {
        console.log('Auth state changed:', user);
        this.user = user;
        
        if (user) {
          await this.loadAllUserData(user.uid);
        } else {
          this.resetUserData();
        }
      });

    // Cargar frase motivacional
    this.loadFraseMotivacional();
  }

  ngOnDestroy() {
    // ✅ CORREGIDO: Limpiar suscripciones
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Función para manejar error del logo
  onLogoError() {
    console.log('Error cargando el logo');
  }

  /**
   * ✅ CORREGIDO: Cargar todos los datos del usuario
   */
  async loadAllUserData(uid: string) {
    console.log('📊 Cargando datos del usuario:', uid);

    try {
      // ✅ CORREGIDO: Usar el servicio en lugar de getDoc directo
      const usuario = await this.homeService.getUsuarioDataOnce(uid);
      
      if (usuario) {
        this.usuarioData = usuario;
        this.userName = usuario.nombreUsuario || 'Usuario';
        
        console.log('✅ Usuario cargado:', usuario);
        console.log('📋 haCompletadoConfiguracionInicial:', usuario.haCompletadoConfiguracionInicial);

        // Validar configuración inicial
        if (!usuario.haCompletadoConfiguracionInicial) {
          console.log('🔄 Redirigiendo a configuración inicial...');
          setTimeout(() => {
            this.router.navigate(['/indicators'], { 
              queryParams: { setupInicial: 'true' },
              replaceUrl: true
            });
          }, 300);
          return;
        }

        console.log('✅ Usuario ya completó configuración inicial, continuando...');
        
      } else {
        console.error('❌ Usuario no encontrado en Firestore');
        return;
      }

    } catch (error) {
      console.error('❌ Error cargando usuario:', error);
      return;
    }

    // ✅ CORREGIDO: Suscribirse al indicador de hoy
    this.subscribeToTodayIndicator(uid);

    // Actualizar último acceso
    this.homeService.actualizarUltimoAcceso(uid)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (success) => {
          if (success) {
            console.log('✅ Último acceso actualizado');
          }
        }
      });
  }

  /**
   * ✅ NUEVO: Suscribirse al indicador de hoy
   */
  subscribeToTodayIndicator(uid: string) {
    this.homeService.getIndicadorHoy(uid)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (indicador) => {
          if (indicador) {
            this.indicadorHoy = indicador;
            this.selectedEmotions = indicador.emociones || [];
            this.vasosAgua = indicador.vasosAgua || 0;
            this.updateEmotionButtons();
            console.log('✅ Indicador de hoy cargado:', indicador);
          } else {
            console.log('ℹ️ No hay indicador para hoy');
            this.resetDailyData();
          }
        },
        error: (error) => {
          console.error('❌ Error cargando indicador:', error);
        }
      });
  }

  /**
   * Cargar frase motivacional desde Firebase
   */
  loadFraseMotivacional() {
    this.homeService.getFraseMotivacional()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (frase) => {
          this.fraseMotivacional = frase;
          console.log('💡 Frase motivacional:', frase);
        },
        error: (error) => {
          console.error('Error cargando frase:', error);
        }
      });
  }

  /**
   * Actualizar el estado de los botones de emociones
   */
  updateEmotionButtons() {
    this.emotionButtons.forEach(button => {
      button.selected = this.selectedEmotions.includes(button.value);
    });
  }

  /**
   * Resetear datos cuando no hay usuario
   */
  resetUserData() {
    this.userName = 'Usuario';
    this.usuarioData = null;
    this.resetDailyData();
  }

  /**
   * Resetear datos diarios
   */
  resetDailyData() {
    this.selectedEmotions = [];
    this.vasosAgua = 0;
    this.indicadorHoy = null;
    this.resetEmotionButtons();
  }

  /**
   * Resetear estado de botones de emociones
   */
  resetEmotionButtons() {
    this.emotionButtons.forEach(button => button.selected = false);
  }

  /**
   * Seleccionar/deseleccionar emoción
   */
  async toggleEmotion(emotion: any) {
    if (!this.user) {
      console.warn('⚠️ Usuario no autenticado');
      await this.showAlert('Error', 'Debes iniciar sesión para registrar tus emociones');
      return;
    }

    // Toggle selección
    emotion.selected = !emotion.selected;

    if (emotion.selected) {
      if (!this.selectedEmotions.includes(emotion.value)) {
        this.selectedEmotions.push(emotion.value);
      }
    } else {
      this.selectedEmotions = this.selectedEmotions.filter(e => e !== emotion.value);
    }

    console.log('Emociones seleccionadas:', this.selectedEmotions);

    // Guardar en Firebase
    await this.guardarEmociones();
  }

  /**
   * Guardar emociones en Firebase
   */
  async guardarEmociones() {
    if (!this.user) return;

    if (this.selectedEmotions.length === 0) {
      console.log('ℹ️ No hay emociones seleccionadas para guardar');
      return;
    }

    // Calcular estado de ánimo general
    const estadoAnimo = this.homeService.calcularEstadoAnimo(this.selectedEmotions);

    console.log('💾 Guardando emociones:', {
      emociones: this.selectedEmotions,
      estadoAnimo,
      vasosAgua: this.vasosAgua,
      indicadorId: this.indicadorHoy?.id
    });

    this.homeService.guardarIndicadorDiario(
      this.user.uid,
      this.selectedEmotions,
      estadoAnimo,
      this.vasosAgua,
      this.indicadorHoy?.id
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (success) => {
        if (success) {
          console.log('✅ Emociones guardadas');
          this.showToast('Emociones guardadas correctamente', 'success');
        }
      },
      error: (error) => {
        console.error('❌ Error guardando emociones:', error);
        this.showToast('Error al guardar las emociones', 'danger');
      }
    });
  }

  /**
   * Incrementar vasos de agua
   */
  async incrementarVasosAgua() {
    if (!this.user) {
      await this.showAlert('Error', 'Debes iniciar sesión para registrar tu consumo de agua');
      return;
    }

    if (this.vasosAgua < 20) {
      this.vasosAgua++;
      
      console.log('💧 Incrementando vasos de agua a:', this.vasosAgua);

      this.homeService.actualizarVasosAgua(
        this.user.uid, 
        this.vasosAgua, 
        this.indicadorHoy?.id
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (success) => {
          if (success) {
            console.log('✅ Vasos de agua actualizados:', this.vasosAgua);
            
            if (this.vasosAgua === this.metaVasosAgua) {
              this.showToast('¡Felicitaciones! Alcanzaste tu meta de agua 🎉', 'success');
            }
          }
        },
        error: (error) => {
          console.error('❌ Error actualizando vasos de agua:', error);
          this.vasosAgua--;
          this.showToast('Error al actualizar el agua', 'danger');
        }
      });
    }
  }

  /**
   * Decrementar vasos de agua
   */
  async decrementarVasosAgua() {
    if (!this.user) return;

    if (this.vasosAgua > 0) {
      this.vasosAgua--;
      
      console.log('💧 Decrementando vasos de agua a:', this.vasosAgua);

      this.homeService.actualizarVasosAgua(
        this.user.uid, 
        this.vasosAgua, 
        this.indicadorHoy?.id
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (error) => {
          console.error('❌ Error actualizando vasos de agua:', error);
          this.vasosAgua++;
        }
      });
    }
  }

  /**
   * 🍔 ABRIR MENÚ HAMBURGUESA PRINCIPAL
   */
  async openMainMenu() {
    const actionSheet = document.createElement('ion-action-sheet');
    
    actionSheet.header = 'Navegación';
    actionSheet.buttons = [
      {
        text: 'Inicio',
        icon: 'home',
        handler: () => {
          this.router.navigate(['/home']);
        }
      },
      {
        text: 'Indicadores',
        icon: 'stats-chart',
        handler: () => {
          this.router.navigate(['/indicators']);
        }
      },
      {
        text: 'Chatbot',
        icon: 'chatbubble',
        handler: () => {
          this.router.navigate(['/chat']);
        }
      },
      {
        text: 'Estadísticas',
        icon: 'analytics',
        handler: () => {
          this.showComingSoon('Estadísticas');
        }
      },
      {
        text: 'Configuración',
        icon: 'settings-outline',
        handler: () => {
          this.showComingSoon('Configuración');
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

    document.body.appendChild(actionSheet);
    await actionSheet.present();
  }

  /**
   * 👤 ABRIR MENÚ DE PERFIL
   */
  async openProfileMenu(event: any) {
    const actionSheet = document.createElement('ion-action-sheet');
    
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
        text: 'Configuración',
        icon: 'settings-outline',
        handler: () => {
          this.showComingSoon('Configuración');
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

    document.body.appendChild(actionSheet);
    await actionSheet.present();
  }

  /**
   * Cerrar sesión
   */
  async logout() {
    try {
      const loading = document.createElement('ion-loading');
      loading.message = 'Cerrando sesión...';
      document.body.appendChild(loading);
      await loading.present();

      await this.authService.logout();
      
      await loading.dismiss();
      await this.showToast('Sesión cerrada correctamente', 'success');
      
      this.resetUserData();
      this.router.navigate(['/login']);
      
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      
      const loading = document.querySelector('ion-loading');
      if (loading) {
        await loading.dismiss();
      }
      
      await this.showAlert('Error', 'No se pudo cerrar la sesión');
    }
  }

  /**
   * Abrir perfil del usuario
   */
  openProfile() {
    this.showComingSoon('Perfil');
  }

  /**
   * Abrir registro diario completo
   */
  openDailyRegister() {
    if (this.usuarioData && !this.usuarioData.haCompletadoConfiguracionInicial) {
      console.log('📝 Redirigiendo a configuración inicial');
      this.router.navigate(['/indicators']);
    } else {
      console.log('📝 Redirigiendo a registro diario');
      this.router.navigate(['/indicators']);
    }
  }

  /**
   * UTILIDADES PARA MOSTRAR MENSAJES
   */
  private async showToast(message: string, color: string = 'success') {
    const toast = document.createElement('ion-toast');
    toast.message = message;
    toast.duration = 2000;
    toast.position = 'top';
    toast.color = color;

    document.body.appendChild(toast);
    await toast.present();
  }

  private async showAlert(header: string, message: string) {
    const alert = document.createElement('ion-alert');
    alert.header = header;
    alert.message = message;
    alert.buttons = ['OK'];

    document.body.appendChild(alert);
    await alert.present();
  }

  private async showComingSoon(feature: string) {
    await this.showAlert(
      'Próximamente', 
      `${feature} estará disponible en la próxima actualización.`
    );
  }
}