import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
  IonList,
  IonNote,
  AlertController,
  LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eye, eyeOff, logoGoogle, heart } from 'ionicons/icons';

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
    IonList,
    IonNote
  ]
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Registrar íconos
    addIcons({ eye, eyeOff, logoGoogle, heart });
  }

  ngOnInit() {
    // Si ya está autenticado, redirigir a home
    this.authService.user.subscribe(user => {
      if (user) {
        this.router.navigate(['/home']);
      }
    });
  }

  async login() {
    if (this.loginForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Iniciando sesión...'
      });
      await loading.present();

      try {
        const { email, password } = this.loginForm.value;
        await this.authService.login(email, password);
        await loading.dismiss();
        // La navegación se maneja dentro del auth.service
      } catch (error: any) {
        await loading.dismiss();
        this.showAlert('Error', this.getErrorMessage(error.code));
      }
    }
  }

  async loginWithGoogle() {
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
      'auth/invalid-email': 'El formato del email es inválido',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
      'auth/user-not-found': 'No existe una cuenta con este email',
      'auth/wrong-password': 'La contraseña es incorrecta',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      'auth/popup-closed-by-user': 'Cancelaste el inicio de sesión con Google',
      'auth/popup-blocked': 'El popup fue bloqueado. Permite popups para este sitio'
    };

    return errorMessages[errorCode] || 'Ocurrió un error inesperado';
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

  goToRegister() {
    this.router.navigate(['/register']);
  }
}