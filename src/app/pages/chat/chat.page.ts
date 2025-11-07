// src/app/pages/chat/chat.page.ts

import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonAvatar, IonButton, IonIcon, IonFooter, IonItem, IonInput } from '@ionic/angular/standalone';
import { ChatService } from './chat.service';

// 👇 1. IMPORTA addIcons Y LOS ÍCONOS QUE NECESITAS
import { addIcons } from 'ionicons';
import { paperPlaneOutline, paperPlaneSharp } from 'ionicons/icons';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonAvatar,
    IonButton,
    IonIcon,
    IonFooter,
    IonItem,
    IonInput
  ]
})
export class ChatPage {
  @ViewChild(IonContent) content!: IonContent;

  messages: { sender: string; text: string; type: string; }[] = [];
  newMessage: string = '';
  botIsTyping: boolean = false;

  constructor(private chatService: ChatService) {
    // 👇 2. REGISTRA LOS ÍCONOS EN EL CONSTRUCTOR
    addIcons({
      'paper-plane': paperPlaneSharp,
      'paper-plane-outline': paperPlaneOutline,
    });
  }

  ionViewDidEnter() {
    // Añade el mensaje de bienvenida solo si la conversación está vacía
    if (this.messages.length === 0) {
      this.messages.push({
        sender: 'bot',
        type: 'text',
        text: '¡Hola! Soy Aura. ¿Cómo te sientes hoy?'
      });
    }
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    // Añade el mensaje del usuario a la UI
    const userMessageText = this.newMessage;
    this.messages.push({ sender: 'user', type: 'text', text: userMessageText });
    this.newMessage = '';
    this.scrollToBottom();

    // Activa el indicador y llama al servicio
    this.botIsTyping = true;
    this.chatService.sendMessage(userMessageText).subscribe({
      next: (botResponses) => {
        this.botIsTyping = false;
        botResponses.forEach(response => {
          if (response.text) {
            this.messages.push({
              sender: 'bot',
              type: 'text',
              text: response.text
            });
          }
        });
        this.scrollToBottom();
      },
      error: (err) => {
        this.botIsTyping = false;
        console.error('Error al conectar con Rasa:', err);
        this.messages.push({
          sender: 'bot',
          type: 'text',
          text: 'Lo siento, tengo problemas para conectarme. Inténtalo de nuevo más tarde.'
        });
        this.scrollToBottom();
      }
    });
  }

  scrollToBottom() {
    // Da un pequeño tiempo para que el DOM se actualice antes de hacer scroll
    setTimeout(() => {
      this.content?.scrollToBottom(300);
    }, 100);
  }
}