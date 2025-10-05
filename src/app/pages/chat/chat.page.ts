import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonApp, // ← AGREGAR ESTO
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonMenuButton
} from '@ionic/angular/standalone';
import { MenuComponent } from '../../components/menu/menu.component';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MenuComponent,
    IonApp, // ← AGREGAR ESTO
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonButtons,
    IonMenuButton
  ]
})
export class ChatPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }
}