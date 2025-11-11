// src/app/services/chat.types.ts

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  ts: number;
  // Puedes añadir más campos aquí si los necesitas
  // por ejemplo: image?: string;
}