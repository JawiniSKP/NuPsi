import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// Importar componentes Ionic individualmente
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonNote,
  IonList
} from '@ionic/angular/standalone';
import { 
  AlertController, 
  LoadingController 
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  eye, 
  eyeOff, 
  logoGoogle, 
  mailOutline, 
  lockClosedOutline
} from 'ionicons/icons';

// ✅ Importaciones corregidas
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonNote,
    IonList
  ]
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  logoLoaded = false;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private alertController = inject(AlertController);
  private loadingController = inject(LoadingController);
  private router = inject(Router);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Registrar íconos
    addIcons({ 
      eye, 
      eyeOff, 
      logoGoogle, 
      mailOutline, 
      lockClosedOutline
    });
  }

  ngOnInit() {
    this.checkLogo();
    
    this.authService.user.subscribe(user => {
      if (user) {
        this.router.navigate(['/home']);
      }
    });
  }

  // ✅ MÉTODOS FALTANTES AGREGADOS
  onLogoLoad() {
    console.log('✅ Logo de NuPsi cargado correctamente');
    this.logoLoaded = true;
  }

  onLogoError() {
    console.log('⚠️ No se pudo cargar el logo, usando fallback');
    this.logoLoaded = false;
  }

  async login() {
    if (this.loginForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Iniciando sesión...',
        spinner: 'crescent'
      });
      await loading.present();

      try {
        const { email, password } = this.loginForm.value;
        await this.authService.login(email, password);
        await loading.dismiss();
      } catch (error: any) {
        await loading.dismiss();
        this.showAlert('Error', this.getErrorMessage(error.code));
      }
    }
  }

  async loginWithGoogle() {
    const loading = await this.loadingController.create({
      message: 'Conectando con Google...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      await this.authService.googleLogin();
      await loading.dismiss();
    } catch (error: any) {
      await loading.dismiss();
      this.showAlert('Error', this.getErrorMessage(error.code));
    }
  }

  private getErrorMessage(errorCode: string): string {
    const errorMessages: { [key: string]: string } = {
      'auth/invalid-email': 'El formato del email es inválido',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
      'auth/user-not-found': 'No existe una cuenta con este email',
      'auth/wrong-password': 'La contraseña es incorrecta',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      'auth/popup-closed-by-user': 'Cancelaste el inicio de sesión con Google',
      'auth/popup-blocked': 'El popup fue bloqueado. Permite popups para este sitio',
      'auth/network-request-failed': 'Error de conexión. Verifica tu internet'
    };

    return errorMessages[errorCode] || 'Ocurrió un error inesperado. Intenta nuevamente.';
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['Entendido']
    });
    await alert.present();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  private async checkLogo() {
    try {
      const logoPath = 'assets/Nupsi/nupsiLogo.png';
      const img = new Image();
      img.onload = () => {
        this.logoLoaded = true;
        console.log('🎯 Logo encontrado en:', logoPath);
      };
      img.onerror = () => {
        this.logoLoaded = false;
        console.warn('📁 Logo no encontrado en:', logoPath);
      };
      img.src = logoPath;
    } catch (error) {
      console.error('Error verificando logo:', error);
      this.logoLoaded = false;
    }
  }
}