import { Component, OnInit, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, 
  IonAvatar, IonButton, IonIcon, IonFooter, 
  IonTextarea, IonButtons, IonBackButton 
} from '@ionic/angular/standalone';
import { ChatService } from './chat.service';
import { addIcons } from 'ionicons';
import { 
  arrowUpCircle, ellipsisVertical, chatbubbles } from 'ionicons/icons';
import { MarkdownModule } from 'ngx-markdown'; // <-- Importa el módulo Markdown

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
     // ¡¡¡ AÑADE MarkdownModule AQUÍ !!!
     MarkdownModule // <-- Importa el módulo Markdown correctamente
  ]
})
export class ChatPage implements OnInit {
  readonly content = viewChild.required(IonContent);

  messages: Message[] = [];
  groupedMessages: MessageDateGroup[] = [];
  newMessage: string = '';
  botIsTyping: boolean = false;

  constructor(private chatService: ChatService) {
    addIcons({ellipsisVertical,chatbubbles,arrowUpCircle});
  }

  ngOnInit() {
    this.addWelcomeMessage();
  }

  ionViewDidEnter() {
    this.scrollToBottom(0);
  }

  addWelcomeMessage() {
    if (this.messages.length === 0) {
      this.addMessage('bot', '¡Hola! Soy Aura. ¿Cómo te sientes hoy?');
    }
  }

  sendMessage() {
    const text = this.newMessage.trim();
    if (!text) return;

    this.addMessage('user', text);
    this.newMessage = '';
    this.scrollToBottom(100);

    this.botIsTyping = true;
    
    this.chatService.sendMessage(text).subscribe({
      next: (responses) => {
        this.botIsTyping = false;
        responses.forEach((response, index) => {
          setTimeout(() => {
            if (response.text) {
              this.addMessage('bot', response.text);
              this.scrollToBottom(100);
            }
          }, index * 500);
        });
      },
      error: (err) => {
        this.botIsTyping = false;
        console.error('Error:', err);
        this.addMessage('bot', 'Lo siento, tengo problemas de conexión. Inténtalo más tarde.');
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