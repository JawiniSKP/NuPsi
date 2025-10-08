import { Injectable, inject, Injector } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData,
  addDoc,
  query,
  where
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

// ✅ INTERFAZ INDICATOR
export interface Indicator {
  id?: string;
  weight: number;
  height: number;
  mood: string;
  notes: string;
  date: string;
  bmi: number;
  userId: string;
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class IndicatorsService {
  private firestore = inject(Firestore);
  private injector = inject(Injector); // ✅ Inyectar Injector

  getIndicators(userId: string): Observable<Indicator[]> {
    const indicatorsRef = collection(this.firestore, 'indicators');
    const q = query(
      indicatorsRef, 
      where('userId', '==', userId)
      // orderBy('date', 'desc') // ⏸️ Temporalmente comentado hasta crear índice
    );
    
    return collectionData(q, { idField: 'id' }) as Observable<Indicator[]>;
  }

  async addIndicator(userId: string, indicatorData: any): Promise<void> {
    try {
      const indicatorsRef = collection(this.firestore, 'indicators');
      
      const indicator: Indicator = {
        ...indicatorData,
        userId: userId,
        createdAt: new Date()
      };

      await addDoc(indicatorsRef, indicator);
      console.log('✅ Indicador guardado exitosamente');
    } catch (error) {
      console.error('❌ Error guardando indicador:', error);
      throw error;
    }
  }

  // ✅ Método alternativo si necesitas usar runInInjectionContext
  getIndicatorsWithInjection(userId: string): Observable<Indicator[]> {
    return new Observable(observer => {
      // Usar el injector inyectado
      const firestore = this.injector.get(Firestore);
      
      const indicatorsRef = collection(firestore, 'indicators');
      const q = query(
        indicatorsRef, 
        where('userId', '==', userId)
      );
      
      const subscription = collectionData(q, { idField: 'id' }).subscribe({
        next: (data) => observer.next(data as Indicator[]),
        error: (err) => observer.error(err),
        complete: () => observer.complete()
      });

      return () => subscription.unsubscribe();
    });
  }
}