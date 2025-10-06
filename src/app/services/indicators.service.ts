import { Injectable, inject } from '@angular/core';
import { 
  collection, 
  doc, 
  Firestore, 
  getDocs, 
  addDoc,
  query, 
  where, 
  orderBy,
  limit 
} from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';

export interface Indicator {
  id?: string;
  userId: string;
  weight?: number;
  mood?: string;
  sleepHours?: number;
  waterIntake?: number;
  steps?: number;
  date: Date;
}

@Injectable({
  providedIn: 'root'
})
export class IndicatorsService {
  private firestore = inject(Firestore);

  // Agregar un indicador
  async addIndicator(userId: string, data: any): Promise<any> {
    try {
      const indicatorsRef = collection(this.firestore, 'indicators');
      const indicatorData = {
        userId: userId,
        date: new Date(),
        ...data
      };
      
      const result = await addDoc(indicatorsRef, indicatorData);
      return { id: result.id, ...indicatorData };
    } catch (error) {
      console.error('Error adding indicator:', error);
      throw error;
    }
  }

  // Obtener indicadores
  async getIndicators(uid: string): Promise<any[]> {
    try {
      const indicatorsRef = collection(this.firestore, 'indicators');
      const q = query(
        indicatorsRef, 
        where('userId', '==', uid),
        orderBy('date', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting indicators:', error);
      return [];
    }
  }

  // Obtener indicadores como Observable
  getIndicatorsObservable(uid: string): Observable<any[]> {
    return from(this.getIndicators(uid));
  }

  // Calcular BMI
  calculateBMI(weight: number, height: number): number {
    if (!weight || !height || height === 0) return 0;
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  }

  // Obtener categoría del BMI
  getBMICategory(bmi: number): string {
    if (bmi === 0) return 'No disponible';
    if (bmi < 18.5) return 'Bajo peso';
    if (bmi < 25) return 'Peso normal';
    if (bmi < 30) return 'Sobrepeso';
    return 'Obesidad';
  }

  // Obtener último indicador
  async getLastIndicator(uid: string): Promise<any> {
    try {
      const indicators = await this.getIndicators(uid);
      return indicators.length > 0 ? indicators[0] : null;
    } catch (error) {
      console.error('Error getting last indicator:', error);
      return null;
    }
  }
}