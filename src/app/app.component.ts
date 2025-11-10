//app.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Auth, onAuthStateChanged, signOut } from '@angular/fire/auth';
import { filter } from 'rxjs/operators';
import { addIcons } from 'ionicons';
import {
  happy,
  happyOutline,
  sad,
  sadOutline,
  warning,
  removeOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  personAddOutline,
  home,
  statsChart,
  chatbubble,
  person,
  personCircleOutline,
  menu,
  logOutOutline,
  settingsOutline,
  personOutline,
  close,
  createOutline,
  analytics,
  swapHorizontal,
  fitness,
  arrowBack,
  alertCircle,
  waterOutline,
  documentOutline,
  resizeOutline,
  heartOutline
} from 'ionicons/icons';
import { MenuComponent } from './components/menu/menu.component';

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
export class AppComponent implements OnInit {
  // ✅ CORRECTO: Inyección de dependencias al inicio
  private auth = inject(Auth);
  private router = inject(Router);

  // Control de visibilidad del menú
  showMenu = false;
  showHeader = false;

  constructor() {
    addIcons({
      'happy': happy,
      'happy-outline': happyOutline,
      'sad': sad,
      'sad-outline': sadOutline,
      'warning': warning,
      'remove-outline': removeOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'close-circle-outline': closeCircleOutline,
      'person-add-outline': personAddOutline,
      'home': home,
      'stats-chart': statsChart,
      'chatbubble': chatbubble,
      'person': person,
      'person-circle-outline': personCircleOutline,
      'menu': menu,
      'log-out-outline': logOutOutline,
      'settings-outline': settingsOutline,
      'person-outline': personOutline,
      'close': close,
      'create-outline': createOutline,
      'analytics': analytics,
      'swap-horizontal': swapHorizontal,
      'fitness': fitness,
      'arrow-back': arrowBack,
      'alert-circle': alertCircle,
      'water-outline': waterOutline,
      'document-outline': documentOutline,
      'resize-outline': resizeOutline,
      'heart-outline': heartOutline
    });
  }

  ngOnInit() {
    this.initializeAuthGuard();
    this.setupRouteListener();
  }

  /**
   * 🎯 CONFIGURAR LISTENER DE RUTAS
   */
  private setupRouteListener() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const currentUrl = event.url;
        
        // Rutas donde NO mostrar header ni menu
        const hiddenLayoutRoutes = ['/login', '/register'];
        const shouldHideLayout = hiddenLayoutRoutes.includes(currentUrl);
        
        this.showHeader = !shouldHideLayout;
        this.showMenu = !shouldHideLayout;
        
        console.log('📍 Ruta cambiada:', currentUrl, '| Mostrar layout:', !shouldHideLayout);
      });
  }

  /**
   * 🔒 GUARD DE AUTENTICACIÓN GLOBAL - CORREGIDO
   */
  private initializeAuthGuard() {
    console.log('🔐 Inicializando guard de autenticación...');

    // ✅ CORREGIDO: onAuthStateChanged dentro del contexto del componente
    onAuthStateChanged(this.auth, (user) => {
      const currentUrl = this.router.url;
      console.log('👤 Estado de auth cambió. Usuario:', user?.uid || 'No autenticado', '| URL actual:', currentUrl);

      // Rutas públicas (no requieren autenticación)
      const publicRoutes = ['/', '/login', '/register'];
      const isPublicRoute = publicRoutes.includes(currentUrl);

      // Rutas protegidas (requieren autenticación)
      const protectedRoutes = ['/home', '/indicators', '/profile', '/settings', '/chat', '/planes'];
      const isProtectedRoute = protectedRoutes.some(route => currentUrl.startsWith(route));

      if (!user) {
        // ❌ Usuario NO autenticado
        if (isProtectedRoute) {
          console.log('🚫 Acceso denegado - Redirigiendo a login');
          this.router.navigate(['/login']);
        } else if (currentUrl === '/') {
          console.log('🏠 Primera carga - Redirigiendo a login');
          this.router.navigate(['/login']);
        }
      } else {
        // ✅ Usuario autenticado
        if (isPublicRoute && currentUrl !== '/') {
          console.log('✅ Usuario autenticado en ruta pública');
        }
        
        // Redirigir a home si está en login/register
        if (['/login', '/register', '/'].includes(currentUrl)) {
          console.log('🏠 Redirigiendo a home desde ruta pública');
          this.router.navigate(['/home']);
        }
      }
    });
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
        text: 'Planes',
        icon: 'fitness',
        handler: () => {
          this.router.navigate(['/planes']);
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
    
    actionSheet.header = 'Mi Perfil';
    actionSheet.buttons = [
      {
        text: 'Ver Perfil',
        icon: 'person-outline',
        handler: () => {
          this.router.navigate(['/profile']);
        }
      },
      {
        text: 'Editar Perfil',
        icon: 'create-outline',
        handler: () => {
          this.showComingSoon('Editar Perfil');
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
   * 🚪 CERRAR SESIÓN - CORREGIDO
   */
  private async logout() {
    try {
      const loading = document.createElement('ion-loading');
      loading.message = 'Cerrando sesión...';
      document.body.appendChild(loading);
      await loading.present();

      // ✅ CORREGIDO: signOut dentro del contexto del componente
      await signOut(this.auth);
      
      // Dismiss loading y navegar
      await loading.dismiss();
      
      // Mostrar mensaje de éxito
      const toast = document.createElement('ion-toast');
      toast.message = 'Sesión cerrada correctamente';
      toast.duration = 2000;
      toast.color = 'success';
      document.body.appendChild(toast);
      await toast.present();
      
      // Redirigir al login
      this.router.navigate(['/login']);
      
    } catch (error: any) {
      console.error('❌ Error al cerrar sesión:', error);
      
      // Dismiss loading si existe
      const loading = document.querySelector('ion-loading');
      if (loading) {
        await (loading as any).dismiss();
      }
      
      // Mostrar error
      const alert = document.createElement('ion-alert');
      alert.header = 'Error';
      alert.message = 'No se pudo cerrar la sesión: ' + (error.message || 'Error desconocido');
      alert.buttons = ['OK'];
      document.body.appendChild(alert);
      await alert.present();
    }
  }

  /**
   * 🚧 MOSTRAR "PRÓXIMAMENTE"
   */
  private async showComingSoon(feature: string) {
    const alert = document.createElement('ion-alert');
    alert.header = 'Próximamente';
    alert.message = `${feature} estará disponible en la próxima actualización.`;
    alert.buttons = ['OK'];

    document.body.appendChild(alert);
    await alert.present();
  }
}