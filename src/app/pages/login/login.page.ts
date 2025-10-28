// src/app/pages/login/login.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
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
  IonList,
  IonSpinner,
  IonText
} from '@ionic/angular/standalone';
import { LoadingController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  eye, 
  eyeOff, 
  logoGoogle, 
  mailOutline, 
  lockClosedOutline,
  logInOutline,
  heart,
  checkmarkCircle,
  alertCircle
} from 'ionicons/icons';
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
    IonList,
    IonSpinner,
    IonText
  ]
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  logoLoaded = false;
  isLoggingIn = false;
  errorMessage = '';

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private auth = inject(Auth);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);
  private router = inject(Router);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    addIcons({ 
      eye, 
      eyeOff, 
      logoGoogle, 
      mailOutline, 
      lockClosedOutline,
      logInOutline,
      heart,
      checkmarkCircle,
      alertCircle
    });
  }

  ngOnInit() {
    this.checkLogo();
    
    const currentUser = this.auth.currentUser;
    if (currentUser) {
      console.log('✅ Usuario ya autenticado, redirigiendo al home...');
      this.router.navigate(['/home']);
    }
  }

  // ============================================
  // MÉTODOS DE LOGO
  // ============================================
  onLogoLoad() {
    this.logoLoaded = true;
  }

  onLogoError() {
    this.logoLoaded = false;
  }

  private async checkLogo() {
    try {
      const logoPath = 'assets/Nupsi/nupsiLogo.png';
      const img = new Image();
      img.onload = () => {
        this.logoLoaded = true;
      };
      img.onerror = () => {
        this.logoLoaded = false;
      };
      img.src = logoPath;
    } catch (error) {
      this.logoLoaded = false;
    }
  }

  // ============================================
  // LOGIN CON EMAIL Y CONTRASEÑA
  // ============================================
  async login() {
    this.errorMessage = '';

    if (!this.loginForm.valid) {
      this.errorMessage = 'Por favor completa todos los campos correctamente';
      this.showToast(this.errorMessage, 'warning');
      return;
    }

    this.isLoggingIn = true;

    try {
      const { email, password } = this.loginForm.value;
      
      console.log('🔑 Intentando login con:', email);
      
      const result = await this.authService.login(email, password);
      
      if (result && result.user) {
        console.log('✅ Login exitoso:', result.user.uid);
        
        await this.showToast('¡Bienvenido de nuevo! 👋', 'success');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 🎯 DIRECTO AL HOME - SIN VERIFICAR CONFIGURACIÓN INICIAL
        console.log('➡️ Redirigiendo directo al home...');
        this.router.navigate(['/home']);
      }
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      this.errorMessage = this.getErrorMessage(error.code);
      this.showToast(this.errorMessage, 'danger');
    } finally {
      this.isLoggingIn = false;
    }
  }

  // ============================================
  // LOGIN CON GOOGLE
  // ============================================
  async loginWithGoogle() {
    this.errorMessage = '';
    this.isLoggingIn = true;

    try {
      console.log('🔑 Intentando login con Google');
      
      const result = await this.authService.googleLogin();
      
      if (result && result.user) {
        console.log('✅ Login con Google exitoso:', result.user.uid);
        
        await this.showToast('¡Bienvenido! 🎉', 'success');
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // 🎯 DIRECTO AL HOME - SIN VERIFICAR CONFIGURACIÓN INICIAL
        console.log('➡️ Redirigiendo directo al home...');
        this.router.navigate(['/home']);
      }
    } catch (error: any) {
      console.error('❌ Error en Google login:', error);
      
      if (error.code !== 'auth/popup-closed-by-user' && 
          error.code !== 'auth/cancelled-popup-request') {
        this.errorMessage = this.getErrorMessage(error.code);
        this.showToast(this.errorMessage, 'danger');
      }
    } finally {
      this.isLoggingIn = false;
    }
  }

  // ============================================
  // MANEJO DE ERRORES MEJORADO
  // ============================================
  private getErrorMessage(errorCode: string): string {
    const errorMessages: { [key: string]: string } = {
      'auth/invalid-email': 'Email inválido',
      'auth/user-disabled': 'Cuenta deshabilitada',
      'auth/user-not-found': 'No existe una cuenta con este email',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/invalid-credential': 'Email o contraseña incorrectos',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
      'auth/popup-blocked': 'Habilita los popups para continuar',
      'auth/account-exists-with-different-credential': 'Este email ya existe con otro método de inicio de sesión'
    };

    return errorMessages[errorCode] || 'Error al iniciar sesión. Intenta nuevamente';
  }

  // ============================================
  // TOAST MODERNO (REEMPLAZA ALERTAS)
  // ============================================
  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: color,
      cssClass: 'custom-toast',
      buttons: [
        {
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  // ============================================
  // UTILIDADES
  // ============================================
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  clearError() {
    this.errorMessage = '';
  }
}