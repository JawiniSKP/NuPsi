import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonSpinner,
  IonIcon,
  IonNote,
  IonList,
  IonAlert
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonSpinner,
    IonIcon,
    IonNote,
    IonList,
    IonAlert
  ]
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  isLoggingIn = false;
  showPassword = false;
  errorMessage = '';
  logoLoaded = false;
  showGoogleAlert = false;
  googleAlertMessage = '';

  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    this.toggleFormDisabled(false);
  }

  // ✅ NUEVA PROPIEDAD PARA DETECTAR SI ES APP MÓVIL
  get isNativeApp(): boolean {
    return Capacitor.isNativePlatform();
  }

  toggleFormDisabled(disabled: boolean) {
    if (disabled) {
      this.loginForm.get('email')?.disable();
      this.loginForm.get('password')?.disable();
    } else {
      this.loginForm.get('email')?.enable();
      this.loginForm.get('password')?.enable();
    }
  }

  async login() {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoggingIn = true;
    this.errorMessage = '';
    this.toggleFormDisabled(true);

    const { email, password } = this.loginForm.value;

    console.log('🔑 Intentando login con:', email);

    try {
      const result = await this.authService.login(email, password);
      console.log('✅ Login exitoso:', result.user.uid);
      
      this.router.navigate(['/home']);

    } catch (error: any) {
      console.error('❌ Error en login:', error);
      this.handleLoginError(error);
    } finally {
      this.isLoggingIn = false;
      this.toggleFormDisabled(false);
    }
  }

  async loginWithGoogle() {
    this.isLoggingIn = true;
    this.errorMessage = '';
    this.toggleFormDisabled(true);

    try {
      const result = await this.authService.googleLogin();
      console.log('✅ Google login exitoso:', result.user.uid);
      
      this.router.navigate(['/home']);

    } catch (error: any) {
      console.error('❌ Error en Google login:', error);
      
      // ✅ MANEJO ESPECIAL PARA ERROR DE ANDROID
      if (error.message.includes('app móvil está en actualización')) {
        this.showGoogleAlert = true;
        this.googleAlertMessage = error.message;
      } else {
        this.handleGoogleLoginError(error);
      }
      
    } finally {
      this.isLoggingIn = false;
      this.toggleFormDisabled(false);
    }
  }

  private handleLoginError(error: any) {
    let message = 'Error al iniciar sesión';
    
    switch (error.code) {
      case 'auth/invalid-email':
        message = 'El formato del email es inválido';
        break;
      case 'auth/user-disabled':
        message = 'Esta cuenta ha sido deshabilitada';
        break;
      case 'auth/user-not-found':
        message = 'No existe una cuenta con este email';
        break;
      case 'auth/wrong-password':
        message = 'La contraseña es incorrecta';
        break;
      case 'auth/too-many-requests':
        message = 'Demasiados intentos fallidos. Intenta más tarde';
        break;
      case 'auth/network-request-failed':
        message = 'Error de conexión. Verifica tu internet';
        break;
      default:
        message = error.message || 'Error desconocido';
    }
    
    this.errorMessage = message;
  }

  private handleGoogleLoginError(error: any) {
    let message = 'Error al iniciar sesión con Google';
    
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        message = 'El popup de Google fue cerrado';
        break;
      case 'auth/popup-blocked':
        message = 'El popup de Google fue bloqueado. Permite popups para este sitio';
        break;
      case 'auth/unauthorized-domain':
        message = 'Dominio no autorizado para Google Sign-In';
        break;
      case 'auth/network-request-failed':
        message = 'Error de conexión. Verifica tu internet';
        break;
      default:
        message = error.message || 'Error desconocido con Google Sign-In';
    }
    
    this.errorMessage = message;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  clearError() {
    this.errorMessage = '';
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  onLogoLoad() {
    this.logoLoaded = true;
    console.log('✅ Logo cargado correctamente');
  }

  onLogoError() {
    this.logoLoaded = false;
    console.log('❌ Error cargando el logo');
  }

  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}