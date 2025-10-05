import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // ✅ Agregar RouterModule
import { 
  IonMenu, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonList, 
  IonItem, 
  IonLabel,
  IonIcon,
  IonMenuToggle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, analytics, chatbubble, statsChart, logOut } from 'ionicons/icons';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, // ✅ Agregar esto para routerLink
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonMenuToggle
  ]
})
export class MenuComponent {

  pages = [
    { title: 'Inicio', url: '/home', icon: 'home' },
    { title: 'Registrar Indicadores', url: '/indicators', icon: 'analytics' },
    { title: 'Mi Progreso', url: '/progress', icon: 'stats-chart' },
    { title: 'Chatbot', url: '/chat', icon: 'chatbubble' }
  ];

  constructor(private router: Router) {
    addIcons({ home, analytics, chatbubble, statsChart, logOut });
  }

  logout() {
    console.log('Cerrando sesión...');
    this.router.navigate(['/login']);
  }
}