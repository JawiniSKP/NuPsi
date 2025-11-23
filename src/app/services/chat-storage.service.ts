import { Injectable, inject } from '@angular/core';
import { Firestore, collection, getDocs, query, orderBy, doc, setDoc } from '@angular/fire/firestore';

export interface StoredMessage {
  id?: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: any; // Firestore Timestamp or ISO
}

@Injectable({ providedIn: 'root' })
export class ChatStorageService {
  private firestore = inject(Firestore);

  constructor() {}

  private messagesCollectionPath(uid: string) {
    return `conversations/${uid}/messages`;
  }

  async saveMessage(uid: string, message: StoredMessage): Promise<void> {
    try {
      const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const refPath = `${this.messagesCollectionPath(uid)}/${id}`;
      await setDoc(doc(this.firestore, refPath), {
        sender: message.sender,
        text: message.text,
        timestamp: message.timestamp || new Date().toISOString()
      });
    } catch (err) {
      console.warn('Error guardando mensaje en Firestore:', err);
      throw err;
    }
  }

  async loadMessages(uid: string): Promise<StoredMessage[]> {
    try {
      const colRef = collection(this.firestore, this.messagesCollectionPath(uid));
      const q = query(colRef, orderBy('timestamp', 'asc'));
      const snap = await getDocs(q as any);
      const msgs: StoredMessage[] = [];
      snap.forEach(docSnap => {
        const data: any = docSnap.data();
        msgs.push({
          id: docSnap.id,
          sender: data.sender,
          text: data.text,
          timestamp: data.timestamp
        });
      });
      return msgs;
    } catch (err) {
      console.warn('Error cargando mensajes desde Firestore:', err);
      return [];
    }
  }
}
