import { Component, OnInit, inject, OnDestroy, NgZone } from '@angular/core';
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
  IonCardContent,
  ActionSheetController,
  ToastController,
  AlertController,
  LoadingController
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// ✅ AGREGAR IMPORTS DE CAPACITOR
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

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
  private authService = inject(AuthService);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  
  // ✅ CORREGIDO: Inyectar controles de Ionic
  private actionSheetController = inject(ActionSheetController);
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);
  private loadingController = inject(LoadingController);

  private destroy$ = new Subject<void>();

  constructor(
    private firestore: Firestore = inject(Firestore)
  ) {
    this.onLogoError = this.onLogoError.bind(this);
  }

  ngOnInit() {
    console.log('🚀 HomePage initialized');

    this.authService.user
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.ngZone.run(() => {
          console.log('Auth state changed:', user);
          this.user = user;

          if (user) {
            this.loadAllUserData(user.uid);
          } else {
            this.resetUserData();
          }
        });
      });

    this.loadFraseMotivacional();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Función para manejar error del logo
  onLogoError() {
    console.log('Error cargando el logo');
  }

  /**
   * ✅ OPTIMIZADO: Carga de datos más eficiente
   */
  async loadAllUserData(uid: string) {
    console.log('📊 Cargando datos del usuario:', uid);

    try {
      const usuario = await this.homeService.getUsuarioDataOnce(uid);

      if (usuario) {
        this.ngZone.run(() => {
          this.usuarioData = usuario;
          this.userName = usuario.nombreUsuario || 'Usuario';

          console.log('✅ Usuario cargado:', usuario);
          console.log('📋 haCompletadoConfiguracionInicial:', usuario.haCompletadoConfiguracionInicial);

          // Validar configuración inicial
          if (!usuario.haCompletadoConfiguracionInicial) {
            console.log('🔄 Redirigiendo a configuración inicial...');
            setTimeout(() => {
              this.ngZone.run(() => {
                this.router.navigate(['/indicators'], {
                  queryParams: { setupInicial: 'true' },
                  replaceUrl: true
                });
              });
            }, 300);
            return;
          }

          console.log('✅ Usuario ya completó configuración inicial, continuando...');
        });

        // Cargar indicador y actualizar acceso en paralelo
        await Promise.all([
          this.subscribeToTodayIndicator(uid),
          this.actualizarUltimoAcceso(uid)
        ]);

      } else {
        console.error('❌ Usuario no encontrado en Firestore');
      }

    } catch (error) {
      console.error('❌ Error cargando usuario:', error);
    }
  }

  /**
   * ✅ OPTIMIZADO: Suscribirse al indicador de hoy
   */
  private async subscribeToTodayIndicator(uid: string) {
    this.homeService.getIndicadorHoy(uid)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (indicador) => {
          this.ngZone.run(() => {
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
          });
        },
        error: (error) => {
          this.ngZone.run(() => {
            console.error('❌ Error cargando indicador:', error);
          });
        }
      });
  }

  /**
   * ✅ NUEVO: Método separado para actualizar último acceso
   */
  private async actualizarUltimoAcceso(uid: string) {
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
   * Cargar frase motivacional desde Firebase
   */
  private loadFraseMotivacional() {
    this.homeService.getFraseMotivacional()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (frase) => {
          this.ngZone.run(() => {
            this.fraseMotivacional = frase;
            console.log('💡 Frase motivacional:', frase);
          });
        },
        error: (error) => {
          console.error('Error cargando frase:', error);
        }
      });
  }

  /**
   * Actualizar el estado de los botones de emociones
   */
  private updateEmotionButtons() {
    this.emotionButtons.forEach(button => {
      button.selected = this.selectedEmotions.includes(button.value);
    });
  }

  /**
   * Resetear datos cuando no hay usuario
   */
  private resetUserData() {
    this.userName = 'Usuario';
    this.usuarioData = null;
    this.resetDailyData();
  }

  /**
   * Resetear datos diarios
   */
  private resetDailyData() {
    this.selectedEmotions = [];
    this.vasosAgua = 0;
    this.indicadorHoy = null;
    this.resetEmotionButtons();
  }

  /**
   * Resetear estado de botones de emociones
   */
  private resetEmotionButtons() {
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
  private async guardarEmociones() {
    if (!this.user) return;

    if (this.selectedEmotions.length === 0) {
      console.log('ℹ️ No hay emociones seleccionadas para guardar');
      return;
    }

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
   * ✅ OPTIMIZADO: Incrementar vasos de agua - SOLO ACTUALIZA AGUA
   */
  async incrementarVasosAgua() {
    if (!this.user) {
      await this.showAlert('Error', 'Debes iniciar sesión para registrar tu consumo de agua');
      return;
    }

    if (this.vasosAgua < 20) {
      this.vasosAgua++;

      console.log('💧 Incrementando vasos de agua a:', this.vasosAgua);

      // ✅ SOLO ACTUALIZA EL AGUA, NO TODO EL INDICADOR
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
   * ✅ OPTIMIZADO: Decrementar vasos de agua - SOLO ACTUALIZA AGUA
   */
  async decrementarVasosAgua() {
    if (!this.user) return;

    if (this.vasosAgua > 0) {
      this.vasosAgua--;

      console.log('💧 Decrementando vasos de agua a:', this.vasosAgua);

      // ✅ SOLO ACTUALIZA EL AGUA, NO TODO EL INDICADOR
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
   * 🍔 ABRIR MENÚ HAMBURGUESA PRINCIPAL - CORREGIDO
   */
  async openMainMenu() {
    // ✅ FEEDBACK HÁPTICO EN MÓVIL
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }

    const actionSheet = await this.actionSheetController.create({
      header: 'Navegación',
      buttons: [
        {
          text: 'Inicio',
          icon: 'home',
          handler: () => {
            this.ngZone.run(() => {
              this.router.navigate(['/home']);
            });
          }
        },
        {
          text: 'Indicadores',
          icon: 'stats-chart',
          handler: () => {
            this.ngZone.run(() => {
              this.router.navigate(['/indicators']);
            });
          }
        },
        {
          text: 'Chatbot',
          icon: 'chatbubble',
          handler: () => {
            this.ngZone.run(() => {
              this.router.navigate(['/chat']);
            });
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
      ]
    });

    await actionSheet.present();
  }

  /**
   * 👤 ABRIR MENÚ DE PERFIL - CORREGIDO
   */
  async openProfileMenu(event: any) {
    // ✅ FEEDBACK HÁPTICO EN MÓVIL
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }

    const actionSheet = await this.actionSheetController.create({
      header: this.userName || 'Usuario',
      subHeader: this.user?.email || '',
      buttons: [
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
      ]
    });

    await actionSheet.present();
  }

  /**
   * Cerrar sesión - CORREGIDO
   */
  async logout() {
    try {
      const loading = await this.loadingController.create({
        message: 'Cerrando sesión...'
      });
      await loading.present();

      await this.authService.logout();

      await loading.dismiss();
      await this.showToast('Sesión cerrada correctamente', 'success');

      this.ngZone.run(() => {
        this.resetUserData();
        this.router.navigate(['/login']);
      });

    } catch (error) {
      console.error('Error al cerrar sesión:', error);

      const loading = await this.loadingController.getTop();
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
      this.ngZone.run(() => {
        this.router.navigate(['/indicators']);
      });
    } else {
      console.log('📝 Redirigiendo a registro diario');
      this.ngZone.run(() => {
        this.router.navigate(['/indicators']);
      });
    }
  }

  /**
   * UTILIDADES PARA MOSTRAR MENSAJES - CORREGIDAS
   */
  private async showToast(message: string, color: string = 'success') {
    // ✅ FEEDBACK HÁPTICO EN MÓVIL
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }

    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'top',
      color: color
    });
    await toast.present();
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  private async showComingSoon(feature: string) {
    // ✅ FEEDBACK HÁPTICO EN MÓVIL
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }

    const alert = await this.alertController.create({
      header: 'Próximamente',
      message: `${feature} estará disponible en la próxima actualización.`,
      buttons: ['OK']
    });
    await alert.present();
  }
}