import { Component, OnInit, inject, NgZone } from '@angular/core'; // ✅ NgZone AGREGADO
import { AuthService } from '../../services/auth.service';
import { HomeService } from '../../services/home.service';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonNote,
  IonSpinner
} from '@ionic/angular/standalone';
import { LoadingController, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import type { AbstractControl } from '@angular/forms';

// ✅ ELIMINADO: addIcons individual - Ya está en el servicio global
// import { addIcons } from 'ionicons';
// import { ... } from 'ionicons/icons';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonNote,
    IonSpinner
  ]
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  logoLoaded = false;
  isRegistering = false;
  errorMessage = '';

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private homeService = inject(HomeService);
  private auth = inject(Auth);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);
  private router = inject(Router);
  private ngZone = inject(NgZone); // ✅ NgZone AGREGADO

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    // ✅ ELIMINADO: addIcons individual - Usa servicio global
  }

  ngOnInit() {
    this.checkLogo();
    
    const currentUser = this.auth.currentUser;
    if (currentUser) {
      console.log('✅ Usuario ya autenticado, verificando estado...');
      this.redirectAfterRegister(currentUser.uid);
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
  // VALIDADOR DE CONTRASEÑAS
  // ============================================
  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      const errors = confirmPassword?.errors;
      if (errors) {
        delete errors['passwordMismatch'];
        confirmPassword?.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
    }
    return null;
  }

  // ============================================
  // REGISTRO CON EMAIL Y CONTRASEÑA
  // ============================================
  async register() {
    this.errorMessage = '';

    if (!this.registerForm.valid) {
      this.errorMessage = 'Por favor completa todos los campos correctamente';
      this.showToast(this.errorMessage, 'warning');
      return;
    }

    this.isRegistering = true;

    try {
      const { name, email, password } = this.registerForm.value;
      
      console.log('📝 Registrando nuevo usuario:', email);
      
      const result = await this.authService.register(email, password, name);
      
      if (result && result.user) {
        console.log('✅ Registro exitoso:', result.user.uid);
        
        await this.showToast('¡Cuenta creada exitosamente! 🎉', 'success');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // ✅ CORREGIDO: Navegación dentro de NgZone
        this.ngZone.run(() => {
          this.redirectAfterRegister(result.user.uid);
        });
      }
    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      this.errorMessage = this.getErrorMessage(error.code);
      this.showToast(this.errorMessage, 'danger');
    } finally {
      this.isRegistering = false;
    }
  }

  // ============================================
  // REGISTRO CON GOOGLE
  // ============================================
  async registerWithGoogle() {
    this.errorMessage = '';
    this.isRegistering = true;

    try {
      console.log('🔑 Registrando con Google');
      
      const result = await this.authService.googleLogin();
      
      if (result && result.user) {
        console.log('✅ Registro con Google exitoso:', result.user.uid);
        
        await this.showToast('¡Bienvenido! 🎉', 'success');
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // ✅ CORREGIDO: Navegación dentro de NgZone
        this.ngZone.run(() => {
          this.redirectAfterRegister(result.user.uid);
        });
      }
    } catch (error: any) {
      console.error('❌ Error en registro con Google:', error);
      
      if (error.code !== 'auth/popup-closed-by-user' && 
          error.code !== 'auth/cancelled-popup-request') {
        this.errorMessage = this.getErrorMessage(error.code);
        this.showToast(this.errorMessage, 'danger');
      }
    } finally {
      this.isRegistering = false;
    }
  }

  // ============================================
  // 🎯 REDIRECCIÓN DESPUÉS DEL REGISTRO
  // ============================================
  private async redirectAfterRegister(uid: string) {
    console.log('🔄 Verificando estado del usuario registrado:', uid);
    
    try {
      const necesitaConfig = await this.homeService.necesitaConfiguracionInicial(uid);
      
      if (necesitaConfig) {
        console.log('📝 Usuario NUEVO → Ir a configuración inicial');
        
        // ✅ CORREGIDO: Navegación dentro de NgZone
        this.ngZone.run(() => {
          this.router.navigate(['/indicators'], { 
            queryParams: { setupInicial: 'true' }
          });
        });
      } else {
        console.log('✅ Usuario EXISTENTE (Google) → Ya tiene configuración, ir al home');
        
        // ✅ CORREGIDO: Navegación dentro de NgZone
        this.ngZone.run(() => {
          this.router.navigate(['/home']);
        });
      }
    } catch (error) {
      console.error('❌ Error verificando configuración, enviando a indicators por seguridad');
      
      // ✅ CORREGIDO: Navegación dentro de NgZone
      this.ngZone.run(() => {
        this.router.navigate(['/indicators'], { 
          queryParams: { setupInicial: 'true' }
        });
      });
    }
  }

  // ============================================
  // MANEJO DE ERRORES MEJORADO
  // ============================================
  private getErrorMessage(errorCode: string): string {
    const errorMessages: { [key: string]: string } = {
      'auth/email-already-in-use': 'Este email ya está registrado',
      'auth/invalid-email': 'Email inválido',
      'auth/operation-not-allowed': 'Operación no permitida',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
      'auth/invalid-credential': 'Credenciales inválidas',
      'auth/account-exists-with-different-credential': 'Este email ya existe con otro método de registro',
      'auth/popup-blocked': 'Habilita los popups para continuar'
    };

    return errorMessages[errorCode] || 'Error al crear la cuenta. Intenta nuevamente';
  }

  // ============================================
  // TOAST MODERNO
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

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  goToLogin() {
    // ✅ CORREGIDO: Navegación dentro de NgZone
    this.ngZone.run(() => {
      this.router.navigate(['/login']);
    });
  }

  clearError() {
    this.errorMessage = '';
  }
}