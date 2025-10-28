import { Component } from '@angular/core';
import { 
  IonToolbar, 
  IonButtons, 
  IonButton, 
  IonIcon, 
  IonLabel 
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonLabel
  ]
})
export class MenuComponent {
  
  constructor(private router: Router) {}

  // Método para verificar ruta activa
  isActive(route: string): boolean {
    return this.router.url === route;
  }

  // Método para debug
  navigateTo(route: string) {
    console.log('🔗 Navegando a:', route);
    this.router.navigate([route]).then(success => {
      console.log('✅ Navegación exitosa a:', route);
    }).catch(error => {
      console.error('❌ Error navegando a', route, error);
    });
  }
}