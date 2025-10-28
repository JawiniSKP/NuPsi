// ⚠️ DEPRECATED: Este servicio será reemplazado por HomeService
// Usar HomeService.guardarIndicadorDiario() en su lugarimport { Injectable, inject, runInInjectionContext, Injector } from '@angular/core';
/*import { 
  Firestore, 
  doc, 
  setDoc, 
  getDoc,
  DocumentSnapshot,
  DocumentData 
} from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';

export interface EmotionRecord {
  emociones: string[];
  fecha: string;
  timestamp: Date;
  usuario: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmotionService {
  private firestore = inject(Firestore);
  private injector = inject(Injector); // ✅ INYECTAMOS EL INJECTOR

 
  loadTodayEmotions(userId: string): Observable<EmotionRecord | null> {
    return from(this.loadTodayEmotionsAsync(userId));
  }

 
  saveTodayEmotions(userId: string, emotions: string[]): Observable<void> {
    return from(this.saveTodayEmotionsAsync(userId, emotions));
  }

 
  private async loadTodayEmotionsAsync(userId: string): Promise<EmotionRecord | null> {
    return runInInjectionContext(this.injector, async () => { // ✅ USAMOS this.injector
      try {
        const today = new Date().toISOString().split('T')[0];
        const emotionDocRef = doc(this.firestore, `users/${userId}/emotionalRecords/${today}`);
        const emotionDoc: DocumentSnapshot<DocumentData> = await getDoc(emotionDocRef);

        if (emotionDoc.exists()) {
          const data = emotionDoc.data();
          return {
            emociones: data['emociones'] || [],
            fecha: data['fecha'] || today,
            timestamp: data['timestamp']?.toDate() || new Date(),
            usuario: data['usuario'] || userId
          };
        } else {
          return null;
        }
      } catch (error) {
        console.error('Error loading today emotions from service:', error);
        throw error;
      }
    });
  }

  private async saveTodayEmotionsAsync(userId: string, emotions: string[]): Promise<void> {
    return runInInjectionContext(this.injector, async () => { // ✅ USAMOS this.injector
      try {
        const today = new Date().toISOString().split('T')[0];
        const emotionDocRef = doc(this.firestore, `users/${userId}/emotionalRecords/${today}`);

        await setDoc(emotionDocRef, {
          emociones: emotions,
          fecha: today,
          timestamp: new Date(),
          usuario: userId
        }, { merge: true });

        console.log('✅ Emociones guardadas en servicio:', emotions);
      } catch (error) {
        console.error('❌ Error guardando emociones en servicio:', error);
        throw error;
      }
    });
  }
} */