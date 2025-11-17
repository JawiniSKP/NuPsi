import { Component, OnInit, inject, OnDestroy, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { User } from 'firebase/auth';
import { AuthService } from '../../services/auth.service';
import { HomeService, Indicador, Usuario } from '../../services/home.service';
import { MenuComponent } from '../../components/menu/menu.component';
import { Firestore } from '@angular/fire/firestore';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
  IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, ActionSheetController, ToastController,
  AlertController, LoadingController
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Capacitor
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
    IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, MenuComponent
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

  // Estados
  loading: boolean = true;
  error: string = '';

  // Motivación
  fraseMotivacional: string = 'Cargando...';

  // ✅ AGREGADO: Próximas funciones que faltaban
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
  
  private actionSheetController = inject(ActionSheetController);
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);
  private loadingController = inject(LoadingController);

  private destroy$ = new Subject<void>();

  constructor() {
    this.onLogoError = this.onLogoError.bind(this);
  }

  async ngOnInit() {
    console.log('🚀 HomePage inicializado');
    await this.inicializarHome();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ✅ CORREGIDO: Inicialización optimizada
  private async inicializarHome() {
    this.loading = true;
    
    try {
      // Suscribirse a cambios de autenticación
      this.authService.user
        .pipe(takeUntil(this.destroy$))
        .subscribe(async (user) => {
          await this.ngZone.run(async () => {
            console.log('🔐 Cambio en autenticación:', user ? `Usuario: ${user.uid}` : 'No user');
            this.user = user;

            if (user) {
              await this.procesarUsuarioAutenticado(user);
            } else {
              this.resetUserData();
              this.loading = false;
            }
          });
        });

      // Cargar frase motivacional
      this.loadFraseMotivacional();

    } catch (error) {
      console.error('❌ Error crítico en inicialización:', error);
      this.error = 'Error al cargar la aplicación';
      this.loading = false;
    }
  }

  // ✅ CORREGIDO: Procesar usuario autenticado
  private async procesarUsuarioAutenticado(user: User) {
    try {
      console.log('📊 Cargando datos del usuario:', user.uid);
      
      const usuario = await this.homeService.getUsuarioDataOnce(user.uid);
      
      if (!usuario) {
        console.error('❌ No se pudo cargar usuario');
        this.error = 'Error al cargar datos del usuario';
        this.loading = false;
        return;
      }

      this.usuarioData = usuario;
      this.userName = usuario.nombreUsuario || 'Usuario';

      console.log('✅ Usuario cargado:', {
        nombre: usuario.nombreUsuario,
        haCompletadoConfiguracionInicial: usuario.haCompletadoConfiguracionInicial
      });

      // ✅ CRÍTICO: Verificar configuración inicial - SOLO redirigir si NO está completada
      if (!usuario.haCompletadoConfiguracionInicial) {
        console.log('🔄 Usuario necesita configuración inicial, redirigiendo...');
        await this.showToast('Completa tu configuración inicial para comenzar', 'warning');
        
        this.ngZone.run(() => {
          this.router.navigate(['/indicators'], {
            queryParams: { setupInicial: 'true' },
            replaceUrl: true
          });
        });
        return;
      }

      console.log('✅ Usuario ya configurado, cargando datos...');
      
      // Cargar datos del día actual
      await this.cargarDatosDelDia(user.uid);
      
      this.loading = false;

    } catch (error) {
      console.error('❌ Error procesando usuario:', error);
      this.error = 'Error al cargar datos';
      this.loading = false;
    }
  }

  // ✅ CORREGIDO: Cargar datos del día actual
  private async cargarDatosDelDia(uid: string) {
    try {
      // Suscribirse al indicador de hoy
      this.homeService.getIndicadorHoy(uid)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (indicador: Indicador | null) => {
            this.ngZone.run(() => {
              if (indicador) {
                this.indicadorHoy = indicador;
                this.selectedEmotions = indicador.emociones || [];
                this.vasosAgua = indicador.vasosAgua || 0;
                this.updateEmotionButtons();
                console.log('✅ Indicador de hoy cargado:', indicador.id);
              } else {
                console.log('ℹ️ No hay indicador para hoy, iniciando nuevo día');
                this.resetDailyData();
              }
            });
          },
          error: (error: any) => {
            this.ngZone.run(() => {
              console.error('❌ Error cargando indicador:', error);
              this.showToast('Error al cargar datos del día', 'danger');
            });
          }
        });

      // Actualizar último acceso
      this.homeService.actualizarUltimoAcceso(uid);

    } catch (error) {
      console.error('❌ Error cargando datos del día:', error);
    }
  }

  // ✅ CORREGIDO: Cargar frase motivacional
  private loadFraseMotivacional() {
    this.homeService.getFraseMotivacional()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (frase: string) => {
          this.ngZone.run(() => {
            this.fraseMotivacional = frase;
          });
        },
        error: (error: any) => {
          console.error('Error cargando frase:', error);
          this.fraseMotivacional = 'Tu bienestar es tu mayor riqueza.';
        }
      });
  }

  // ============================================
  // ✅ INTERACCIÓN DEL USUARIO - CORREGIDO
  // ============================================

  async toggleEmotion(emotion: any) {
    if (!this.user) {
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

  // ✅ CORREGIDO: Guardar emociones
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

    this.homeService.guardarIndicadorDiarioConUid(
      this.user.uid,
      this.selectedEmotions,
      estadoAnimo,
      this.vasosAgua,
      this.indicadorHoy?.id
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (success: boolean) => {
        if (success) {
          console.log('✅ Emociones guardadas');
          this.showToast('Emociones guardadas correctamente', 'success');
        } else {
          this.showToast('Error al guardar las emociones', 'danger');
        }
      },
      error: (error: any) => {
        console.error('❌ Error guardando emociones:', error);
        this.showToast('Error al guardar las emociones', 'danger');
      }
    });
  }

  // ✅ CORREGIDO: Incrementar vasos de agua
  async incrementarVasosAgua() {
    if (!this.user) {
      await this.showAlert('Error', 'Debes iniciar sesión para registrar tu consumo de agua');
      return;
    }

    if (this.vasosAgua < 20) {
      this.vasosAgua++;

      console.log('💧 Incrementando vasos de agua a:', this.vasosAgua);

      this.homeService.actualizarVasosAguaConUid(
        this.user.uid,
        this.vasosAgua,
        this.indicadorHoy?.id
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (success: boolean) => {
          if (success) {
            console.log('✅ Vasos de agua actualizados:', this.vasosAgua);

            if (this.vasosAgua === this.metaVasosAgua) {
              this.showToast('¡Felicitaciones! Alcanzaste tu meta de agua 🎉', 'success');
            }
          }
        },
        error: (error: any) => {
          console.error('❌ Error actualizando vasos de agua:', error);
          this.vasosAgua--;
          this.showToast('Error al actualizar el agua', 'danger');
        }
      });
    }
  }

  // ✅ CORREGIDO: Decrementar vasos de agua
  async decrementarVasosAgua() {
    if (!this.user) return;

    if (this.vasosAgua > 0) {
      this.vasosAgua--;

      console.log('💧 Decrementando vasos de agua a:', this.vasosAgua);

      this.homeService.actualizarVasosAguaConUid(
        this.user.uid,
        this.vasosAgua,
        this.indicadorHoy?.id
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (error: any) => {
          console.error('❌ Error actualizando vasos de agua:', error);
          this.vasosAgua++;
        }
      });
    }
  }

  // ============================================
  // ✅ NAVEGACIÓN - CORREGIDO (AGREGAR MÉTODOS FALTANTES)
  // ============================================

  // ✅ AGREGADO: Método openProfileMenu que faltaba
  async openProfileMenu(event: any) {
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

  // ✅ AGREGADO: Método openProfile que faltaba
  openProfile() {
    this.showComingSoon('Perfil');
  }

  async openMainMenu() {
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
              // Ya estás en home
            }
          },
          // ✅ AGREGAR EJERCICIOS
          {
            text: 'Ejercicios',
            icon: 'barbell',
            handler: () => {
              this.router.navigate(['/ejercicios']);
            }
          },
          // ✅ AGREGAR NUTRICIÓN
          {
            text: 'Nutrición',
            icon: 'nutrition',
            handler: () => {
              this.router.navigate(['/planes']);
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
            text: 'Perfil',
            icon: 'person-outline',
            handler: () => {
              this.router.navigate(['/perfil']);
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

  openDailyRegister() {
    this.router.navigate(['/indicators']);
  }

  // ============================================
  // ✅ UTILIDADES - CORREGIDAS
  // ============================================

  private updateEmotionButtons() {
    this.emotionButtons.forEach(button => {
      button.selected = this.selectedEmotions.includes(button.value);
    });
  }

  private resetUserData() {
    this.userName = 'Usuario';
    this.usuarioData = null;
    this.resetDailyData();
  }

  private resetDailyData() {
    this.selectedEmotions = [];
    this.vasosAgua = 0;
    this.indicadorHoy = null;
    this.resetEmotionButtons();
  }

  private resetEmotionButtons() {
    this.emotionButtons.forEach(button => button.selected = false);
  }

  onLogoError() {
    console.log('Error cargando el logo');
  }

  // ============================================
  // ✅ MANEJO DE SESIÓN - CORREGIDO
  // ============================================

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

    } catch (error: any) {
      console.error('Error al cerrar sesión:', error);

      const loading = await this.loadingController.getTop();
      if (loading) {
        await loading.dismiss();
      }

      await this.showAlert('Error', 'No se pudo cerrar la sesión');
    }
  }

  // ============================================
  // ✅ UTILIDADES DE UI - CORREGIDAS
  // ============================================

  private async showToast(message: string, color: string = 'success') {
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

  // ✅ AGREGADO: Método showComingSoon que faltaba
  private async showComingSoon(feature: string) {
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

  // ✅ NUEVO: Método para recargar datos
  async recargarDatos() {
    this.loading = true;
    this.error = '';
    
    if (this.user) {
      await this.procesarUsuarioAutenticado(this.user);
    } else {
      this.loading = false;
    }
  }
}