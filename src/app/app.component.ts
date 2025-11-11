import { Component, OnInit, OnDestroy, inject, NgZone } from '@angular/core';
import { IonicModule, ToastController, LoadingController, AlertController, ActionSheetController } from '@ionic/angular';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Auth, authState, signOut } from '@angular/fire/auth';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

// ✅ Servicio de íconos
import { IconService } from './services/icon.service';

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

  // Control de visibilidad del menú
  showMenu = false;
  showHeader = false;
  private authChecked = false; // ✅ NUEVO: Evitar redirecciones múltiples

  constructor() {
    console.log('🚀 AppComponent inicializado con íconos globales');
  }

  ngOnInit() {
    this.initializeAuthGuard();
    this.setupRouteListener();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 🎯 CONFIGURAR LISTENER DE RUTAS - SEGURO
   */
  private setupRouteListener() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        const currentUrl = event.url;
        
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
   * 🔒 GUARD DE AUTENTICACIÓN - VERSIÓN SEGURA
   */
  private initializeAuthGuard() {
    console.log('🔐 Inicializando guard de autenticación...');

    authState(this.auth)
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.ngZone.run(() => {
          this.handleAuthStateChange(user);
        });
      });
  }

  /**
   * 🔐 MANEJAR CAMBIOS DE AUTENTICACIÓN - VERSIÓN SEGURA
   */
  private handleAuthStateChange(user: any) {
    // ✅ EVITAR MÚLTIPLES EJECUCIONES
    if (this.authChecked) {
      return;
    }

    const currentUrl = this.router.url;
    console.log('👤 Estado de auth:', user ? 'Autenticado' : 'No autenticado', '| URL:', currentUrl);

    // ✅ SOLO REDIRIGIR EN CASOS MUY ESPECÍFICOS
    if (!user) {
      // Usuario NO autenticado
      if (this.isProtectedRoute(currentUrl)) {
        console.log('🚫 Redirigiendo a login desde ruta protegida');
        this.safeNavigate(['/login']);
      }
    } else {
      // Usuario SÍ autenticado
      if (this.isAuthRoute(currentUrl)) {
        console.log('🏠 Redirigiendo a home desde ruta de auth');
        this.safeNavigate(['/home']);
      }
    }

    this.authChecked = true;
  }

  /**
   * ✅ NUEVO: Método seguro para navegación
   */
  private safeNavigate(commands: any[]) {
    this.ngZone.run(() => {
      // Verificar que no estamos ya en esa ruta
      const currentUrl = this.router.url;
      const targetUrl = commands[0];
      
      if (currentUrl !== targetUrl) {
        this.router.navigate(commands);
      }
    });
  }

  /**
   * ✅ NUEVO: Verificar si es ruta protegida
   */
  private isProtectedRoute(url: string): boolean {
    const protectedRoutes = ['/home', '/indicators', '/profile', '/settings', '/chat', '/planes', '/perfil'];
    return protectedRoutes.some(route => url.startsWith(route));
  }

  /**
   * ✅ NUEVO: Verificar si es ruta de autenticación
   */
  private isAuthRoute(url: string): boolean {
    const authRoutes = ['/login', '/register', '/'];
    return authRoutes.includes(url);
  }

  /**
   * 🍔 ABRIR MENÚ HAMBURGUESA PRINCIPAL
   */
  async openMainMenu() {
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
   * 👤 ABRIR MENÚ DE PERFIL
   */
  async openProfileMenu(event: any) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Mi Perfil',
      buttons: [
        {
          text: 'Ver Perfil',
          icon: 'person-outline',
          handler: () => {
            this.router.navigate(['/perfil']);
          }
        },
        {
          text: 'Editar Perfil',
          icon: 'create-outline',
          handler: () => {
            this.router.navigate(['/perfil']);
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
   * 🚪 CERRAR SESIÓN - VERSIÓN SEGURA
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
      
      // ✅ Resetear flag de autenticación
      this.authChecked = false;
      
      this.ngZone.run(() => {
        this.router.navigate(['/login']);
      });
      
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
    const alert = await this.alertController.create({
      header: 'Próximamente',
      message: `${feature} estará disponible en la próxima actualización.`,
      buttons: ['OK']
    });

    await alert.present();
  }
}