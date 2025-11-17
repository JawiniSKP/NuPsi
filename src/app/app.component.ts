import { Component, OnInit, OnDestroy, inject, NgZone } from '@angular/core';
import { IonicModule, ToastController, LoadingController, AlertController, ActionSheetController } from '@ionic/angular';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Auth, authState, signOut } from '@angular/fire/auth';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

// Servicio de íconos
import { IconService } from './services/icon.service';

// IMPORTS DE CAPACITOR
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    RouterModule
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  private auth = inject(Auth);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private iconService = inject(IconService);
  
  private toastController = inject(ToastController);
  private loadingController = inject(LoadingController);
  private alertController = inject(AlertController);
  private actionSheetController = inject(ActionSheetController);

  private destroy$ = new Subject<void>();

  // Control de visibilidad del menú (simplificado)
  showMenu = false;
  showHeader = false;

  constructor() {
    console.log('🚀 AppComponent inicializado con íconos globales');
    this.initializeCapacitor();
  }

  ngOnInit() {
    this.setupRouteListener();
    this.setupBackButton();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 📱 INICIALIZAR CAPACITOR
   */
  private async initializeCapacitor() {
    if (Capacitor.isNativePlatform()) {
      console.log('📱 Ejecutando en plataforma nativa');
      
      try {
        // Configurar Status Bar
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#3880ff' });
        
        // Configurar Keyboard
        await Keyboard.setAccessoryBarVisible({ isVisible: false });
        
        console.log('✅ Capacitor configurado correctamente');
      } catch (error) {
        console.warn('⚠️ Error configurando Capacitor:', error);
      }
    } else {
      console.log('🌐 Ejecutando en navegador web');
    }
  }

  /**
   * 🔙 CONFIGURAR BOTÓN ATRÁS DE ANDROID
   */
  private setupBackButton() {
    if (Capacitor.isNativePlatform()) {
      App.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          this.showExitConfirmation();
        } else {
          window.history.back();
        }
      });
    }
  }

  /**
   * 🚪 CONFIRMACIÓN PARA SALIR DE LA APP
   */
  private async showExitConfirmation() {
    const alert = await this.alertController.create({
      header: 'Salir',
      message: '¿Estás seguro de que quieres salir de la aplicación?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Salir',
          handler: () => {
            App.exitApp();
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * 🎯 CONFIGURAR LISTENER DE RUTAS - SIMPLIFICADO
   */
  private setupRouteListener() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        const currentUrl = event.url;
        
        // Ocultar layout en login/register
        const hiddenLayoutRoutes = ['/login', '/register'];
        const shouldHideLayout = hiddenLayoutRoutes.includes(currentUrl);
        
        this.ngZone.run(() => {
          this.showHeader = !shouldHideLayout;
          this.showMenu = !shouldHideLayout;
        });
        
        console.log('📍 Ruta cambiada:', currentUrl, '| Mostrar layout:', !shouldHideLayout);
      });
  }

  /**
   * 🍔 ABRIR MENÚ HAMBURGUESA PRINCIPAL
   */
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
          text: 'Planes',
          icon: 'fitness',
          handler: () => {
            this.router.navigate(['/planes']);
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
   * 🚪 CERRAR SESIÓN
   */
  private async logout() {
    try {
      const loading = await this.loadingController.create({
        message: 'Cerrando sesión...'
      });
      await loading.present();

      await signOut(this.auth);
      
      await loading.dismiss();
      
      const toast = await this.toastController.create({
        message: 'Sesión cerrada correctamente',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
      
    } catch (error: any) {
      console.error('❌ Error al cerrar sesión:', error);
      await this.loadingController.dismiss();
      
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No se pudo cerrar la sesión: ' + (error.message || 'Error desconocido'),
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  /**
   * 🚧 MOSTRAR "PRÓXIMAMENTE"
   */
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
}