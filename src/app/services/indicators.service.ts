import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  query, 
  orderBy,
  where,
  limit 
} from '@angular/fire/firestore';
import { collectionData } from 'rxfire/firestore';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IndicatorsService {
  constructor(private firestore: Firestore) {}

  // Agregar indicador (MEJORADO)
  async addIndicator(uid: string, data: any) {
    const col = collection(this.firestore, `users/${uid}/indicators`);
    
    // 🔄 NUEVO: Calcular IMC automáticamente si no viene
    const indicatorData = {
      ...data,
      bmi: data.bmi || this.calculateBMI(data.weight, data.height),
      bmiCategory: data.bmiCategory || this.getBMICategory(this.calculateBMI(data.weight, data.height)),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return addDoc(col, indicatorData);
  }

  // Obtener indicadores (sin cambios)
  getIndicators(uid: string): Observable<any[]> {
    const col = collection(this.firestore, `users/${uid}/indicators`);
    const q = query(col, orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  // 🔄 NUEVO: Obtener último indicador
  getLastIndicator(uid: string): Observable<any[]> {
    const col = collection(this.firestore, `users/${uid}/indicators`);
    const q = query(col, orderBy('createdAt', 'desc'), limit(1));
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  // 🔄 NUEVO: Calcular IMC
  calculateBMI(weight: number, height: number): number {
    if (!weight || !height) return 0;
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  }

  // 🔄 NUEVO: Obtener categoría del IMC
  getBMICategory(bmi: number): string {
    if (!bmi) return 'No calculado';
    if (bmi < 18.5) return 'Bajo peso';
    if (bmi < 25) return 'Peso normal';
    if (bmi < 30) return 'Sobrepeso';
    return 'Obesidad';
  }

  // 🔄 NUEVO: Obtener estadísticas del usuario
  getUserStats(uid: string): Observable<any[]> {
    const col = collection(this.firestore, `users/${uid}/indicators`);
    const q = query(col, orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }
}