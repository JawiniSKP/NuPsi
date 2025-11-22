import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  updateDoc,
  addDoc
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// ============================================
// INTERFACES PARA MODELOS ML
// ============================================

export interface DailyMLInput {
  id?: string;
  userId: string;
  fecha: Timestamp;
  
  // Datos físicos
  peso?: number;
  estatura?: number;
  imc?: number;
  
  // Estado emocional
  emociones: string[];
  estadoAnimo: 'excelente' | 'bueno' | 'regular' | 'malo' | 'muy-malo';
  nivelEstres: number; // 1-10
  calidadSueno: number; // 1-10
  
  // Hábitos
  vasosAgua: number;
  horasSueno: number;
  actividadFisica: boolean;
  tipoActividad?: string;
  duracionActividad?: number; // minutos
  
  // Alimentación
  comidas: number; // número de comidas
  calidadAlimentacion: number; // 1-10
  
  // Notas
  notas?: string;
  
  // Metadatos
  creadoEn: Timestamp;
  actualizadoEn: Timestamp;
}

export interface AuraInsight {
  id?: string;
  userId: string;
  fecha: Timestamp;
  
  // Clasificación emocional ML
  clasificacionEmocional: {
    categoria: 'positivo' | 'neutral' | 'negativo' | 'critico';
    confianza: number; // 0-1
    emocionDominante: string;
    tendencia: 'mejorando' | 'estable' | 'empeorando';
  };
  
  // Análisis de patrones
  patronesDetectados: {
    tipo: string;
    descripcion: string;
    frecuencia: number;
  }[];
  
  // Recomendaciones IA
  recomendaciones: {
    area: 'emocional' | 'fisica' | 'habitos' | 'alimentacion';
    mensaje: string;
    prioridad: 'alta' | 'media' | 'baja';
  }[];
  
  // Métricas
  scoreGeneral: number; // 0-100
  
  creadoEn: Timestamp;
}

export interface BienestarIntegral {
  id?: string;
  userId: string;
  fecha: Timestamp;
  
  // Clasificación ML de bienestar
  clasificacion: {
    nivel: 'optimo' | 'bueno' | 'regular' | 'bajo' | 'critico';
    confianza: number;
    scoreTotal: number; // 0-100
  };
  
  // Dimensiones del bienestar
  dimensiones: {
    emocional: number; // 0-100
    fisica: number; // 0-100
    habitos: number; // 0-100
    nutricion: number; // 0-100
    social: number; // 0-100
  };
  
  // Tendencias
  tendenciaSemanal: 'ascendente' | 'estable' | 'descendente';
  tendenciaMensual: 'ascendente' | 'estable' | 'descendente';
  
  // Alertas
  alertas: {
    tipo: string;
    mensaje: string;
    severidad: 'info' | 'warning' | 'danger';
  }[];
  
  // Logros
  logros: {
    nombre: string;
    descripcion: string;
    fecha: Timestamp;
  }[];
  
  creadoEn: Timestamp;
}

@Injectable({
  providedIn: 'root'
})
export class MLClassificationService {
  private firestore: Firestore;
  private auth: Auth;

  constructor() {
    this.firestore = inject(Firestore);
    this.auth = inject(Auth);
  }

  // ============================================
  // COLECCIONES FIREBASE
  // ============================================
  
  private getDailyMLInputsCollection(userId: string) {
    return collection(this.firestore, `usuarios/${userId}/dailyMLInputs`);
  }

  private getAuraInsightsCollection(userId: string) {
    return collection(this.firestore, `usuarios/${userId}/auraInsights`);
  }

  private getBienestarIntegralCollection(userId: string) {
    return collection(this.firestore, `usuarios/${userId}/bienestarIntegral`);
  }

  // ============================================
  // FORMULARIO DIARIO ML
  // ============================================

  async saveDailyMLInput(input: Partial<DailyMLInput>): Promise<boolean> {
    try {
      console.log('🔄 Iniciando guardado de datos ML...');
      
      const user = this.auth.currentUser;
      if (!user) {
        console.error('❌ Usuario no autenticado');
        throw new Error('Usuario no autenticado');
      }

      console.log('👤 Usuario autenticado:', user.uid);

      const now = Timestamp.now();
      const dailyInput: DailyMLInput = {
        userId: user.uid,
        fecha: input.fecha || now,
        emociones: input.emociones || [],
        estadoAnimo: input.estadoAnimo || 'regular',
        nivelEstres: input.nivelEstres || 5,
        calidadSueno: input.calidadSueno || 5,
        vasosAgua: input.vasosAgua || 0,
        horasSueno: input.horasSueno || 0,
        actividadFisica: input.actividadFisica || false,
        comidas: input.comidas || 0,
        calidadAlimentacion: input.calidadAlimentacion || 5,
        peso: input.peso,
        estatura: input.estatura,
        imc: input.imc,
        tipoActividad: input.tipoActividad,
        duracionActividad: input.duracionActividad,
        notas: input.notas,
        creadoEn: now,
        actualizadoEn: now
      };

      console.log('📝 Datos a guardar:', dailyInput);

      const colRef = this.getDailyMLInputsCollection(user.uid);
      console.log('📂 Ruta de colección: usuarios/' + user.uid + '/dailyMLInputs');

      const dailyInputData = JSON.parse(JSON.stringify(dailyInput));
      const docRef = await addDoc(colRef, {
        ...dailyInputData,
        fecha: dailyInput.fecha,
        creadoEn: dailyInput.creadoEn,
        actualizadoEn: dailyInput.actualizadoEn
      });

      console.log('✅ Datos ML guardados exitosamente en documento:', docRef.id);
      console.log('🔗 URL completa: usuarios/' + user.uid + '/dailyMLInputs/' + docRef.id);

      return true;
    } catch (error) {
      console.error('❌ Error guardando datos ML:', error);
      console.error('📋 Detalles del error:', JSON.stringify(error, null, 2));
      return false;
    }
  }

  async getDailyMLInputs(userId: string, dias: number = 30): Promise<DailyMLInput[]> {
    try {
      const colRef = this.getDailyMLInputsCollection(userId);
      const q = query(
        colRef,
        orderBy('fecha', 'desc'),
        limit(dias)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DailyMLInput));
    } catch (error) {
      console.error('❌ Error obteniendo datos ML:', error);
      return [];
    }
  }

  // ============================================
  // IA AURA - INSIGHTS EMOCIONALES
  // ============================================

  async generateAuraInsightManual(userId: string): Promise<void> {
    return this.generateAuraInsight(userId);
  }

  private async generateAuraInsight(userId: string): Promise<void> {
    try {
      // Obtener datos de los últimos 7 días
      const datos = await this.getDailyMLInputs(userId, 7);
      
      if (datos.length === 0) {
        console.log('No hay suficientes datos para generar insights');
        return;
      }

      // MODELO ML: Clasificación emocional
      const clasificacion = this.clasificarEstadoEmocional(datos);
      const patrones = this.detectarPatrones(datos);
      const recomendaciones = this.generarRecomendaciones(clasificacion, patrones);
      const score = this.calcularScoreGeneral(datos);

      const insight: AuraInsight = {
        userId,
        fecha: Timestamp.now(),
        clasificacionEmocional: clasificacion,
        patronesDetectados: patrones,
        recomendaciones,
        scoreGeneral: score,
        creadoEn: Timestamp.now()
      };

      const colRef = this.getAuraInsightsCollection(userId);
      const insightData = JSON.parse(JSON.stringify(insight));
      await addDoc(colRef, {
        ...insightData,
        fecha: insight.fecha,
        creadoEn: insight.creadoEn
      });

      console.log('✅ Insight de Aura generado');
    } catch (error) {
      console.error('❌ Error generando insight Aura:', error);
      throw error;
    }
  }

  private clasificarEstadoEmocional(datos: DailyMLInput[]): AuraInsight['clasificacionEmocional'] {
    // Algoritmo de clasificación ML simplificado
    const emocionesPositivas = ['feliz', 'motivado', 'tranquilo', 'excelente', 'bueno'];
    const emocionesNegativas = ['triste', 'ansioso', 'estresado', 'enojado', 'malo', 'muy-malo'];

    let scorePositivo = 0;
    let scoreNegativo = 0;
    const emocionesContadas: { [key: string]: number } = {};

    datos.forEach(dato => {
      dato.emociones.forEach(emocion => {
        emocionesContadas[emocion] = (emocionesContadas[emocion] || 0) + 1;
        
        if (emocionesPositivas.includes(emocion.toLowerCase())) {
          scorePositivo++;
        } else if (emocionesNegativas.includes(emocion.toLowerCase())) {
          scoreNegativo++;
        }
      });
    });

    const total = scorePositivo + scoreNegativo;
    const ratioPositivo = total > 0 ? scorePositivo / total : 0.5;

    // Determinar categoría
    let categoria: 'positivo' | 'neutral' | 'negativo' | 'critico';
    if (ratioPositivo >= 0.7) categoria = 'positivo';
    else if (ratioPositivo >= 0.4) categoria = 'neutral';
    else if (ratioPositivo >= 0.2) categoria = 'negativo';
    else categoria = 'critico';

    // Encontrar emoción dominante
    const emocionDominante = Object.entries(emocionesContadas)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';

    // Calcular tendencia
    const primerosT = datos.slice(Math.floor(datos.length / 2));
    const ultimosT = datos.slice(0, Math.floor(datos.length / 2));
    
    const scorePrimeros = this.calcularScoreEmocional(primerosT);
    const scoreUltimos = this.calcularScoreEmocional(ultimosT);
    
    let tendencia: 'mejorando' | 'estable' | 'empeorando';
    if (scoreUltimos > scorePrimeros + 0.1) tendencia = 'mejorando';
    else if (scoreUltimos < scorePrimeros - 0.1) tendencia = 'empeorando';
    else tendencia = 'estable';

    return {
      categoria,
      confianza: Math.min(datos.length / 7, 1),
      emocionDominante,
      tendencia
    };
  }

  private calcularScoreEmocional(datos: DailyMLInput[]): number {
    if (datos.length === 0) return 0.5;
    
    const emocionesPositivas = ['feliz', 'motivado', 'tranquilo', 'excelente', 'bueno'];
    let scoreTotal = 0;
    let count = 0;

    datos.forEach(dato => {
      dato.emociones.forEach(emocion => {
        scoreTotal += emocionesPositivas.includes(emocion.toLowerCase()) ? 1 : 0;
        count++;
      });
    });

    return count > 0 ? scoreTotal / count : 0.5;
  }

  private detectarPatrones(datos: DailyMLInput[]): AuraInsight['patronesDetectados'] {
    const patrones: AuraInsight['patronesDetectados'] = [];

    // Patrón de hidratación
    const promedioAgua = datos.reduce((sum, d) => sum + d.vasosAgua, 0) / datos.length;
    if (promedioAgua < 4) {
      patrones.push({
        tipo: 'hidratacion_baja',
        descripcion: 'Nivel de hidratación por debajo del recomendado',
        frecuencia: datos.filter(d => d.vasosAgua < 4).length / datos.length
      });
    }

    // Patrón de sueño
    const promedioSueno = datos.reduce((sum, d) => sum + (d.horasSueno || 0), 0) / datos.length;
    if (promedioSueno < 6) {
      patrones.push({
        tipo: 'sueno_insuficiente',
        descripcion: 'Horas de sueño insuficientes detectadas',
        frecuencia: datos.filter(d => (d.horasSueno || 0) < 6).length / datos.length
      });
    }

    // Patrón de actividad física
    const diasConActividad = datos.filter(d => d.actividadFisica).length;
    if (diasConActividad < datos.length * 0.3) {
      patrones.push({
        tipo: 'actividad_baja',
        descripcion: 'Nivel de actividad física bajo',
        frecuencia: 1 - (diasConActividad / datos.length)
      });
    }

    return patrones;
  }

  private generarRecomendaciones(
    clasificacion: AuraInsight['clasificacionEmocional'],
    patrones: AuraInsight['patronesDetectados']
  ): AuraInsight['recomendaciones'] {
    const recomendaciones: AuraInsight['recomendaciones'] = [];

    // Recomendaciones basadas en clasificación emocional
    if (clasificacion.categoria === 'negativo' || clasificacion.categoria === 'critico') {
      recomendaciones.push({
        area: 'emocional',
        mensaje: 'Considera hablar con un profesional de salud mental. Tu bienestar emocional es importante.',
        prioridad: 'alta'
      });
    }

    // Recomendaciones basadas en patrones
    patrones.forEach(patron => {
      if (patron.tipo === 'hidratacion_baja') {
        recomendaciones.push({
          area: 'habitos',
          mensaje: 'Intenta aumentar tu consumo de agua. Meta: 8 vasos al día.',
          prioridad: 'media'
        });
      }
      
      if (patron.tipo === 'sueno_insuficiente') {
        recomendaciones.push({
          area: 'habitos',
          mensaje: 'Establece una rutina de sueño regular. Apunta a 7-8 horas por noche.',
          prioridad: 'alta'
        });
      }
      
      if (patron.tipo === 'actividad_baja') {
        recomendaciones.push({
          area: 'fisica',
          mensaje: 'Incrementa tu actividad física. Intenta 30 minutos de ejercicio diario.',
          prioridad: 'media'
        });
      }
    });

    return recomendaciones;
  }

  private calcularScoreGeneral(datos: DailyMLInput[]): number {
    if (datos.length === 0) return 50;

    let score = 0;
    let count = 0;

    datos.forEach(dato => {
      // Score emocional (30%)
      const scoreEmocional = this.mapEstadoAnimoToScore(dato.estadoAnimo);
      score += scoreEmocional * 0.3;

      // Score de hidratación (20%)
      const scoreAgua = Math.min(dato.vasosAgua / 8, 1) * 100;
      score += scoreAgua * 0.2;

      // Score de sueño (20%)
      const scoreSueno = Math.min((dato.horasSueno || 0) / 8, 1) * 100;
      score += scoreSueno * 0.2;

      // Score de actividad física (15%)
      const scoreActividad = dato.actividadFisica ? 100 : 0;
      score += scoreActividad * 0.15;

      // Score de alimentación (15%)
      const scoreAlimentacion = (dato.calidadAlimentacion || 5) * 10;
      score += scoreAlimentacion * 0.15;

      count++;
    });

    return Math.round(score / count);
  }

  private mapEstadoAnimoToScore(estado: string): number {
    const mapping: { [key: string]: number } = {
      'excelente': 100,
      'bueno': 75,
      'regular': 50,
      'malo': 25,
      'muy-malo': 10
    };
    return mapping[estado] || 50;
  }

  async getLatestAuraInsight(userId: string): Promise<AuraInsight | null> {
    try {
      const colRef = this.getAuraInsightsCollection(userId);
      const q = query(colRef, orderBy('fecha', 'desc'), limit(1));
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      } as AuraInsight;
    } catch (error) {
      console.error('❌ Error obteniendo insight Aura:', error);
      return null;
    }
  }

  // ============================================
  // BIENESTAR INTEGRAL - CLASIFICACIÓN ML
  // ============================================

  async generateBienestarIntegralManual(userId: string): Promise<void> {
    return this.generateBienestarIntegral(userId);
  }

  private async generateBienestarIntegral(userId: string): Promise<void> {
    try {
      const datos = await this.getDailyMLInputs(userId, 30);
      
      if (datos.length === 0) {
        console.log('No hay suficientes datos para bienestar integral');
        return;
      }

      // Calcular dimensiones
      const dimensiones = this.calcularDimensiones(datos);
      
      // Clasificación ML
      const clasificacion = this.clasificarBienestar(dimensiones);
      
      // Tendencias
      const tendenciaSemanal = this.calcularTendencia(datos.slice(0, 7));
      const tendenciaMensual = this.calcularTendencia(datos);
      
      // Alertas
      const alertas = this.generarAlertas(dimensiones, datos);
      
      // Logros
      const logros = this.detectarLogros(datos);

      const bienestar: BienestarIntegral = {
        userId,
        fecha: Timestamp.now(),
        clasificacion,
        dimensiones,
        tendenciaSemanal,
        tendenciaMensual,
        alertas,
        logros,
        creadoEn: Timestamp.now()
      };

      const colRef = this.getBienestarIntegralCollection(userId);
      const bienestarData = JSON.parse(JSON.stringify(bienestar));
      await addDoc(colRef, {
        ...bienestarData,
        fecha: bienestar.fecha,
        creadoEn: bienestar.creadoEn
      });

      console.log('✅ Bienestar integral generado');
    } catch (error) {
      console.error('❌ Error generando bienestar integral:', error);
      throw error;
    }
  }

  private calcularDimensiones(datos: DailyMLInput[]): BienestarIntegral['dimensiones'] {
    // Dimensión emocional
    const emocional = this.calcularScoreEmocional(datos) * 100;

    // Dimensión física
    const actividadScore = datos.filter(d => d.actividadFisica).length / datos.length * 100;
    const imcPromedio = datos.reduce((sum, d) => sum + (d.imc || 0), 0) / datos.filter(d => d.imc).length;
    const imcScore = this.calcularScoreIMC(imcPromedio);
    const fisica = (actividadScore + imcScore) / 2;

    // Dimensión hábitos
    const aguaScore = datos.reduce((sum, d) => sum + Math.min(d.vasosAgua / 8, 1), 0) / datos.length * 100;
    const suenoScore = datos.reduce((sum, d) => sum + Math.min((d.horasSueno || 0) / 8, 1), 0) / datos.length * 100;
    const habitos = (aguaScore + suenoScore) / 2;

    // Dimensión nutrición
    const nutricion = datos.reduce((sum, d) => sum + (d.calidadAlimentacion || 5), 0) / datos.length * 10;

    // Dimensión social (por ahora basada en estado de ánimo)
    const social = emocional;

    return {
      emocional: Math.round(emocional),
      fisica: Math.round(fisica),
      habitos: Math.round(habitos),
      nutricion: Math.round(nutricion),
      social: Math.round(social)
    };
  }

  private calcularScoreIMC(imc: number): number {
    if (!imc || imc === 0) return 50;
    
    // Score óptimo entre 18.5 y 24.9
    if (imc >= 18.5 && imc <= 24.9) return 100;
    if (imc >= 25 && imc <= 29.9) return 75;
    if (imc >= 30 && imc <= 34.9) return 50;
    if (imc >= 35) return 25;
    if (imc < 18.5) return 60;
    
    return 50;
  }

  private clasificarBienestar(dimensiones: BienestarIntegral['dimensiones']): BienestarIntegral['clasificacion'] {
    const scoreTotal = Math.round(
      (dimensiones.emocional * 0.25) +
      (dimensiones.fisica * 0.25) +
      (dimensiones.habitos * 0.2) +
      (dimensiones.nutricion * 0.15) +
      (dimensiones.social * 0.15)
    );

    let nivel: 'optimo' | 'bueno' | 'regular' | 'bajo' | 'critico';
    let confianza: number;

    if (scoreTotal >= 80) {
      nivel = 'optimo';
      confianza = 0.9;
    } else if (scoreTotal >= 65) {
      nivel = 'bueno';
      confianza = 0.85;
    } else if (scoreTotal >= 50) {
      nivel = 'regular';
      confianza = 0.8;
    } else if (scoreTotal >= 35) {
      nivel = 'bajo';
      confianza = 0.75;
    } else {
      nivel = 'critico';
      confianza = 0.7;
    }

    return { nivel, confianza, scoreTotal };
  }

  private calcularTendencia(datos: DailyMLInput[]): 'ascendente' | 'estable' | 'descendente' {
    if (datos.length < 3) return 'estable';

    const mitad = Math.floor(datos.length / 2);
    const primeros = datos.slice(mitad);
    const ultimos = datos.slice(0, mitad);

    const scorePrimeros = this.calcularScoreGeneral(primeros);
    const scoreUltimos = this.calcularScoreGeneral(ultimos);

    if (scoreUltimos > scorePrimeros + 5) return 'ascendente';
    if (scoreUltimos < scorePrimeros - 5) return 'descendente';
    return 'estable';
  }

  private generarAlertas(
    dimensiones: BienestarIntegral['dimensiones'],
    datos: DailyMLInput[]
  ): BienestarIntegral['alertas'] {
    const alertas: BienestarIntegral['alertas'] = [];

    if (dimensiones.emocional < 40) {
      alertas.push({
        tipo: 'emocional_critico',
        mensaje: 'Tu bienestar emocional requiere atención inmediata. Considera buscar apoyo profesional.',
        severidad: 'danger'
      });
    }

    if (dimensiones.habitos < 50) {
      alertas.push({
        tipo: 'habitos_mejorables',
        mensaje: 'Tus hábitos diarios pueden mejorar. Enfócate en hidratación y sueño.',
        severidad: 'warning'
      });
    }

    if (dimensiones.fisica < 40) {
      alertas.push({
        tipo: 'actividad_baja',
        mensaje: 'Se recomienda aumentar tu nivel de actividad física.',
        severidad: 'warning'
      });
    }

    return alertas;
  }

  private detectarLogros(datos: DailyMLInput[]): BienestarIntegral['logros'] {
    const logros: BienestarIntegral['logros'] = [];

    // Racha de registro
    if (datos.length >= 7) {
      logros.push({
        nombre: '7 Días de Registro',
        descripcion: '¡Has registrado tu bienestar durante 7 días consecutivos!',
        fecha: Timestamp.now()
      });
    }

    // Meta de agua alcanzada
    const diasMetaAgua = datos.filter(d => d.vasosAgua >= 8).length;
    if (diasMetaAgua >= 5) {
      logros.push({
        nombre: 'Hidratación Óptima',
        descripcion: `Has alcanzado tu meta de hidratación ${diasMetaAgua} días`,
        fecha: Timestamp.now()
      });
    }

    // Actividad física consistente
    const diasActividad = datos.filter(d => d.actividadFisica).length;
    if (diasActividad >= 5) {
      logros.push({
        nombre: 'Activo y Saludable',
        descripcion: `Has realizado actividad física ${diasActividad} días`,
        fecha: Timestamp.now()
      });
    }

    return logros;
  }

  async getLatestBienestarIntegral(userId: string): Promise<BienestarIntegral | null> {
    try {
      const colRef = this.getBienestarIntegralCollection(userId);
      const q = query(colRef, orderBy('fecha', 'desc'), limit(1));
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      } as BienestarIntegral;
    } catch (error) {
      console.error('❌ Error obteniendo bienestar integral:', error);
      return null;
    }
  }

  // ============================================
  // MÉTODOS AUXILIARES
  // ============================================

  async getEstadisticasGenerales(userId: string): Promise<any> {
    try {
      const datos = await this.getDailyMLInputs(userId, 30);
      const auraInsight = await this.getLatestAuraInsight(userId);
      const bienestar = await this.getLatestBienestarIntegral(userId);

      return {
        totalRegistros: datos.length,
        promedioScore: this.calcularScoreGeneral(datos),
        ultimoInsight: auraInsight,
        bienestarActual: bienestar,
        racha: this.calcularRacha(datos)
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return null;
    }
  }

  private calcularRacha(datos: DailyMLInput[]): number {
    // Calcular días consecutivos de registro
    if (datos.length === 0) return 0;

    let racha = 1;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    for (let i = 0; i < datos.length - 1; i++) {
      const fechaActual = datos[i].fecha.toDate();
      const fechaSiguiente = datos[i + 1].fecha.toDate();
      
      fechaActual.setHours(0, 0, 0, 0);
      fechaSiguiente.setHours(0, 0, 0, 0);

      const diferencia = Math.floor((fechaActual.getTime() - fechaSiguiente.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diferencia === 1) {
        racha++;
      } else {
        break;
      }
    }

    return racha;
  }
}
