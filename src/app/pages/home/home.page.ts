import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { onAuthStateChanged, User } from 'firebase/auth';
import { IndicatorsService } from 'src/app/services/indicators.service';
import { AuthService } from 'src/app/services/auth.service';

// Importar módulos standalone
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { add, statsChart } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent
  ]
})
export class HomePage implements OnInit {
  user: User | null = null;
  userName: string = '';
  lastIndicator: any = null;

  constructor(
    private afAuth: Auth,
    private indicators: IndicatorsService,
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({ add, statsChart });
  }

  async ngOnInit() {
    // Escuchar cambios en la autenticación
    this.authService.user.subscribe(async (user) => {
      this.user = user;
      if (user) {
        this.userName = await this.authService.getCurrentUserName();
        this.loadLastIndicator(user.uid);
      } else {
        this.userName = '';
        this.lastIndicator = null;
      }
    });
  }

  loadLastIndicator(uid: string) {
    this.indicators.getIndicators(uid).subscribe((data: any[]) => {
      this.lastIndicator = data.length ? data[0] : null;
    });
  }

  goTo(path: string) {
    this.router.navigateByUrl(path);
  }

  async logout() {
    await this.authService.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}