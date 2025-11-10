import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData,
  addDoc,
  query,
  where,
  orderBy
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

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
  // ✅ CORRECTO: Inyección de dependencias al inicio
  private firestore = inject(Firestore);

  // ============================================
  // ✅ CORREGIDO: Obtener indicadores con manejo de errores
  // ============================================
  getIndicators(userId: string): Observable<Indicator[]> {
    try {
      const indicatorsRef = collection(this.firestore, 'indicators');
      const q = query(
        indicatorsRef, 
        where('userId', '==', userId)
        // orderBy('date', 'desc') // ⏸️ Temporalmente comentado hasta crear índice
      );
      
      // ✅ CORREGIDO: Usando collectionData dentro del contexto
      return collectionData(q, { idField: 'id' }).pipe(
        map(indicators => indicators as Indicator[]),
        catchError(error => {
          console.error('❌ Error obteniendo indicadores:', error);
          return [];
        })
      );
    } catch (error) {
      console.error('❌ Error en getIndicators:', error);
      return new Observable(subscriber => {
        subscriber.next([]);
        subscriber.complete();
      });
    }
  }

  // ============================================
  // ✅ CORREGIDO: Agregar indicador con from()
  // ============================================
  addIndicator(userId: string, indicatorData: any): Observable<string> {
    try {
      const indicatorsRef = collection(this.firestore, 'indicators');
      
      const indicator: Indicator = {
        ...indicatorData,
        userId: userId,
        createdAt: new Date()
      };

      // ✅ CORREGIDO: Convertir promesa en observable con from()
      return from(addDoc(indicatorsRef, indicator)).pipe(
        map(docRef => {
          console.log('✅ Indicador guardado exitosamente con ID:', docRef.id);
          return docRef.id;
        }),
        catchError(error => {
          console.error('❌ Error guardando indicador:', error);
          throw error;
        })
      );
    } catch (error) {
      console.error('❌ Error en addIndicator:', error);
      throw error;
    }
  }

  // ============================================
  // ✅ MÉTODO ALTERNATIVO - Ya no es necesario pero lo dejamos
  // ============================================
  getIndicatorsWithInjection(userId: string): Observable<Indicator[]> {
    try {
      const indicatorsRef = collection(this.firestore, 'indicators');
      const q = query(
        indicatorsRef, 
        where('userId', '==', userId)
      );
      
      // ✅ CORREGIDO: Usando collectionData directamente
      return collectionData(q, { idField: 'id' }).pipe(
        map(indicators => indicators as Indicator[]),
        catchError(error => {
          console.error('❌ Error en getIndicatorsWithInjection:', error);
          return [];
        })
      );
    } catch (error) {
      console.error('❌ Error crítico en getIndicatorsWithInjection:', error);
      return new Observable(subscriber => {
        subscriber.next([]);
        subscriber.complete();
      });
    }
  }
}