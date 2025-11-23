import { Injectable } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import { DailyMLInput } from './ml-classification.service';

// ============================================
// INTERFACES PARA MODELOS ML CON TENSORFLOW
// ============================================

export interface EmotionalClassificationResult {
  categoria: 'positivo' | 'neutral' | 'negativo' | 'critico';
  probabilidades: {
    positivo: number;
    neutral: number;
    negativo: number;
    critico: number;
  };
  confianza: number;
}

export interface WellnessScorePrediction {
  scorePredicho: number;
  confianza: number;
  factoresImportantes: {
    factor: string;
    impacto: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class TensorflowMLService {
  
  // Modelos entrenados
  private emotionalModel: tf.LayersModel | null = null;
  private wellnessModel: tf.LayersModel | null = null;
  
  // Flags de carga
  private emotionalModelLoaded = false;
  private wellnessModelLoaded = false;

  constructor() {
    console.log('🧠 TensorFlow.js ML Service inicializado');
    console.log('📊 Versión TensorFlow.js:', tf.version.tfjs);
    console.log('📱 Plataforma:', this.getPlatform());
    
    // Cargar modelos guardados al iniciar (si existen)
    this.initializeModels();
  }

  private getPlatform(): string {
    const isAndroid = /android/i.test(navigator.userAgent);
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isCapacitor = !!(window as any).Capacitor;
    
    if (isCapacitor) {
      return isAndroid ? 'Android (Capacitor)' : isIOS ? 'iOS (Capacitor)' : 'Capacitor';
    }
    return 'Web Browser';
  }

  private async initializeModels(): Promise<void> {
    try {
      console.log('🔄 Intentando cargar modelos guardados...');
      
      // Intentar cargar modelo emocional
      await this.loadModel('emotional');
      
      // Intentar cargar modelo de bienestar
      await this.loadModel('wellness');
      
      const status = this.getModelsStatus();
      console.log('✅ Modelos cargados:', status);
    } catch (error) {
      console.log('ℹ️ No hay modelos guardados aún (normal en primera ejecución)');
    }
  }

  // ============================================
  // MODELO 1: CLASIFICACIÓN EMOCIONAL
  // ============================================
  
  /**
   * Crea y entrena un modelo de red neuronal para clasificar estado emocional
   * Arquitectura: Red Neuronal Densa (Dense Neural Network)
   * Input: 10 features (emociones codificadas, estado ánimo, estrés, sueño, etc.)
   * Output: 4 clases (positivo, neutral, negativo, crítico)
   */
  async createEmotionalClassificationModel(): Promise<tf.LayersModel> {
    console.log('🏗️ Creando modelo de clasificación emocional...');
    
    const model = tf.sequential({
      layers: [
        // Capa de entrada: 10 features
        tf.layers.dense({
          inputShape: [10],
          units: 16,
          activation: 'relu',
          kernelInitializer: 'heNormal'
        }),
        
        // Dropout para prevenir overfitting
        tf.layers.dropout({ rate: 0.2 }),
        
        // Capa oculta
        tf.layers.dense({
          units: 8,
          activation: 'relu',
          kernelInitializer: 'heNormal'
        }),
        
        // Capa de salida: 4 clases (softmax para probabilidades)
        tf.layers.dense({
          units: 4,
          activation: 'softmax'
        })
      ]
    });

    // Compilar modelo
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    console.log('✅ Modelo creado:');
    model.summary();
    
    return model;
  }

  /**
   * Preprocesa datos para el modelo de clasificación emocional
   */
  private preprocessDataForEmotional(datos: DailyMLInput[]): {
    features: number[][];
    labels: number[][];
  } {
    const features: number[][] = [];
    const labels: number[][] = [];

    // Emociones positivas y negativas para codificación
    const emocionesPositivas = ['feliz', 'motivado', 'tranquilo', 'energético', 'optimista'];
    const emocionesNegativas = ['triste', 'ansioso', 'estresado', 'cansado', 'frustrado'];

    datos.forEach(dato => {
      // Feature engineering: extraer características numéricas
      const feature = [
        // 1. Ratio de emociones positivas (0-1)
        dato.emociones.filter(e => emocionesPositivas.includes(e.toLowerCase())).length / Math.max(dato.emociones.length, 1),
        
        // 2. Ratio de emociones negativas (0-1)
        dato.emociones.filter(e => emocionesNegativas.includes(e.toLowerCase())).length / Math.max(dato.emociones.length, 1),
        
        // 3. Estado de ánimo normalizado (0-1)
        this.normalizeEstadoAnimo(dato.estadoAnimo),
        
        // 4. Nivel de estrés normalizado (0-1)
        dato.nivelEstres / 10,
        
        // 5. Calidad de sueño normalizado (0-1)
        dato.calidadSueno / 10,
        
        // 6. Horas de sueño normalizado (0-1, asumiendo 8h óptimo)
        Math.min(dato.horasSueno / 8, 1),
        
        // 7. Hidratación normalizada (0-1, asumiendo 8 vasos óptimo)
        Math.min(dato.vasosAgua / 8, 1),
        
        // 8. Actividad física (0 o 1)
        dato.actividadFisica ? 1 : 0,
        
        // 9. Calidad alimentación normalizada (0-1)
        dato.calidadAlimentacion / 10,
        
        // 10. Número de comidas normalizado (0-1, asumiendo 4 óptimo)
        Math.min(dato.comidas / 4, 1)
      ];

      features.push(feature);

      // Label: clasificación emocional basada en heurística para entrenamiento inicial
      const label = this.getLabelFromData(dato);
      labels.push(label);
    });

    return { features, labels };
  }

  /**
   * Normaliza estado de ánimo a valor numérico
   */
  private normalizeEstadoAnimo(estado: string): number {
    const mapping: { [key: string]: number } = {
      'excelente': 1.0,
      'bueno': 0.75,
      'regular': 0.5,
      'malo': 0.25,
      'muy-malo': 0.0
    };
    return mapping[estado] || 0.5;
  }

  /**
   * Genera label de entrenamiento basado en heurística
   * [1,0,0,0] = positivo
   * [0,1,0,0] = neutral
   * [0,0,1,0] = negativo
   * [0,0,0,1] = crítico
   */
  private getLabelFromData(dato: DailyMLInput): number[] {
    const emocionesPositivas = ['feliz', 'motivado', 'tranquilo', 'energético', 'optimista'];
    const emocionesNegativas = ['triste', 'ansioso', 'estresado', 'cansado', 'frustrado'];
    
    const positivas = dato.emociones.filter(e => emocionesPositivas.includes(e.toLowerCase())).length;
    const negativas = dato.emociones.filter(e => emocionesNegativas.includes(e.toLowerCase())).length;
    const total = dato.emociones.length || 1;
    const ratio = positivas / total;

    // Clasificación basada en múltiples factores
    const estadoScore = this.normalizeEstadoAnimo(dato.estadoAnimo);
    const estresScore = 1 - (dato.nivelEstres / 10);
    const suenoScore = dato.calidadSueno / 10;
    
    const scoreGeneral = (ratio * 0.4) + (estadoScore * 0.3) + (estresScore * 0.2) + (suenoScore * 0.1);

    if (scoreGeneral >= 0.7) return [1, 0, 0, 0]; // Positivo
    if (scoreGeneral >= 0.4) return [0, 1, 0, 0]; // Neutral
    if (scoreGeneral >= 0.2) return [0, 0, 1, 0]; // Negativo
    return [0, 0, 0, 1]; // Crítico
  }

  /**
   * Entrena el modelo de clasificación emocional con datos del usuario
   */
  async trainEmotionalModel(datos: DailyMLInput[]): Promise<void> {
    console.log('🎓 Iniciando entrenamiento de modelo emocional con', datos.length, 'muestras...');
    
    if (datos.length < 10) {
      console.warn('⚠️ Datos insuficientes para entrenamiento (mínimo 10). Usando modelo pre-entrenado.');
      return;
    }

    // Preprocesar datos
    const { features, labels } = this.preprocessDataForEmotional(datos);

    // Convertir a tensores
    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(labels);

    // Crear modelo si no existe
    if (!this.emotionalModel) {
      this.emotionalModel = await this.createEmotionalClassificationModel();
    }

    // Entrenar modelo
    console.log('🏋️ Entrenando modelo...');
    const history = await this.emotionalModel.fit(xs, ys, {
      epochs: 50,
      batchSize: 8,
      validationSplit: 0.2,
      shuffle: true,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0) {
            console.log(`Época ${epoch}: loss = ${logs?.['loss'].toFixed(4)}, accuracy = ${logs?.['acc'].toFixed(4)}`);
          }
        }
      }
    });

    console.log('✅ Modelo entrenado exitosamente');
    console.log('📊 Accuracy final:', history.history['acc'][history.history['acc'].length - 1]);

    // Limpiar memoria
    xs.dispose();
    ys.dispose();

    this.emotionalModelLoaded = true;
  }

  /**
   * Predice clasificación emocional usando el modelo entrenado
   */
  async predictEmotionalState(dato: DailyMLInput): Promise<EmotionalClassificationResult> {
    // Si no hay modelo, crear y usar heurística básica
    if (!this.emotionalModel || !this.emotionalModelLoaded) {
      console.log('⚠️ Modelo no entrenado, usando clasificación heurística');
      return this.fallbackEmotionalClassification(dato);
    }

    // Preprocesar dato
    const { features } = this.preprocessDataForEmotional([dato]);
    const inputTensor = tf.tensor2d(features);

    // Predecir
    const prediction = this.emotionalModel.predict(inputTensor) as tf.Tensor;
    const probabilities = await prediction.data();

    // Limpiar memoria
    inputTensor.dispose();
    prediction.dispose();

    // Interpretar resultados
    const categorias: Array<'positivo' | 'neutral' | 'negativo' | 'critico'> = 
      ['positivo', 'neutral', 'negativo', 'critico'];
    
    const maxIndex = probabilities.indexOf(Math.max(...Array.from(probabilities)));
    const categoria = categorias[maxIndex];

    return {
      categoria,
      probabilidades: {
        positivo: probabilities[0],
        neutral: probabilities[1],
        negativo: probabilities[2],
        critico: probabilities[3]
      },
      confianza: probabilities[maxIndex]
    };
  }

  /**
   * Clasificación emocional de respaldo (sin ML)
   */
  private fallbackEmotionalClassification(dato: DailyMLInput): EmotionalClassificationResult {
    const label = this.getLabelFromData(dato);
    const maxIndex = label.indexOf(1);
    const categorias: Array<'positivo' | 'neutral' | 'negativo' | 'critico'> = 
      ['positivo', 'neutral', 'negativo', 'critico'];

    return {
      categoria: categorias[maxIndex],
      probabilidades: {
        positivo: label[0],
        neutral: label[1],
        negativo: label[2],
        critico: label[3]
      },
      confianza: 0.6 // Confianza baja sin modelo entrenado
    };
  }

  // ============================================
  // MODELO 2: PREDICCIÓN DE SCORE DE BIENESTAR
  // ============================================

  /**
   * Crea modelo de regresión para predecir score de bienestar
   * Input: 10 features
   * Output: 1 valor continuo (0-100)
   */
  async createWellnessScoreModel(): Promise<tf.LayersModel> {
    console.log('🏗️ Creando modelo de predicción de bienestar...');
    
    const model = tf.sequential({
      layers: [
        // Capa de entrada
        tf.layers.dense({
          inputShape: [10],
          units: 32,
          activation: 'relu',
          kernelInitializer: 'heNormal'
        }),
        
        tf.layers.dropout({ rate: 0.3 }),
        
        // Capas ocultas
        tf.layers.dense({
          units: 16,
          activation: 'relu'
        }),
        
        tf.layers.dropout({ rate: 0.2 }),
        
        tf.layers.dense({
          units: 8,
          activation: 'relu'
        }),
        
        // Capa de salida: regresión (1 valor continuo)
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid' // Salida entre 0-1, luego escalar a 0-100
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae'] // Mean Absolute Error
    });

    console.log('✅ Modelo de regresión creado:');
    model.summary();
    
    return model;
  }

  /**
   * Entrena modelo de predicción de bienestar
   */
  async trainWellnessModel(datos: DailyMLInput[]): Promise<void> {
    console.log('🎓 Iniciando entrenamiento de modelo de bienestar con', datos.length, 'muestras...');
    
    if (datos.length < 20) {
      console.warn('⚠️ Datos insuficientes para entrenamiento (mínimo 20).');
      return;
    }

    // Preprocesar
    const features: number[][] = [];
    const scores: number[] = [];

    datos.forEach(dato => {
      const feature = this.extractFeatures(dato);
      const score = this.calculateTargetScore(dato);
      
      features.push(feature);
      scores.push(score / 100); // Normalizar a 0-1
    });

    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(scores, [scores.length, 1]);

    // Crear modelo
    if (!this.wellnessModel) {
      this.wellnessModel = await this.createWellnessScoreModel();
    }

    // Entrenar
    console.log('🏋️ Entrenando modelo de bienestar...');
    const history = await this.wellnessModel.fit(xs, ys, {
      epochs: 100,
      batchSize: 16,
      validationSplit: 0.2,
      shuffle: true,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 20 === 0) {
            console.log(`Época ${epoch}: loss = ${logs?.['loss'].toFixed(4)}, mae = ${logs?.['mae'].toFixed(4)}`);
          }
        }
      }
    });

    console.log('✅ Modelo de bienestar entrenado');
    console.log('📊 MAE final:', history.history['mae'][history.history['mae'].length - 1]);

    xs.dispose();
    ys.dispose();

    this.wellnessModelLoaded = true;
  }

  /**
   * Extrae características del dato
   */
  private extractFeatures(dato: DailyMLInput): number[] {
    const emocionesPositivas = ['feliz', 'motivado', 'tranquilo', 'energético', 'optimista'];
    const emocionesNegativas = ['triste', 'ansioso', 'estresado', 'cansado', 'frustrado'];

    return [
      dato.emociones.filter(e => emocionesPositivas.includes(e.toLowerCase())).length / Math.max(dato.emociones.length, 1),
      dato.emociones.filter(e => emocionesNegativas.includes(e.toLowerCase())).length / Math.max(dato.emociones.length, 1),
      this.normalizeEstadoAnimo(dato.estadoAnimo),
      dato.nivelEstres / 10,
      dato.calidadSueno / 10,
      Math.min(dato.horasSueno / 8, 1),
      Math.min(dato.vasosAgua / 8, 1),
      dato.actividadFisica ? 1 : 0,
      dato.calidadAlimentacion / 10,
      Math.min(dato.comidas / 4, 1)
    ];
  }

  /**
   * Calcula score objetivo para entrenamiento
   */
  private calculateTargetScore(dato: DailyMLInput): number {
    const estadoScore = this.normalizeEstadoAnimo(dato.estadoAnimo) * 100;
    const estresScore = (1 - dato.nivelEstres / 10) * 100;
    const suenoScore = dato.calidadSueno * 10;
    const aguaScore = Math.min(dato.vasosAgua / 8, 1) * 100;
    const actividadScore = dato.actividadFisica ? 100 : 0;
    const alimentacionScore = dato.calidadAlimentacion * 10;

    return (
      estadoScore * 0.25 +
      estresScore * 0.20 +
      suenoScore * 0.20 +
      aguaScore * 0.15 +
      actividadScore * 0.10 +
      alimentacionScore * 0.10
    );
  }

  /**
   * Predice score de bienestar
   */
  async predictWellnessScore(dato: DailyMLInput): Promise<WellnessScorePrediction> {
    if (!this.wellnessModel || !this.wellnessModelLoaded) {
      console.log('⚠️ Modelo no entrenado, usando cálculo heurístico');
      const score = this.calculateTargetScore(dato);
      return {
        scorePredicho: Math.round(score),
        confianza: 0.5,
        factoresImportantes: this.analyzeFactors(dato)
      };
    }

    const features = this.extractFeatures(dato);
    const inputTensor = tf.tensor2d([features]);

    const prediction = this.wellnessModel.predict(inputTensor) as tf.Tensor;
    const scoreNormalizado = (await prediction.data())[0];

    inputTensor.dispose();
    prediction.dispose();

    return {
      scorePredicho: Math.round(scoreNormalizado * 100),
      confianza: 0.85,
      factoresImportantes: this.analyzeFactors(dato)
    };
  }

  /**
   * Analiza factores importantes del bienestar
   */
  private analyzeFactors(dato: DailyMLInput): { factor: string; impacto: number }[] {
    const factores = [
      { factor: 'Estado Emocional', impacto: this.normalizeEstadoAnimo(dato.estadoAnimo) },
      { factor: 'Nivel de Estrés', impacto: 1 - (dato.nivelEstres / 10) },
      { factor: 'Calidad de Sueño', impacto: dato.calidadSueno / 10 },
      { factor: 'Hidratación', impacto: Math.min(dato.vasosAgua / 8, 1) },
      { factor: 'Actividad Física', impacto: dato.actividadFisica ? 1 : 0 },
      { factor: 'Alimentación', impacto: dato.calidadAlimentacion / 10 }
    ];

    return factores.sort((a, b) => b.impacto - a.impacto);
  }

  // ============================================
  // UTILIDADES
  // ============================================

  /**
   * Guarda modelo entrenado en IndexedDB
   * Compatible con Android WebView
   */
  async saveModel(modelName: 'emotional' | 'wellness'): Promise<void> {
    const model = modelName === 'emotional' ? this.emotionalModel : this.wellnessModel;
    if (!model) {
      console.warn('⚠️ No hay modelo para guardar');
      return;
    }

    try {
      const savePath = `indexeddb://nupsi-${modelName}-model`;
      await model.save(savePath);
      console.log('💾 Modelo guardado en:', savePath);
      console.log('📱 Plataforma:', this.getPlatform());
      
      // Guardar metadata adicional para verificación
      const metadata = {
        modelName,
        timestamp: new Date().toISOString(),
        platform: this.getPlatform(),
        version: '1.0'
      };
      localStorage.setItem(`nupsi-${modelName}-metadata`, JSON.stringify(metadata));
      
    } catch (error) {
      console.error('❌ Error guardando modelo:', error);
      throw error;
    }
  }

  /**
   * Carga modelo guardado desde IndexedDB
   * Con fallback automático si falla
   */
  async loadModel(modelName: 'emotional' | 'wellness'): Promise<void> {
    try {
      const savePath = `indexeddb://nupsi-${modelName}-model`;
      console.log('📂 Intentando cargar modelo desde:', savePath);
      
      const model = await tf.loadLayersModel(savePath);
      
      if (modelName === 'emotional') {
        this.emotionalModel = model;
        this.emotionalModelLoaded = true;
      } else {
        this.wellnessModel = model;
        this.wellnessModelLoaded = true;
      }
      
      console.log('✅ Modelo cargado desde:', savePath);
      
      // Verificar metadata
      const metadata = localStorage.getItem(`nupsi-${modelName}-metadata`);
      if (metadata) {
        console.log('📊 Metadata del modelo:', JSON.parse(metadata));
      }
    } catch (error) {
      console.log('⚠️ No se pudo cargar modelo guardado (se creará uno nuevo cuando se entrene)');
      console.log('📋 Detalle:', error);
    }
  }

  /**
   * Libera memoria de los modelos
   */
  disposeModels(): void {
    if (this.emotionalModel) {
      this.emotionalModel.dispose();
      this.emotionalModel = null;
      this.emotionalModelLoaded = false;
    }
    if (this.wellnessModel) {
      this.wellnessModel.dispose();
      this.wellnessModel = null;
      this.wellnessModelLoaded = false;
    }
    console.log('🗑️ Modelos liberados de memoria');
  }

  /**
   * Verifica estado de los modelos
   */
  getModelsStatus(): {
    emotional: { loaded: boolean; trained: boolean };
    wellness: { loaded: boolean; trained: boolean };
  } {
    return {
      emotional: {
        loaded: this.emotionalModel !== null,
        trained: this.emotionalModelLoaded
      },
      wellness: {
        loaded: this.wellnessModel !== null,
        trained: this.wellnessModelLoaded
      }
    };
  }
}
