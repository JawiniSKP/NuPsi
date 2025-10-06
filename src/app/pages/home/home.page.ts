import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { User } from 'firebase/auth';
import { IndicatorsService } from 'src/app/services/indicators.service';
import { AuthService } from 'src/app/services/auth.service';

// Importar módulos standalone
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
  IonItem,
  IonCheckbox,
  IonLabel,
  IonTabs,
  IonTabBar,
  IonTabButton
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { 
  bulbOutline, 
  waterOutline,
  home,
  calendar,
  chatbubble,
  people,
  person,
  personCircle,
  eyeOutline,
  eyeOffOutline
} from 'ionicons/icons';

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
    IonItem,
    IonCheckbox,
    IonLabel,
    IonTabs,
    IonTabBar,
    IonTabButton
  ]
})
export class HomePage implements OnInit {
  user: User | null = null;
  userName: string = 'María';
  currentDate: Date = new Date();
  
  private auth = inject(Auth);

  constructor(
    private indicators: IndicatorsService,
    private authService: AuthService,
    private router: Router
  ) {
    // AGREGAR TODOS LOS ICONOS NECESARIOS
    addIcons({ 
      bulbOutline, 
      waterOutline,
      home,
      calendar,
      chatbubble,
      people,
      person,
      personCircle,
      eyeOutline,
      eyeOffOutline
    });
  }

  async ngOnInit() {
    console.log('HomePage initialized');
    
    try {
      // Verificar autenticación inmediata
      const currentUser = this.auth.currentUser;
      console.log('Current user:', currentUser);
      
      if (currentUser) {
        this.user = currentUser;
        await this.loadUserData(currentUser.uid);
      }
      
      // Escuchar cambios en la autenticación
      this.authService.user.subscribe(async (user) => {
        console.log('Auth state changed:', user);
        this.user = user;
        if (user) {
          await this.loadUserData(user.uid);
        } else {
          this.userName = 'Usuario';
        }
      });
    } catch (error) {
      console.error('Error in ngOnInit:', error);
    }
  }

  async loadUserData(uid: string) {
    try {
      // Cargar nombre de usuario con manejo de errores
      const name = await this.authService.getCurrentUserName();
      this.userName = name || 'María';
      console.log('User name loaded:', this.userName);
    } catch (error) {
      console.error('Error loading user data:', error);
      this.userName = 'María'; // Valor por defecto
    }
  }

  // Métodos de navegación
  openProfile() {
    this.showComingSoon('Perfil');
  }

  openDailyRegister() {
    this.router.navigate(['/indicators']); // CORREGIDO: cambiado de '/progress' a '/indicators'
  }

  // Métodos para la navegación de tabs
  goToHome() {
    // Ya estamos en home
  }

  goToPlanes() {
    this.showComingSoon('Planes');
  }

  goToChatbot() {
    this.showComingSoon('Chatbot');
  }

  goToComunidad() {
    this.showComingSoon('Comunidad');
  }

  goToPerfil() {
    this.showComingSoon('Perfil');
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