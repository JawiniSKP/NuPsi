import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  // ✅ SOLO LOS ICONOS DE EMOCIONES QUE VAS A USAR
  happy,
  happyOutline,
  sad,
  sadOutline,
  warning,
  removeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    RouterModule
  ]
})
export class AppComponent {
  constructor() {
    // ✅ REGISTRAR SOLO LOS ICONOS DE EMOCIONES A NIVEL GLOBAL
    addIcons({
      'happy': happy,
      'happy-outline': happyOutline,
      'sad': sad,
      'sad-outline': sadOutline,
      'warning': warning,
      'remove-outline': removeOutline
    });
  }
}