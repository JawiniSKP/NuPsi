import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
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
  IonList,
  IonNote,
  AlertController,
  LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eye, eyeOff, logoGoogle, heart } from 'ionicons/icons';

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
    IonList,
    IonNote
  ]
})
export class RegisterPage {
  registerForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    // Registrar íconos
    addIcons({ eye, eyeOff, logoGoogle, heart });
  }

  // Validador personalizado para verificar que las contraseñas coincidan
  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      confirmPassword?.setErrors(null);
    }
    return null;
  }

  async register() {
    if (this.registerForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Creando tu cuenta...'
      });
      await loading.present();

      try {
        const { name, email, password } = this.registerForm.value;
        // 🔄 MODIFICADO: Pasar el nombre al servicio de registro
        await this.authService.register(email, password, name);
        await loading.dismiss();
        // La navegación se maneja dentro del auth.service
      } catch (error: any) {
        await loading.dismiss();
        this.showAlert('Error', this.getErrorMessage(error.code));
      }
    }
  }

  async registerWithGoogle() {
    const loading = await this.loadingController.create({
      message: 'Conectando con Google...'
    });
    await loading.present();

    try {
      await this.authService.googleLogin();
      await loading.dismiss();
      // La navegación se maneja dentro del auth.service
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
      'auth/popup-blocked': 'El popup fue bloqueado. Permite popups para este sitio'
    };

    return errorMessages[errorCode] || 'Ocurrió un error durante el registro';
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Navegar al login
  goToLogin() {
    this.router.navigate(['/login']);
  }
}