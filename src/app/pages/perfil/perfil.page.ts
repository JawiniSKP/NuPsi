import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { doc, docData, updateDoc, Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { User } from 'firebase/auth';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class PerfilPage implements OnInit, OnDestroy {
  user: any = {
    nombreUsuario: '',
    correo: '',
    fotoURL: '',
    configuracionPlanes: {
      nivelActividad: '',
      objetivoCaloricoPersonalizado: 0,
      dificultadEjercicio: '',
      metaEjercicioSemanal: 0,
      alimentosFavoritos: [],
      alimentosEvitar: [],
      restriccionesAlimentarias: [],
      tiposEjercicioPreferidos: []
    }
  };

  // ✅ PROPIEDADES PARA INPUTS
  nuevoAlimentoFavorito: string = '';
  nuevoAlimentoEvitar: string = '';

  isEditing = false;
  isLoading = true;
  originalUserData: any;
  currentUser: User | null = null;

  // Opciones para selects
  nivelesActividad = [
    { value: 'sedentario', label: 'Sedentario' },
    { value: 'ligero', label: 'Ligero' },
    { value: 'moderado', label: 'Moderado' },
    { value: 'activo', label: 'Activo' },
    { value: 'muy-activo', label: 'Muy Activo' }
  ];

  dificultadesEjercicio = [
    { value: 'principiante', label: 'Principiante' },
    { value: 'intermedio', label: 'Intermedio' },
    { value: 'avanzado', label: 'Avanzado' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    public authService: AuthService,
    private firestore: Firestore,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadUserData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadUserData() {
    try {
      // ✅ CORREGIDO: Suscribirse al Observable y obtener el User real
      this.authService.user
        .pipe(takeUntil(this.destroy$))
        .subscribe(async (user) => {
          if (user) {
            this.currentUser = user;
            await this.loadUserDataFromFirestore(user.uid);
          } else {
            console.warn('⚠️ No hay usuario autenticado');
            this.isLoading = false;
          }
        });
    } catch (error) {
      console.error('❌ Error cargando datos del usuario:', error);
      this.isLoading = false;
    }
  }

  // ✅ NUEVO MÉTODO: Cargar datos desde Firestore usando el UID real
  private async loadUserDataFromFirestore(uid: string) {
    try {
      const userDoc = doc(this.firestore, 'usuarios', uid);
      docData(userDoc).subscribe({
        next: (userData: any) => {
          console.log('📊 Datos del usuario cargados:', userData);
          
          this.user = {
            nombreUsuario: userData.nombreUsuario || '',
            correo: userData.correo || '',
            fotoURL: userData.fotoURL || '',
            proveedorAuth: userData.proveedorAuth || 'google',
            configuracionPlanes: {
              // ✅ CARGAR CAMPOS EXISTENTES Y NUEVOS
              nivelActividad: userData.configuracionPlanes?.nivelActividad || 'moderado',
              objetivoCaloricoPersonalizado: userData.configuracionPlanes?.objetivoCaloricoPersonalizado || 2000,
              dificultadEjercicio: userData.configuracionPlanes?.dificultadEjercicio || 'principiante',
              metaEjercicioSemanal: userData.configuracionPlanes?.metaEjercicioSemanal || 150,
              
              // ✅ CARGAR ARRAYS DE ALIMENTOS (pueden no existir aún)
              alimentosFavoritos: userData.configuracionPlanes?.alimentosFavoritos || [],
              alimentosEvitar: userData.configuracionPlanes?.alimentosEvitar || [],
              restriccionesAlimentarias: userData.configuracionPlanes?.restriccionesAlimentarias || [],
              tiposEjercicioPreferidos: userData.configuracionPlanes?.tiposEjercicioPreferidos || []
            }
          };
          
          this.originalUserData = JSON.parse(JSON.stringify(this.user));
          this.isLoading = false;
          console.log('✅ Usuario cargado correctamente:', this.user);
        },
        error: (error) => {
          console.error('❌ Error cargando datos del usuario:', error);
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('❌ Error en loadUserDataFromFirestore:', error);
      this.isLoading = false;
    }
  }

  async saveProfile() {
    if (!this.currentUser) {
      await this.presentToast('No hay usuario autenticado', 'error');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Guardando cambios...'
    });
    await loading.present();

    try {
      const userDoc = doc(this.firestore, 'usuarios', this.currentUser.uid);
      
      // ✅ CORREGIDO: Estructura que mantiene campos existentes y agrega nuevos
      const updateData: any = {
        ultimaActualizacion: new Date()
      };

      // Actualizar nombre si cambió
      if (this.user.nombreUsuario !== this.originalUserData.nombreUsuario) {
        updateData.nombreUsuario = this.user.nombreUsuario;
        // También actualizar en Auth
        await this.authService.updateUserProfile(this.user.nombreUsuario, this.user.fotoURL);
      }

      // ✅ ESTRUCTURA COMPLETA DE configuracionPlanes
      updateData.configuracionPlanes = {
        // ✅ MANTENER campos existentes de Firebase
        activo: this.originalUserData.configuracionPlanes?.activo ?? true,
        dietaSeleccionada: this.originalUserData.configuracionPlanes?.dietaSeleccionada || 'alta_proteina',
        duracionPlan: this.originalUserData.configuracionPlanes?.duracionPlan || '70',
        fechaInicio: this.originalUserData.configuracionPlanes?.fechaInicio || new Date(),
        objetivoCaloricoPersonalizado: this.user.configuracionPlanes.objetivoCaloricoPersonalizado,
        progreso: this.originalUserData.configuracionPlanes?.progreso || {},
        
        // ✅ AGREGAR nuevos campos del perfil
        nivelActividad: this.user.configuracionPlanes.nivelActividad,
        dificultadEjercicio: this.user.configuracionPlanes.dificultadEjercicio,
        metaEjercicioSemanal: this.user.configuracionPlanes.metaEjercicioSemanal,
        alimentosFavoritos: this.user.configuracionPlanes.alimentosFavoritos,
        alimentosEvitar: this.user.configuracionPlanes.alimentosEvitar,
        restriccionesAlimentarias: this.user.configuracionPlanes.restriccionesAlimentarias,
        tiposEjercicioPreferidos: this.user.configuracionPlanes.tiposEjercicioPreferidos,
        ultimaActualizacion: new Date()
      };

      console.log('💾 Guardando datos:', updateData);
      await updateDoc(userDoc, updateData);
      
      await loading.dismiss();
      await this.presentToast('Perfil actualizado correctamente', 'success');
      this.isEditing = false;
    } catch (error) {
      await loading.dismiss();
      console.error('❌ Error guardando perfil:', error);
      await this.presentToast('Error al actualizar el perfil', 'error');
    }
  }

  // ✅ MÉTODOS PARA ALIMENTOS
  agregarAlimentoFavorito() {
    if (this.nuevoAlimentoFavorito.trim()) {
      const alimento = this.nuevoAlimentoFavorito.trim();
      if (!this.user.configuracionPlanes.alimentosFavoritos.includes(alimento)) {
        this.user.configuracionPlanes.alimentosFavoritos.push(alimento);
        this.nuevoAlimentoFavorito = '';
      }
    }
  }

  agregarAlimentoEvitar() {
    if (this.nuevoAlimentoEvitar.trim()) {
      const alimento = this.nuevoAlimentoEvitar.trim();
      if (!this.user.configuracionPlanes.alimentosEvitar.includes(alimento)) {
        this.user.configuracionPlanes.alimentosEvitar.push(alimento);
        this.nuevoAlimentoEvitar = '';
      }
    }
  }

  removeAlimentoFavorito(index: number) {
    this.user.configuracionPlanes.alimentosFavoritos.splice(index, 1);
  }

  removeAlimentoEvitar(index: number) {
    this.user.configuracionPlanes.alimentosEvitar.splice(index, 1);
  }

  // ✅ MÉTODOS DE SEGURIDAD
  async changePassword() {
    if (!this.currentUser) {
      await this.presentToast('No hay usuario autenticado', 'error');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Cambiar Contraseña',
      inputs: [
        {
          name: 'newPassword',
          type: 'password',
          placeholder: 'Nueva contraseña',
          attributes: { minlength: 6 }
        },
        {
          name: 'confirmPassword',
          type: 'password',
          placeholder: 'Confirmar nueva contraseña',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Cambiar',
          handler: async (data) => {
            if (data.newPassword !== data.confirmPassword) {
              await this.presentToast('Las contraseñas no coinciden', 'error');
              return false;
            }
            await this.updatePassword(data.newPassword);
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async updatePassword(newPassword: string) {
    const loading = await this.loadingController.create({
      message: 'Cambiando contraseña...'
    });
    await loading.present();

    try {
      await this.authService.updatePassword(newPassword);
      await loading.dismiss();
      await this.presentToast('Contraseña actualizada correctamente', 'success');
    } catch (error: any) {
      await loading.dismiss();
      await this.presentToast(`Error: ${error.message}`, 'error');
    }
  }

  async deleteAccount() {
    if (!this.currentUser) {
      await this.presentToast('No hay usuario autenticado', 'error');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Eliminar Cuenta',
      message: '¿Estás seguro? Esta acción no se puede deshacer y se perderán todos tus datos.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.confirmDeleteAccount()
        }
      ]
    });
    await alert.present();
  }

  async confirmDeleteAccount() {
    if (this.authService.isEmailProvider()) {
      const alert = await this.alertController.create({
        header: 'Confirmar Eliminación',
        message: 'Por seguridad, ingresa tu contraseña actual:',
        inputs: [{
          name: 'currentPassword',
          type: 'password',
          placeholder: 'Contraseña actual'
        }],
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Eliminar',
            role: 'destructive',
            handler: async (data) => {
              await this.executeDeleteAccount(data.currentPassword);
              return true;
            }
          }
        ]
      });
      await alert.present();
    } else {
      await this.executeDeleteAccount();
    }
  }

  async executeDeleteAccount(currentPassword?: string) {
    const loading = await this.loadingController.create({
      message: 'Eliminando cuenta...'
    });
    await loading.present();

    try {
      await this.authService.deleteUserAccount(currentPassword);
      await loading.dismiss();
      await this.presentToast('Cuenta eliminada correctamente', 'success');
    } catch (error: any) {
      await loading.dismiss();
      await this.presentToast(`Error: ${error.message}`, 'error');
    }
  }

  // ✅ MÉTODOS DE NAVEGACIÓN Y UI
  goBack() {
    this.router.navigate(['/home']);
  }

  cancelEdit() {
    this.user = JSON.parse(JSON.stringify(this.originalUserData));
    this.isEditing = false;
    this.nuevoAlimentoFavorito = '';
    this.nuevoAlimentoEvitar = '';
  }

  async presentToast(message: string, type: 'success' | 'error') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: type === 'success' ? 'success' : 'danger',
      position: 'bottom'
    });
    await toast.present();
  }

  // ✅ MÉTODOS HELPER
  getNivelActividadLabel(value: string): string {
    const nivel = this.nivelesActividad.find(n => n.value === value);
    return nivel ? nivel.label : value;
  }

  getDificultadLabel(value: string): string {
    const dificultad = this.dificultadesEjercicio.find(d => d.value === value);
    return dificultad ? dificultad.label : value;
  }

  async changePhoto() {
    const alert = await this.alertController.create({
      header: 'Cambiar Foto',
      message: 'Esta funcionalidad estará disponible pronto',
      buttons: ['OK']
    });
    await alert.present();
  }

  // ✅ MÉTODOS ADICIONALES PARA RESTRICCIONES Y TIPOS DE EJERCICIO
  agregarRestriccionAlimentaria(restriccion: string) {
    if (restriccion && !this.user.configuracionPlanes.restriccionesAlimentarias.includes(restriccion)) {
      this.user.configuracionPlanes.restriccionesAlimentarias.push(restriccion);
    }
  }

  removeRestriccionAlimentaria(index: number) {
    this.user.configuracionPlanes.restriccionesAlimentarias.splice(index, 1);
  }

  agregarTipoEjercicioPreferido(tipo: string) {
    if (tipo && !this.user.configuracionPlanes.tiposEjercicioPreferidos.includes(tipo)) {
      this.user.configuracionPlanes.tiposEjercicioPreferidos.push(tipo);
    }
  }

  removeTipoEjercicioPreferido(index: number) {
    this.user.configuracionPlanes.tiposEjercicioPreferidos.splice(index, 1);
  }
}