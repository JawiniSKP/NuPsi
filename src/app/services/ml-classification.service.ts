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
  addDoc,
  deleteDoc
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TensorflowMLService } from './tensorflow-ml.service';

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
  
  // 🔮 NUEVO: Predicción del futuro
  prediccionProximoDia?: {
    estadoAnimoPredicted: 'excelente' | 'bueno' | 'regular' | 'malo' | 'muy-malo';
    probabilidad: number;
    factoresInfluyentes: string[];
    recomendacionesPreventivas: string[];
  };
  
  // Análisis de patrones
  patronesDetectados: {
    tipo: string;
    descripcion: string;
    frecuencia: number;
  }[];
  
  // 🧠 NUEVO: Patrones avanzados
  patronesAvanzados?: {
    patronesTemporales: {
      tipo: 'diario' | 'semanal' | 'mensual';
      descripcion: string;
      diasAfectados: string[];
      confianza: number;
    }[];
    ciclosDetectados: {
      nombre: string;
      periodo: number; // días
      amplitud: number;
      proximoPico: Date;
    }[];
  };
  
  // 📊 NUEVO: Análisis de correlaciones
  correlaciones?: {
    factoresPositivos: {
      factor: string;
      impactoEnAnimo: number; // -100 a +100
      impactoEnEstres: number;
      certeza: number; // 0-1
    }[];
    factoresNegativos: {
      factor: string;
      impactoEnAnimo: number;
      impactoEnEstres: number;
      certeza: number;
    }[];
    interacciones: {
      condicion: string;
      efecto: string;
      frecuencia: number;
    }[];
  };
  
  // Recomendaciones IA
  recomendaciones: {
    area: 'emocional' | 'fisica' | 'habitos' | 'alimentacion';
    mensaje: string;
    prioridad: 'alta' | 'media' | 'baja';
  }[];
  
  // 🎯 NUEVO: Recomendaciones personalizadas ML
  recomendacionesPersonalizadas?: {
    ejercicios: {
      nombre: string;
      razon: string;
      efectividad: number; // % basado en historial
      mejorMomento: string;
    }[];
    actividades: {
      tipo: string;
      duracion: string;
      razon: string;
      impactoEsperado: number;
    }[];
    habitos: {
      habito: string;
      beneficio: string;
      facilidad: 'muy facil' | 'facil' | 'moderado' | 'dificil';
      prioridad: number;
    }[];
  };
  
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
  
  // 📈 NUEVO: Análisis de factores de impacto
  analisisFactores?: {
    masImpacto: {
      dimension: string;
      factor: string;
      impacto: number; // 0-100
      tendencia: 'mejorando' | 'estable' | 'empeorando';
    }[];
    potencialMejora: {
      dimension: string;
      mejoraPosible: number; // puntos potenciales
      accionesRecomendadas: string[];
      esfuerzoRequerido: 'bajo' | 'medio' | 'alto';
    }[];
  };
  
  // Tendencias
  tendenciaSemanal: 'ascendente' | 'estable' | 'descendente';
  tendenciaMensual: 'ascendente' | 'estable' | 'descendente';
  
  // ⚠️ NUEVO: Predicción de tendencias
  prediccionTendencias?: {
    proximaSemana: {
      scoreEsperado: number;
      probabilidad: number;
      factoresRiesgo: string[];
    };
    proximoMes: {
      scoreEsperado: number;
      probabilidad: number;
      oportunidades: string[];
    };
  };
  
  // Alertas
  alertas: {
    tipo: string;
    mensaje: string;
    severidad: 'info' | 'warning' | 'danger';
  }[];
  
  // 🚨 NUEVO: Detección temprana de riesgos
  alertasTemprana?: {
    nivelRiesgo: 'bajo' | 'medio' | 'alto' | 'critico';
    senalesDetectadas: {
      senal: string;
      gravedad: number; // 0-100
      diasDetectado: number;
    }[];
    comparacionConHistorial: {
      evento: string;
      fecha: Date;
      similitud: number; // 0-1
      resolucion: string;
    }[];
    recomendacionesUrgentes: {
      accion: string;
      razon: string;
      urgencia: 'inmediata' | 'pronto' | 'cuando_puedas';
    }[];
  };
  
  // Logros
  logros: {
    nombre: string;
    descripcion: string;
    fecha: Timestamp;
  }[];
  
  // 🏆 NUEVO: Predicción de logros
  proximosLogros?: {
    nombre: string;
    progreso: number; // 0-100
    diasEstimados: number;
    probabilidadExito: number;
    obstaculosPotenciales: string[];
    recomendaciones: string[];
  }[];
  
  creadoEn: Timestamp;
}

@Injectable({
  providedIn: 'root'
})
export class MLClassificationService {
  private firestore: Firestore;
  private auth: Auth;
  private tensorflowML: TensorflowMLService;
  private useTensorflowML = true; // Flag para activar/desactivar ML real

  constructor() {
    this.firestore = inject(Firestore);
    this.auth = inject(Auth);
    this.tensorflowML = inject(TensorflowMLService);
    
    console.log('🤖 ML Classification Service inicializado');
    console.log('🧠 TensorFlow ML:', this.useTensorflowML ? 'ACTIVADO' : 'DESACTIVADO');
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

  async getDailyMLInputById(userId: string, registroId: string): Promise<DailyMLInput | null> {
    try {
      const docRef = doc(this.firestore, `usuarios/${userId}/dailyMLInputs/${registroId}`);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.warn('⚠️ Registro no encontrado:', registroId);
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      } as DailyMLInput;
    } catch (error) {
      console.error('❌ Error obteniendo registro por ID:', error);
      return null;
    }
  }

  async deleteDailyMLInput(userId: string, registroId: string): Promise<boolean> {
    try {
      const docRef = doc(this.firestore, `usuarios/${userId}/dailyMLInputs/${registroId}`);
      await deleteDoc(docRef);
      console.log('✅ Registro eliminado exitosamente:', registroId);
      return true;
    } catch (error) {
      console.error('❌ Error eliminando registro:', error);
      return false;
    }
  }

  async updateDailyMLInput(userId: string, registroId: string, input: Partial<DailyMLInput>): Promise<boolean> {
    try {
      console.log('🔄 Actualizando registro...', registroId);
      
      const now = Timestamp.now();
      const updateData = {
        ...input,
        actualizadoEn: now
      };

      const docRef = doc(this.firestore, `usuarios/${userId}/dailyMLInputs/${registroId}`);
      const updateDataClean = JSON.parse(JSON.stringify(updateData));
      
      await updateDoc(docRef, {
        ...updateDataClean,
        actualizadoEn: now
      });

      console.log('✅ Registro actualizado exitosamente:', registroId);
      return true;
    } catch (error) {
      console.error('❌ Error actualizando registro:', error);
      return false;
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

      // USAR TENSORFLOW ML SI ESTÁ ACTIVADO
      let clasificacion: AuraInsight['clasificacionEmocional'];
      
      if (this.useTensorflowML && datos.length >= 10) {
        console.log('🧠 Usando TensorFlow ML para clasificación emocional');
        
        // Entrenar o cargar modelo
        await this.tensorflowML.loadModel('emotional');
        const modelStatus = this.tensorflowML.getModelsStatus();
        
        if (!modelStatus.emotional.trained) {
          console.log('📚 Entrenando modelo con datos del usuario...');
          await this.tensorflowML.trainEmotionalModel(datos);
          await this.tensorflowML.saveModel('emotional');
        }
        
        // Predecir con el último dato
        const ultimoDato = datos[datos.length - 1];
        const resultado = await this.tensorflowML.predictEmotionalState(ultimoDato);
        
        // Calcular tendencia comparando con datos anteriores
        let tendencia: 'mejorando' | 'estable' | 'empeorando' = 'estable';
        if (datos.length >= 3) {
          const datoAnterior = datos[datos.length - 3];
          const resultadoAnterior = await this.tensorflowML.predictEmotionalState(datoAnterior);
          
          const scoreActual = resultado.probabilidades.positivo + resultado.probabilidades.neutral * 0.5;
          const scoreAnterior = resultadoAnterior.probabilidades.positivo + resultadoAnterior.probabilidades.neutral * 0.5;
          
          if (scoreActual > scoreAnterior + 0.1) tendencia = 'mejorando';
          else if (scoreActual < scoreAnterior - 0.1) tendencia = 'empeorando';
        }
        
        clasificacion = {
          categoria: resultado.categoria,
          confianza: resultado.confianza,
          emocionDominante: this.extractDominantEmotion(datos),
          tendencia
        };
      } else {
        console.log('⚙️ Usando clasificación heurística (datos insuficientes o ML desactivado)');
        clasificacion = this.clasificarEstadoEmocional(datos);
      }

      // Detectar patrones y generar recomendaciones
      const patrones = this.detectarPatrones(datos);
      const recomendaciones = this.generarRecomendaciones(clasificacion, patrones);
      const score = await this.calcularScoreGeneralML(datos);

      // 🚀 NUEVOS ANÁLISIS ML AVANZADOS
      const prediccionProximoDia = this.predecirProximoDia(datos);
      const patronesAvanzados = this.detectarPatronesAvanzados(datos);
      const correlaciones = this.analizarCorrelaciones(datos);
      const recomendacionesPersonalizadas = this.generarRecomendacionesPersonalizadas(datos);

      console.log('🔮 Predicción futuro:', prediccionProximoDia ? 'Generada' : 'No disponible');
      console.log('🧠 Patrones avanzados:', patronesAvanzados ? 'Detectados' : 'No detectados');
      console.log('📊 Correlaciones:', correlaciones ? 'Analizadas' : 'Insuficientes datos');
      console.log('🎯 Recomendaciones personalizadas:', recomendacionesPersonalizadas ? 'Generadas' : 'Pendiente');

      const insight: AuraInsight = {
        userId,
        fecha: Timestamp.now(),
        clasificacionEmocional: clasificacion,
        prediccionProximoDia,
        patronesDetectados: patrones,
        patronesAvanzados,
        correlaciones,
        recomendaciones,
        recomendacionesPersonalizadas,
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

      console.log('✅ Insight de Aura generado con ML');
    } catch (error) {
      console.error('❌ Error generando insight Aura:', error);
      throw error;
    }
  }

  private extractDominantEmotion(datos: DailyMLInput[]): string {
    const emocionesContadas: { [key: string]: number } = {};
    datos.forEach(dato => {
      dato.emociones.forEach(emocion => {
        emocionesContadas[emocion] = (emocionesContadas[emocion] || 0) + 1;
      });
    });
    return Object.entries(emocionesContadas)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';
  }

  private async calcularScoreGeneralML(datos: DailyMLInput[]): Promise<number> {
    if (this.useTensorflowML && datos.length >= 20) {
      try {
        await this.tensorflowML.loadModel('wellness');
        const modelStatus = this.tensorflowML.getModelsStatus();
        
        if (!modelStatus.wellness.trained) {
          await this.tensorflowML.trainWellnessModel(datos);
          await this.tensorflowML.saveModel('wellness');
        }
        
        const ultimoDato = datos[datos.length - 1];
        const prediccion = await this.tensorflowML.predictWellnessScore(ultimoDato);
        return prediccion.scorePredicho;
      } catch (error) {
        console.warn('⚠️ Error en predicción ML, usando heurística:', error);
        return this.calcularScoreGeneral(datos);
      }
    }
    return this.calcularScoreGeneral(datos);
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

  // ============================================
  // 🚀 NUEVOS MÉTODOS ML AVANZADOS
  // ============================================

  /**
   * 🔮 Predice el estado emocional del próximo día usando análisis de series temporales
   */
  private predecirProximoDia(datos: DailyMLInput[]): AuraInsight['prediccionProximoDia'] {
    if (datos.length < 3) return undefined;

    try {
      // Analizar tendencias de los últimos días
      const ultimos3 = datos.slice(-3);
      const scoresEmocionales = ultimos3.map(d => this.mapEstadoAnimoToScore(d.estadoAnimo));
      const tendencia = scoresEmocionales[2] - scoresEmocionales[0];

      // Factores que influyen
      const factoresInfluyentes: string[] = [];
      const ultimoDato = datos[datos.length - 1];

      // Analizar sueño
      if (ultimoDato.horasSueno && ultimoDato.horasSueno >= 7) {
        factoresInfluyentes.push(`Dormiste bien anoche (${ultimoDato.horasSueno}h)`);
      } else if (ultimoDato.horasSueno && ultimoDato.horasSueno < 6) {
        factoresInfluyentes.push(`Poco sueño anoche (${ultimoDato.horasSueno}h) - puede afectar tu ánimo`);
      }

      // Analizar estrés
      if (ultimoDato.nivelEstres <= 3) {
        factoresInfluyentes.push('Nivel de estrés bajo - buen indicador');
      } else if (ultimoDato.nivelEstres >= 7) {
        factoresInfluyentes.push(`Estrés alto (${ultimoDato.nivelEstres}/10) - puede continuar mañana`);
      }

      // Analizar patrón semanal
      const fecha = ultimoDato.fecha.toDate();
      const diaSemana = fecha.getDay();
      const nombreDia = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][diaSemana];
      const diaSiguiente = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][(diaSemana + 1) % 7];

      // Analizar historial del día de la semana
      const datosDelDia = datos.filter(d => d.fecha.toDate().getDay() === ((diaSemana + 1) % 7));
      if (datosDelDia.length > 0) {
        const promedioDelDia = datosDelDia.reduce((sum, d) => sum + this.mapEstadoAnimoToScore(d.estadoAnimo), 0) / datosDelDia.length;
        if (promedioDelDia < 60) {
          factoresInfluyentes.push(`Los ${diaSiguiente}s suelen ser difíciles para ti`);
        } else if (promedioDelDia > 75) {
          factoresInfluyentes.push(`Históricamente te sientes bien los ${diaSiguiente}s`);
        }
      }

      // Calcular predicción
      let scorePredicted = scoresEmocionales[2] + (tendencia * 0.5); // 50% de la tendencia
      scorePredicted = Math.max(10, Math.min(100, scorePredicted)); // Limitar entre 10-100

      // Determinar estado de ánimo predicho
      let estadoPredicted: 'excelente' | 'bueno' | 'regular' | 'malo' | 'muy-malo';
      if (scorePredicted >= 90) estadoPredicted = 'excelente';
      else if (scorePredicted >= 70) estadoPredicted = 'bueno';
      else if (scorePredicted >= 45) estadoPredicted = 'regular';
      else if (scorePredicted >= 20) estadoPredicted = 'malo';
      else estadoPredicted = 'muy-malo';

      // Calcular probabilidad (basada en consistencia de datos)
      const varianza = this.calcularVarianza(scoresEmocionales);
      const probabilidad = Math.max(0.5, Math.min(0.95, 1 - (varianza / 100)));

      // Recomendaciones preventivas
      const recomendacionesPreventivas: string[] = [];
      if (estadoPredicted === 'malo' || estadoPredicted === 'muy-malo') {
        recomendacionesPreventivas.push('🧘 Programa una actividad relajante para mañana');
        recomendacionesPreventivas.push('💤 Intenta dormir temprano esta noche (8h)');
        recomendacionesPreventivas.push('📞 Ten a mano contactos de apoyo emocional');
      } else if (estadoPredicted === 'regular') {
        recomendacionesPreventivas.push('🚶 Planifica una caminata o ejercicio ligero');
        recomendacionesPreventivas.push('💧 Mantén tu hidratación (8 vasos)');
      }

      return {
        estadoAnimoPredicted: estadoPredicted,
        probabilidad: Math.round(probabilidad * 100) / 100,
        factoresInfluyentes,
        recomendacionesPreventivas
      };
    } catch (error) {
      console.warn('⚠️ Error en predicción de próximo día:', error);
      return undefined;
    }
  }

  /**
   * 🧠 Detecta patrones temporales avanzados y ciclos en los datos
   */
  private detectarPatronesAvanzados(datos: DailyMLInput[]): AuraInsight['patronesAvanzados'] {
    if (datos.length < 7) return undefined;

    try {
      const patronesTemporales: NonNullable<AuraInsight['patronesAvanzados']>['patronesTemporales'] = [];
      const ciclosDetectados: NonNullable<AuraInsight['patronesAvanzados']>['ciclosDetectados'] = [];

      // Analizar patrón por día de la semana
      const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      for (let dia = 0; dia < 7; dia++) {
        const datosDia = datos.filter(d => d.fecha.toDate().getDay() === dia);
        if (datosDia.length >= 2) {
          const scorePromedio = datosDia.reduce((sum, d) => sum + this.mapEstadoAnimoToScore(d.estadoAnimo), 0) / datosDia.length;
          if (scorePromedio < 50) {
            patronesTemporales.push({
              tipo: 'semanal',
              descripcion: `Los ${diasSemana[dia]}s sueles sentirte más estresado o con bajo ánimo`,
              diasAfectados: [diasSemana[dia]],
              confianza: Math.min(0.95, datosDia.length / 4)
            });
          } else if (scorePromedio > 80) {
            patronesTemporales.push({
              tipo: 'semanal',
              descripcion: `Los ${diasSemana[dia]}s típicamente son buenos días para ti`,
              diasAfectados: [diasSemana[dia]],
              confianza: Math.min(0.95, datosDia.length / 4)
            });
          }
        }
      }

      // Detectar ciclo semanal (7 días)
      if (datos.length >= 14) {
        const scores = datos.map(d => this.mapEstadoAnimoToScore(d.estadoAnimo));
        const correlacion7dias = this.calcularAutocorrelacion(scores, 7);
        
        if (Math.abs(correlacion7dias) > 0.5) {
          // Encontrar próximo pico
          const diasHastaPico = 7 - (datos.length % 7);
          const fechaPico = new Date();
          fechaPico.setDate(fechaPico.getDate() + diasHastaPico);

          ciclosDetectados.push({
            nombre: 'Ciclo Semanal',
            periodo: 7,
            amplitud: Math.abs(correlacion7dias),
            proximoPico: fechaPico
          });
        }
      }

      return patronesTemporales.length > 0 || ciclosDetectados.length > 0 ? {
        patronesTemporales,
        ciclosDetectados
      } : undefined;
    } catch (error) {
      console.warn('⚠️ Error en detección de patrones avanzados:', error);
      return undefined;
    }
  }

  /**
   * 📊 Analiza correlaciones entre factores y el estado emocional
   */
  private analizarCorrelaciones(datos: DailyMLInput[]): AuraInsight['correlaciones'] {
    if (datos.length < 5) return undefined;

    try {
      const factoresPositivos: NonNullable<AuraInsight['correlaciones']>['factoresPositivos'] = [];
      const factoresNegativos: NonNullable<AuraInsight['correlaciones']>['factoresNegativos'] = [];
      const interacciones: NonNullable<AuraInsight['correlaciones']>['interacciones'] = [];

      const scores = datos.map(d => this.mapEstadoAnimoToScore(d.estadoAnimo));

      // Correlación con sueño
      const horasSueno = datos.map(d => d.horasSueno || 0);
      const corrSueno = this.calcularCorrelacion(horasSueno, scores);
      if (corrSueno > 0.3) {
        const datosConBuenSueno = datos.filter(d => (d.horasSueno || 0) >= 7);
        const mejoriaPromedio = datosConBuenSueno.length > 0 
          ? ((datosConBuenSueno.reduce((sum, d) => sum + this.mapEstadoAnimoToScore(d.estadoAnimo), 0) / datosConBuenSueno.length) - 50)
          : 0;
        
        factoresPositivos.push({
          factor: 'Dormir 7+ horas',
          impactoEnAnimo: Math.round(mejoriaPromedio),
          impactoEnEstres: -Math.round(mejoriaPromedio * 0.4),
          certeza: Math.min(0.95, Math.abs(corrSueno))
        });
      } else if (corrSueno < -0.3) {
        factoresNegativos.push({
          factor: 'Poco sueño (<6 horas)',
          impactoEnAnimo: Math.round(corrSueno * 50),
          impactoEnEstres: Math.round(Math.abs(corrSueno) * 30),
          certeza: Math.min(0.95, Math.abs(corrSueno))
        });
      }

      // Correlación con actividad física
      const actividad = datos.map(d => d.actividadFisica ? 1 : 0);
      const corrActividad = this.calcularCorrelacion(actividad, scores);
      if (corrActividad > 0.25) {
        const datosConEjercicio = datos.filter(d => d.actividadFisica);
        const mejoria = datosConEjercicio.length > 0
          ? ((datosConEjercicio.reduce((sum, d) => sum + this.mapEstadoAnimoToScore(d.estadoAnimo), 0) / datosConEjercicio.length) - 50)
          : 0;
        
        factoresPositivos.push({
          factor: 'Actividad física',
          impactoEnAnimo: Math.round(mejoria),
          impactoEnEstres: -Math.round(mejoria * 0.5),
          certeza: Math.min(0.9, Math.abs(corrActividad))
        });
      }

      // Correlación con hidratación
      const agua = datos.map(d => d.vasosAgua);
      const corrAgua = this.calcularCorrelacion(agua, scores);
      if (corrAgua > 0.2) {
        factoresPositivos.push({
          factor: 'Buena hidratación (6+ vasos)',
          impactoEnAnimo: Math.round(corrAgua * 40),
          impactoEnEstres: -Math.round(corrAgua * 20),
          certeza: Math.min(0.85, Math.abs(corrAgua))
        });
      } else if (corrAgua < -0.2) {
        factoresNegativos.push({
          factor: 'Poca hidratación (<4 vasos)',
          impactoEnAnimo: Math.round(corrAgua * 40),
          impactoEnEstres: Math.round(Math.abs(corrAgua) * 25),
          certeza: Math.min(0.85, Math.abs(corrAgua))
        });
      }

      // Detectar interacciones (ejercicio + buena alimentación)
      const datosEjercicioYComida = datos.filter(d => d.actividadFisica && (d.calidadAlimentacion || 0) >= 7);
      if (datosEjercicioYComida.length >= 3) {
        const scoreCombinado = datosEjercicioYComida.reduce((sum, d) => sum + this.mapEstadoAnimoToScore(d.estadoAnimo), 0) / datosEjercicioYComida.length;
        const scoreBase = scores.reduce((a, b) => a + b, 0) / scores.length;
        if (scoreCombinado > scoreBase + 15) {
          interacciones.push({
            condicion: 'Ejercicio + Buena alimentación',
            efecto: `Sinergia: +${Math.round(scoreCombinado - scoreBase)}% bienestar (mejor que individual)`,
            frecuencia: datosEjercicioYComida.length
          });
        }
      }

      return factoresPositivos.length > 0 || factoresNegativos.length > 0 || interacciones.length > 0 ? {
        factoresPositivos,
        factoresNegativos,
        interacciones
      } : undefined;
    } catch (error) {
      console.warn('⚠️ Error en análisis de correlaciones:', error);
      return undefined;
    }
  }

  /**
   * 🎯 Genera recomendaciones personalizadas basadas en el historial del usuario
   */
  private generarRecomendacionesPersonalizadas(datos: DailyMLInput[]): AuraInsight['recomendacionesPersonalizadas'] {
    if (datos.length < 5) return undefined;

    try {
      const ejercicios: NonNullable<AuraInsight['recomendacionesPersonalizadas']>['ejercicios'] = [];
      const actividades: NonNullable<AuraInsight['recomendacionesPersonalizadas']>['actividades'] = [];
      const habitos: NonNullable<AuraInsight['recomendacionesPersonalizadas']>['habitos'] = [];

      // Analizar qué ejercicios funcionaron mejor
      const datosConEjercicio = datos.filter(d => d.actividadFisica && d.tipoActividad);
      if (datosConEjercicio.length > 0) {
        const tiposEjercicio: { [key: string]: number[] } = {};
        datosConEjercicio.forEach(d => {
          const tipo = d.tipoActividad!.toLowerCase();
          if (!tiposEjercicio[tipo]) tiposEjercicio[tipo] = [];
          tiposEjercicio[tipo].push(this.mapEstadoAnimoToScore(d.estadoAnimo));
        });

        // Encontrar el mejor ejercicio
        Object.entries(tiposEjercicio).forEach(([tipo, scores]) => {
          const promedio = scores.reduce((a, b) => a + b, 0) / scores.length;
          if (promedio > 65) {
            const efectividad = Math.round((promedio / 100) * 100);
            const mejorMomento = this.determinarMejorMomento(datosConEjercicio.filter(d => d.tipoActividad?.toLowerCase() === tipo));
            
            ejercicios.push({
              nombre: tipo.charAt(0).toUpperCase() + tipo.slice(1),
              razon: `Mejora tu ánimo en promedio. Ha funcionado ${scores.length} veces`,
              efectividad,
              mejorMomento
            });
          }
        });
      }

      // Recomendar actividades basadas en patrones
      const promedioSueno = datos.reduce((sum, d) => sum + (d.horasSueno || 0), 0) / datos.length;
      if (promedioSueno < 7) {
        actividades.push({
          tipo: 'Rutina de sueño',
          duracion: '30 minutos antes de dormir',
          razon: 'Tu promedio de sueño es bajo. Una rutina ayuda a dormir mejor',
          impactoEsperado: Math.round((8 - promedioSueno) * 15)
        });
      }

      const promedioEstres = datos.reduce((sum, d) => sum + d.nivelEstres, 0) / datos.length;
      if (promedioEstres > 6) {
        actividades.push({
          tipo: 'Meditación o respiración',
          duracion: '10-15 minutos',
          razon: `Tu estrés promedio es ${promedioEstres.toFixed(1)}/10. La meditación reduce estrés 40-50%`,
          impactoEsperado: Math.round((promedioEstres - 5) * 10)
        });
      }

      // Hábitos sugeridos por facilidad e impacto
      const promedioAgua = datos.reduce((sum, d) => sum + d.vasosAgua, 0) / datos.length;
      if (promedioAgua < 7) {
        habitos.push({
          habito: 'Beber agua al despertar',
          beneficio: 'Hidratación temprana mejora energía y concentración',
          facilidad: 'muy facil',
          prioridad: 1
        });
      }

      if (datos.filter(d => d.actividadFisica).length / datos.length < 0.5) {
        habitos.push({
          habito: 'Caminata de 15 minutos después de comer',
          beneficio: 'Aumenta energía y mejora digestión',
          facilidad: 'facil',
          prioridad: 2
        });
      }

      return ejercicios.length > 0 || actividades.length > 0 || habitos.length > 0 ? {
        ejercicios,
        actividades,
        habitos
      } : undefined;
    } catch (error) {
      console.warn('⚠️ Error generando recomendaciones personalizadas:', error);
      return undefined;
    }
  }

  // Métodos auxiliares para cálculos estadísticos
  private calcularVarianza(valores: number[]): number {
    if (valores.length === 0) return 0;
    const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
    const varianza = valores.reduce((sum, val) => sum + Math.pow(val - promedio, 2), 0) / valores.length;
    return varianza;
  }

  private calcularCorrelacion(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;
    
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = (n * sumXY) - (sumX * sumY);
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private calcularAutocorrelacion(datos: number[], lag: number): number {
    if (datos.length < lag * 2) return 0;
    const x = datos.slice(0, -lag);
    const y = datos.slice(lag);
    return this.calcularCorrelacion(x, y);
  }

  private determinarMejorMomento(datos: DailyMLInput[]): string {
    if (datos.length === 0) return 'Cualquier momento';
    
    const horas = datos.map(d => d.fecha.toDate().getHours());
    const promedioHora = Math.round(horas.reduce((a, b) => a + b, 0) / horas.length);
    
    if (promedioHora < 10) return 'Mañana temprano (6-10 AM)';
    if (promedioHora < 14) return 'Media mañana (10 AM - 2 PM)';
    if (promedioHora < 18) return 'Tarde (2-6 PM)';
    return 'Noche (6-10 PM)';
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

      // 🚀 NUEVOS ANÁLISIS ML AVANZADOS - BIENESTAR
      const analisisFactores = this.analizarFactoresDeImpacto(datos, dimensiones);
      const prediccionTendencias = this.predecirTendenciasBienestar(datos, clasificacion.scoreTotal);
      const alertasTemprana = this.detectarAlertasTemprana(datos, dimensiones);
      const proximosLogros = this.predecirProximosLogros(datos);

      console.log('📈 Análisis de factores:', analisisFactores ? 'Generado' : 'No disponible');
      console.log('🔮 Predicción tendencias:', prediccionTendencias ? 'Generada' : 'Insuficientes datos');
      console.log('🚨 Alertas tempranas:', alertasTemprana ? `Nivel ${alertasTemprana.nivelRiesgo}` : 'Sin riesgos');
      console.log('🏆 Próximos logros:', proximosLogros ? `${proximosLogros.length} detectados` : 'Ninguno');

      const bienestar: BienestarIntegral = {
        userId,
        fecha: Timestamp.now(),
        clasificacion,
        dimensiones,
        analisisFactores,
        tendenciaSemanal,
        tendenciaMensual,
        prediccionTendencias,
        alertas,
        alertasTemprana,
        logros,
        proximosLogros,
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

  // ============================================
  // 🚀 NUEVOS MÉTODOS ML AVANZADOS - BIENESTAR
  // ============================================

  /**
   * 📈 Analiza qué factores tienen más impacto en cada dimensión
   */
  private analizarFactoresDeImpacto(datos: DailyMLInput[], dimensiones: BienestarIntegral['dimensiones']): BienestarIntegral['analisisFactores'] {
    if (datos.length < 7) return undefined;

    try {
      const masImpacto: NonNullable<BienestarIntegral['analisisFactores']>['masImpacto'] = [];
      const potencialMejora: NonNullable<BienestarIntegral['analisisFactores']>['potencialMejora'] = [];

      // Analizar dimensión emocional
      if (dimensiones.emocional < 80) {
        const impactoSueno = this.calcularImpactoFactor(datos, 'sueno');
        masImpacto.push({
          dimension: 'Emocional',
          factor: 'Calidad de sueño',
          impacto: impactoSueno,
          tendencia: impactoSueno > 70 ? 'mejorando' : 'empeorando'
        });

        const mejoraPosible = 100 - dimensiones.emocional;
        potencialMejora.push({
          dimension: 'Emocional',
          mejoraPosible: Math.round(mejoraPosible * 0.6), // 60% mejora realista
          accionesRecomendadas: [
            'Dormir 7-8 horas consistentemente',
            'Practicar técnicas de manejo de estrés',
            'Mantener actividad física regular'
          ],
          esfuerzoRequerido: mejoraPosible > 30 ? 'alto' : 'medio'
        });
      }

      // Analizar dimensión física
      if (dimensiones.fisica < 75) {
        masImpacto.push({
          dimension: 'Física',
          factor: 'Actividad física',
          impacto: (datos.filter(d => d.actividadFisica).length / datos.length) * 100,
          tendencia: 'estable'
        });

        potencialMejora.push({
          dimension: 'Física',
          mejoraPosible: Math.round((75 - dimensiones.fisica) * 0.7),
          accionesRecomendadas: [
            'Incrementar ejercicio a 4-5 días/semana',
            'Variar tipos de actividad (cardio, fuerza, flexibilidad)',
            'Establecer metas progresivas'
          ],
          esfuerzoRequerido: 'medio'
        });
      }

      // Analizar dimensión hábitos
      if (dimensiones.habitos < 70) {
        potencialMejora.push({
          dimension: 'Hábitos',
          mejoraPosible: Math.round((70 - dimensiones.habitos) * 0.8),
          accionesRecomendadas: [
            'Beber 8 vasos de agua diarios',
            'Rutina de sueño constante (misma hora)',
            'Reducir tiempo de pantallas antes de dormir'
          ],
          esfuerzoRequerido: 'bajo'
        });
      }

      return masImpacto.length > 0 || potencialMejora.length > 0 ? {
        masImpacto,
        potencialMejora
      } : undefined;
    } catch (error) {
      console.warn('⚠️ Error en análisis de factores:', error);
      return undefined;
    }
  }

  /**
   * 🔮 Predice tendencias futuras basadas en datos históricos
   */
  private predecirTendenciasBienestar(datos: DailyMLInput[], scoreActual: number): BienestarIntegral['prediccionTendencias'] {
    if (datos.length < 14) return undefined;

    try {
      // Analizar últimas 2 semanas
      const ultimas2Semanas = datos.slice(0, 14);
      const scoresSemana1 = ultimas2Semanas.slice(0, 7).map(d => this.calcularScoreGeneral([d]));
      const scoresSemana2 = ultimas2Semanas.slice(7, 14).map(d => this.calcularScoreGeneral([d]));

      const promedioSemana1 = scoresSemana1.reduce((a, b) => a + b, 0) / scoresSemana1.length;
      const promedioSemana2 = scoresSemana2.reduce((a, b) => a + b, 0) / scoresSemana2.length;

      const tendenciaReciente = promedioSemana2 - promedioSemana1;

      // Predicción próxima semana
      let scoreEsperadoSemana = scoreActual + (tendenciaReciente * 0.6); // 60% de la tendencia
      scoreEsperadoSemana = Math.max(20, Math.min(95, scoreEsperadoSemana));

      const factoresRiesgo: string[] = [];
      if (tendenciaReciente < -5) {
        factoresRiesgo.push('Tendencia descendente en las últimas semanas');
      }
      
      const promedioSueno = datos.slice(0, 7).reduce((sum, d) => sum + (d.horasSueno || 0), 0) / 7;
      if (promedioSueno < 6.5) {
        factoresRiesgo.push('Sueño insuficiente puede afectar próxima semana');
      }

      const promedioEstres = datos.slice(0, 7).reduce((sum, d) => sum + d.nivelEstres, 0) / 7;
      if (promedioEstres > 7) {
        factoresRiesgo.push('Nivel de estrés alto persistente');
      }

      // Predicción próximo mes
      let scoreEsperadoMes = scoreActual + (tendenciaReciente * 1.5);
      scoreEsperadoMes = Math.max(25, Math.min(90, scoreEsperadoMes));

      const oportunidades: string[] = [];
      if (tendenciaReciente > 2) {
        oportunidades.push('Momentum positivo - aprovecha para establecer nuevos hábitos');
      }
      
      const diasConEjercicio = datos.slice(0, 30).filter(d => d.actividadFisica).length;
      if (diasConEjercicio >= 15) {
        oportunidades.push('Consistencia en ejercicio abriendo oportunidad para nuevas metas');
      }

      return {
        proximaSemana: {
          scoreEsperado: Math.round(scoreEsperadoSemana),
          probabilidad: Math.round(Math.max(0.6, 0.9 - Math.abs(tendenciaReciente) / 20) * 100) / 100,
          factoresRiesgo
        },
        proximoMes: {
          scoreEsperado: Math.round(scoreEsperadoMes),
          probabilidad: Math.round(Math.max(0.5, 0.8 - Math.abs(tendenciaReciente) / 15) * 100) / 100,
          oportunidades
        }
      };
    } catch (error) {
      console.warn('⚠️ Error en predicción de tendencias:', error);
      return undefined;
    }
  }

  /**
   * 🚨 Detección temprana de riesgos comparando con historial
   */
  private detectarAlertasTemprana(datos: DailyMLInput[], dimensiones: BienestarIntegral['dimensiones']): BienestarIntegral['alertasTemprana'] {
    if (datos.length < 7) return undefined;

    try {
      const senalesDetectadas: NonNullable<BienestarIntegral['alertasTemprana']>['senalesDetectadas'] = [];
      const comparacionConHistorial: NonNullable<BienestarIntegral['alertasTemprana']>['comparacionConHistorial'] = [];
      const recomendacionesUrgentes: NonNullable<BienestarIntegral['alertasTemprana']>['recomendacionesUrgentes'] = [];

      const ultimos7Dias = datos.slice(0, 7);

      // Detectar señales de alerta
      const diasEstresAlto = ultimos7Dias.filter(d => d.nivelEstres >= 8).length;
      if (diasEstresAlto >= 4) {
        senalesDetectadas.push({
          senal: 'Estrés alto durante 4+ días consecutivos',
          gravedad: Math.min(100, diasEstresAlto * 15),
          diasDetectado: diasEstresAlto
        });
      }

      const promedioSueno = ultimos7Dias.reduce((sum, d) => sum + (d.horasSueno || 0), 0) / ultimos7Dias.length;
      const tendenciaSueno = ultimos7Dias.slice(-3).reduce((sum, d) => sum + (d.horasSueno || 0), 0) / 3;
      
      if (tendenciaSueno < promedioSueno - 1.5) {
        senalesDetectadas.push({
          senal: 'Calidad de sueño en descenso (-30% vs promedio)',
          gravedad: Math.round(((promedioSueno - tendenciaSueno) / promedioSueno) * 100),
          diasDetectado: 3
        });
      }

      // Detectar emociones negativas persistentes
      const emocionesNegativas = ['triste', 'ansioso', 'estresado', 'enojado'];
      let countNegativos = 0;
      ultimos7Dias.forEach(d => {
        d.emociones.forEach(e => {
          if (emocionesNegativas.includes(e.toLowerCase())) countNegativos++;
        });
      });

      if (countNegativos >= ultimos7Dias.length * 1.5) {
        senalesDetectadas.push({
          senal: 'Emociones negativas +150% vs baseline',
          gravedad: Math.min(100, (countNegativos / ultimos7Dias.length) * 50),
          diasDetectado: 7
        });
      }

      // Calcular nivel de riesgo
      const gravedadTotal = senalesDetectadas.reduce((sum, s) => sum + s.gravedad, 0) / (senalesDetectadas.length || 1);
      let nivelRiesgo: 'bajo' | 'medio' | 'alto' | 'critico';
      
      if (gravedadTotal >= 75) nivelRiesgo = 'critico';
      else if (gravedadTotal >= 50) nivelRiesgo = 'alto';
      else if (gravedadTotal >= 30) nivelRiesgo = 'medio';
      else nivelRiesgo = 'bajo';

      // Generar recomendaciones urgentes según nivel de riesgo
      if (nivelRiesgo === 'critico' || nivelRiesgo === 'alto') {
        recomendacionesUrgentes.push({
          accion: 'Contactar con profesional de salud mental',
          razon: 'Múltiples señales de alerta detectadas en período crítico',
          urgencia: nivelRiesgo === 'critico' ? 'inmediata' : 'pronto'
        });

        recomendacionesUrgentes.push({
          accion: 'Priorizar autocuidado inmediato',
          razon: 'Descanso, hidratación y ejercicio ligero pueden ayudar',
          urgencia: 'pronto'
        });
      }

      if (promedioSueno < 6) {
        recomendacionesUrgentes.push({
          accion: 'Establecer rutina de sueño estricta',
          razon: 'Sueño insuficiente amplifica otros problemas',
          urgencia: nivelRiesgo === 'alto' ? 'pronto' : 'cuando_puedas'
        });
      }

      return senalesDetectadas.length > 0 ? {
        nivelRiesgo,
        senalesDetectadas,
        comparacionConHistorial,
        recomendacionesUrgentes
      } : undefined;
    } catch (error) {
      console.warn('⚠️ Error en detección temprana:', error);
      return undefined;
    }
  }

  /**
   * 🏆 Predice próximos logros alcanzables
   */
  private predecirProximosLogros(datos: DailyMLInput[]): BienestarIntegral['proximosLogros'] {
    if (datos.length < 5) return undefined;

    try {
      const proximosLogros: NonNullable<BienestarIntegral['proximosLogros']> = [];

      // Logro: 30 días de registro
      if (datos.length >= 20 && datos.length < 30) {
        const diasFaltantes = 30 - datos.length;
        proximosLogros.push({
          nombre: '30 Días de Bienestar',
          progreso: Math.round((datos.length / 30) * 100),
          diasEstimados: diasFaltantes,
          probabilidadExito: datos.length >= 25 ? 0.95 : 0.85,
          obstaculosPotenciales: ['Mantener consistencia los fines de semana'],
          recomendaciones: ['Activa recordatorios diarios', 'Registra a la misma hora']
        });
      }

      // Logro: Meta de hidratación
      const diasBuenaHidratacion = datos.filter(d => d.vasosAgua >= 7).length;
      const progresoHidratacion = (diasBuenaHidratacion / datos.length) * 100;
      
      if (progresoHidratacion >= 60 && progresoHidratacion < 90) {
        proximosLogros.push({
          nombre: 'Maestro de Hidratación',
          progreso: Math.round(progresoHidratacion),
          diasEstimados: Math.ceil((30 - diasBuenaHidratacion) / (diasBuenaHidratacion / datos.length)),
          probabilidadExito: progresoHidratacion / 100,
          obstaculosPotenciales: ['Olvido durante días ocupados'],
          recomendaciones: ['Botella de agua siempre visible', 'App recordatorio cada 2 horas']
        });
      }

      // Logro: Racha de ejercicio
      const diasEjercicio = datos.filter(d => d.actividadFisica).length;
      if (diasEjercicio >= 10 && diasEjercicio < 20) {
        proximosLogros.push({
          nombre: 'Guerrero Fitness (20 días)',
          progreso: Math.round((diasEjercicio / 20) * 100),
          diasEstimados: Math.ceil((20 - diasEjercicio) * 1.2),
          probabilidadExito: Math.min(0.9, (diasEjercicio / datos.length) * 1.5),
          obstaculosPotenciales: ['Fatiga o falta de motivación', 'Clima desfavorable'],
          recomendaciones: ['Varía tipos de ejercicio', 'Encuentra un compañero de entrenamiento']
        });
      }

      return proximosLogros.length > 0 ? proximosLogros : undefined;
    } catch (error) {
      console.warn('⚠️ Error prediciendo logros:', error);
      return undefined;
    }
  }

  /**
   * Calcula el impacto de un factor específico en el bienestar
   */
  private calcularImpactoFactor(datos: DailyMLInput[], factor: 'sueno' | 'ejercicio' | 'agua'): number {
    if (datos.length === 0) return 50;

    let sumaImpacto = 0;
    let count = 0;

    datos.forEach(d => {
      let valorFactor = 0;
      
      switch (factor) {
        case 'sueno':
          valorFactor = (d.horasSueno || 0) >= 7 ? 1 : 0;
          break;
        case 'ejercicio':
          valorFactor = d.actividadFisica ? 1 : 0;
          break;
        case 'agua':
          valorFactor = d.vasosAgua >= 7 ? 1 : 0;
          break;
      }

      const scoreAnimo = this.mapEstadoAnimoToScore(d.estadoAnimo);
      if (valorFactor === 1) {
        sumaImpacto += scoreAnimo;
        count++;
      }
    });

    return count > 0 ? Math.round((sumaImpacto / count)) : 50;
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
