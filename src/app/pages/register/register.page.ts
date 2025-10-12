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
  IonButtons,
  IonBackButton,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonNote
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
  lockClosedOutline, 
  personOutline
} from 'ionicons/icons';

// ✅ Importaciones corregidas
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import type { AbstractControl } from '@angular/forms';

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
    IonNote
  ]
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  logoLoaded = false;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private alertController = inject(AlertController);
  private loadingController = inject(LoadingController);
  private router = inject(Router);

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    // Registrar íconos
    addIcons({ 
      eye, 
      eyeOff, 
      logoGoogle, 
      mailOutline, 
      lockClosedOutline, 
      personOutline
    });
  }

  ngOnInit() {
    this.checkLogo();
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

  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      confirmPassword?.setErrors(null);
    }
    return null;
  }

  async register() {
    if (this.registerForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Creando tu cuenta...',
        spinner: 'crescent'
      });
      await loading.present();

      try {
        const { name, email, password } = this.registerForm.value;
        await this.authService.register(email, password, name);
        await loading.dismiss();
      } catch (error: any) {
        await loading.dismiss();
        this.showAlert('Error', this.getErrorMessage(error.code));
      }
    }
  }

  async registerWithGoogle() {
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
      'auth/email-already-in-use': 'Este email ya está registrado',
      'auth/invalid-email': 'El formato del email es inválido',
      'auth/operation-not-allowed': 'Esta operación no está permitida',
      'auth/weak-password': 'La contraseña es muy débil',
      'auth/popup-closed-by-user': 'Cancelaste el registro con Google',
      'auth/popup-blocked': 'El popup fue bloqueado. Permite popups para este sitio',
      'auth/network-request-failed': 'Error de conexión. Verifica tu internet'
    };

    return errorMessages[errorCode] || 'Ocurrió un error durante el registro. Intenta nuevamente.';
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

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  goToLogin() {
    this.router.navigate(['/login']);
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