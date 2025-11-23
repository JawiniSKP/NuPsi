import { Component, OnInit, viewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonAvatar, IonButton, IonIcon, IonFooter,
  IonTextarea, IonButtons, IonBackButton
} from '@ionic/angular/standalone';
import { ChatService } from './chat.service';
import { AuthService } from 'src/app/services/auth.service';
import { ChatStorageService, StoredMessage } from '../../services/chat-storage.service';
import { addIcons } from 'ionicons';
import {
  arrowUpCircle, ellipsisVertical, chatbubbles 
} from 'ionicons/icons';
import { MarkdownModule } from 'ngx-markdown';

// ✅ IMPORTS COMPLETOS DE CAPACITOR
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  isFirst?: boolean;
}

interface MessageCluster {
  sender: 'user' | 'bot';
  messages: Message[];
  timestamp: string;
}

interface MessageDateGroup {
  date: string;
  clusters: MessageCluster[];
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonBackButton,
    IonButtons,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonAvatar,
    IonButton,
    IonIcon,
    IonFooter,
    IonTextarea,
    MarkdownModule
  ]
})
export class ChatPage implements OnInit {
  readonly content = viewChild.required(IonContent);

  messages: Message[] = [];
  groupedMessages: MessageDateGroup[] = [];
  newMessage: string = '';
  botIsTyping: boolean = false;

  private chatService = inject(ChatService);
  private authService = inject(AuthService);
  private chatStorage = inject(ChatStorageService);

  constructor() {
    addIcons({ellipsisVertical, chatbubbles, arrowUpCircle});
  }

  async ngOnInit(): Promise<void> {
    // cargar historial si existe usuario
    try {
      const uid = this.authService.getCurrentUserId();
      if (uid) {
        const stored = await this.chatStorage.loadMessages(uid);
        if (stored && stored.length) {
          // mapear a mensajes internos y mostrar
          stored.forEach((m: StoredMessage) => this.messages.push({
            id: m.id || this.generateId(),
            sender: m.sender,
            text: m.text,
            timestamp: new Date(m.timestamp)
          }));
          this.groupMessages();
        }
      }
    } catch (err) {
      console.warn('No se pudo cargar historial de chat:', err);
    }

    // saludo si no hay mensajes
    // Si hay usuario, intentar setear slot user_name en Rasa antes de la primera interacción
    try {
      const uid = this.authService.getCurrentUserId();
      const name = await this.authService.getCurrentUserName();
      if (uid && name) {
        await this.chatService.setSlot(uid, 'user_name', name);
      }
    } catch (err) {
      console.warn('No se pudo setear slot user_name en Rasa desde ngOnInit:', err);
    }

    this.addWelcomeMessage();
  }

  ionViewDidEnter() {
    this.scrollToBottom(0);
  }

  async addWelcomeMessage() {
    if (this.messages.length === 0) {
      let name = '';
      try {
        name = await this.authService.getCurrentUserName();
      } catch (err) {
        console.warn('No se pudo obtener nombre de usuario:', err);
      }

      const greeting = name && name !== 'Usuario'
        ? `¡Hola ${name}! Soy Aura. ¿Cómo te sientes hoy?`
        : '¡Hola! Soy Aura. ¿Cómo te sientes hoy?';

      this.addMessage('bot', greeting);
    }
  }

  // ✅ CORREGIDO: Método async con manejo de conexión y háptica
  async sendMessage() {
    const text = this.newMessage.trim();
    if (!text) return;

    // ✅ AGREGAR FEEDBACK HÁPTICO EN MÓVIL AL ENVIAR
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }

    this.addMessage('user', text);
    this.newMessage = '';
    this.scrollToBottom(100);

    this.botIsTyping = true;

    // enviar con sender = UID si está autenticado, y metadata con nombre si disponible
    let senderId = 'user';
    try {
      const uid = this.authService.getCurrentUserId();
      if (uid) senderId = uid;
    } catch (err) {
      console.warn('No se pudo obtener UID del usuario:', err);
    }

    let metadata: any = undefined;
    try {
      const name = await this.authService.getCurrentUserName();
      if (name) metadata = { user_name: name };
    } catch (err) {
      console.warn('No se pudo obtener nombre de usuario:', err);
    }

    this.chatService.sendMessage(text, senderId, metadata).subscribe({
      next: async (responses) => {
        this.botIsTyping = false;
        
        // ✅ AGREGAR FEEDBACK HÁPTICO PARA RESPUESTA EXITOSA
        if (Capacitor.isNativePlatform() && responses.length > 0) {
          await Haptics.impact({ style: ImpactStyle.Medium });
        }

        responses.forEach((response, index) => {
          setTimeout(() => {
            if (response.text) {
              this.addMessage('bot', response.text);
              this.scrollToBottom(100);
            }
          }, index * 500);
        });
      },
      error: async (err) => {
        this.botIsTyping = false;
        console.error('Error:', err);
        
        // ✅ AGREGAR FEEDBACK HÁPTICO PARA ERROR
        if (Capacitor.isNativePlatform()) {
          await Haptics.impact({ style: ImpactStyle.Heavy });
        }

        // ✅ USAR MENSAJE DE ERROR MEJORADO DEL SERVICIO
        this.addMessage('bot', err.message || 'Lo siento, tengo problemas de conexión. Inténtalo más tarde.');
        this.scrollToBottom(100);
      }
    });
  }

  addMessage(sender: 'user' | 'bot', text: string) {
    const message: Message = {
      id: this.generateId(),
      sender,
      text,
      timestamp: new Date()
    };

    this.messages.push(message);
    this.groupMessages();
    // persistir si hay usuario autenticado
    (async () => {
      try {
        const uid = this.authService.getCurrentUserId();
        if (uid) {
          const stored: StoredMessage = {
            sender: message.sender,
            text: message.text,
            timestamp: message.timestamp.toISOString()
          };
          await this.chatStorage.saveMessage(uid, stored);
        }
      } catch (err) {
        console.warn('No se pudo guardar mensaje en almacenamiento:', err);
      }
    })();
  }

  groupMessages() {
    const groups: MessageDateGroup[] = [];

    this.messages.forEach((msg) => {
      const dateStr = this.formatDate(msg.timestamp);

      let dateGroup = groups.find(g => g.date === dateStr);
      if (!dateGroup) {
        dateGroup = { date: dateStr, clusters: [] };
        groups.push(dateGroup);
      }

      const lastCluster = dateGroup.clusters[dateGroup.clusters.length - 1];

      if (lastCluster && lastCluster.sender === msg.sender) {
        msg.isFirst = lastCluster.messages.length === 0;
        lastCluster.messages.push(msg);
        lastCluster.timestamp = this.formatTime(msg.timestamp);
      } else {
        msg.isFirst = true;
        dateGroup.clusters.push({
          sender: msg.sender,
          messages: [msg],
          timestamp: this.formatTime(msg.timestamp)
        });
      }
    });

    this.groupedMessages = groups;
  }

  formatDate(date: Date): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (this.isSameDay(date, today)) {
      return 'Hoy';
    } else if (this.isSameDay(date, yesterday)) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      });
    }
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isSameDay(d1: Date, d2: Date): boolean {
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
  }

  handleEnter(event: any) {
    if (!event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  scrollToBottom(duration: number = 300) {
    setTimeout(() => {
      this.content()?.scrollToBottom(duration);
    }, 50);
  }

  generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}