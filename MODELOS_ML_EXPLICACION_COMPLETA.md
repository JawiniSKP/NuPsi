# 🧠 MODELOS DE CLASIFICACIÓN ML - EXPLICACIÓN COMPLETA
## Del Concepto Básico a la Implementación Técnica

---

## 📖 ÍNDICE

1. [¿Qué es Machine Learning? - Para Niños](#1-qué-es-machine-learning---para-niños)
2. [¿Por qué ML en NuPsi? - Nivel Básico](#2-por-qué-ml-en-nupsi---nivel-básico)
3. [Arquitectura de los Modelos - Nivel Intermedio](#3-arquitectura-de-los-modelos---nivel-intermedio)
4. [TensorFlow.js - Nivel Avanzado](#4-tensorflowjs---nivel-avanzado)
5. [Feature Engineering - Nivel Experto](#5-feature-engineering---nivel-experto)
6. [Entrenamiento y Optimización](#6-entrenamiento-y-optimización)
7. [Deployment en el Navegador](#7-deployment-en-el-navegador)

---

## 1. ¿Qué es Machine Learning? - Para Niños

### 🎓 Aprendiendo como los Niños

Imagina que le estás enseñando a un niño a reconocer animales:

**Método Tradicional (Programación con Reglas):**
```
if tiene_4_patas and ladra:
    es_perro = True
if tiene_rayas and es_naranja:
    es_tigre = True
```

**Problema:** ¿Y si el animal es diferente? ¿Y si un gato ladra? ¿Y un tigre blanco?

**Método Machine Learning (Aprendizaje):**
```
1. Muestras MUCHAS fotos de animales
   - 100 fotos de perros
   - 100 fotos de gatos
   - 100 fotos de tigres

2. El niño (modelo) observa y aprende patrones:
   - "Los perros suelen tener orejas caídas"
   - "Los gatos tienen bigotes largos"
   - "Los tigres tienen rayas"

3. Cuando ve un nuevo animal:
   - Compara con lo que aprendió
   - Decide: "Se parece más a un perro" (85% seguro)
```

### 🧠 Machine Learning en NuPsi

En NuPsi, el "niño" (modelo) aprende a reconocer **tu estado emocional**:

**Entrenamiento:**
```
Día 1: emociones=[feliz, motivado], sueño=8h, ejercicio=sí
       → El usuario está "POSITIVO"

Día 2: emociones=[triste, cansado], sueño=5h, ejercicio=no
       → El usuario está "NEGATIVO"

Día 3: emociones=[tranquilo], sueño=7h, ejercicio=sí
       → El usuario está "NEUTRAL"

... (10+ días)

El modelo aprende:
  - Mucho sueño + ejercicio → Positivo
  - Poco sueño + sin ejercicio → Negativo
  - Emociones mixtas → Neutral
```

**Predicción (Día 11):**
```
Nuevo día: emociones=[feliz], sueño=7.5h, ejercicio=sí

Modelo piensa:
  "Esto se parece a los días Positivos que vi antes"
  
Predice: POSITIVO (89% de confianza)
```

### 🎯 ¿Por qué es Útil?

**Sin ML:**
- El bot responde igual a todos
- "Bebe 8 vasos de agua" (genérico)

**Con ML:**
- El bot te conoce personalmente
- "Noté que cuando bebes menos de 6 vasos, tu ánimo baja. Intenta aumentar a 7 hoy"

---

## 2. ¿Por qué ML en NuPsi? - Nivel Básico

### 🎯 Objetivos del Proyecto

NuPsi quiere ser un **asistente personalizado** de bienestar. Para eso necesita:

1. **Entender cómo te sientes** → Clasificación Emocional
2. **Predecir tu bienestar** → Predicción de Score
3. **Detectar patrones** → Análisis de Hábitos
4. **Dar recomendaciones personalizadas** → Sistema de Consejos

### 🔍 Comparación: Heurística vs ML

#### **Método 1: Heurística (Algoritmos con Reglas)**

```typescript
function clasificarEmocional(datos: DailyInput): string {
  const positivas = datos.emociones.filter(e => 
    ['feliz', 'motivado'].includes(e)
  ).length;
  
  const ratio = positivas / datos.emociones.length;
  
  if (ratio >= 0.7) return "POSITIVO";
  if (ratio >= 0.4) return "NEUTRAL";
  return "NEGATIVO";
}
```

**Ventajas:**
- ✅ Simple de entender
- ✅ Rápido
- ✅ Funciona sin datos

**Desventajas:**
- ❌ No personalizado (mismas reglas para todos)
- ❌ No aprende
- ❌ No captura complejidad (¿Y si duermes poco pero haces ejercicio?)
- ❌ Reglas arbitrarias (¿Por qué 0.7 y no 0.65?)

#### **Método 2: Machine Learning**

```typescript
// Entrena modelo con TUS datos
await tensorflowML.trainEmotionalModel(tus_ultimos_30_dias);

// Predice basándose en TI
const resultado = await tensorflowML.predictEmotionalState(hoy);
// { categoria: "POSITIVO", confianza: 0.89 }
```

**Ventajas:**
- ✅ **Personalizado** (aprende de TI)
- ✅ **Adapta** con más datos
- ✅ **Captura complejidad** (relaciones no lineales)
- ✅ **Mejora con el tiempo**

**Desventajas:**
- ❌ Necesita datos (mínimo 10 registros)
- ❌ Más complejo
- ❌ "Caja negra" (difícil interpretar)

### 📊 Arquitectura de NuPsi ML

```
┌─────────────────────────────────────────────────────────┐
│              USUARIO COMPLETA FORMULARIO                │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐          │
│  │Emociones│ │ Sueño  │ │Ejercicio│ │Comidas │          │
│  └────────┘ └────────┘ └────────┘ └────────┘          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│           FIRESTORE (Base de Datos)                     │
│  Guarda en: usuarios/{uid}/dailyMLInputs                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│       ML-CLASSIFICATION SERVICE (Orquestador)           │
│                                                          │
│  ¿Hay >= 10 registros?                                  │
│         │                                                │
│    ┌────┴────┐                                          │
│    │         │                                           │
│   SÍ        NO                                          │
│    │         │                                           │
│    ▼         ▼                                           │
│  ML Real  Heurística                                    │
│    │         │                                           │
└────┼─────────┼───────────────────────────────────────────┘
     │         │
     ▼         ▼
┌─────────────────────────────────────────────────────────┐
│         TENSORFLOW-ML SERVICE (Modelo Real)             │
│  ┌──────────────────┐    ┌──────────────────┐          │
│  │ Modelo Emocional │    │ Modelo Bienestar │          │
│  │  (Clasificación) │    │   (Regresión)    │          │
│  └────────┬─────────┘    └────────┬─────────┘          │
│           │                       │                     │
│           └───────┬───────────────┘                     │
└───────────────────┼─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│              INDEXEDDB (Persistencia)                   │
│  nupsi-emotional-model / nupsi-wellness-model           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│           PREDICCIONES Y RECOMENDACIONES                │
│  - Categoría: POSITIVO (89% confianza)                  │
│  - Score: 78/100                                        │
│  - Patrón detectado: "Hidratación baja"                 │
│  - Recomendación: "Aumenta consumo de agua"             │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Arquitectura de los Modelos - Nivel Intermedio

NuPsi tiene **2 modelos principales**:

### 🎭 Modelo 1: Clasificación Emocional

**Objetivo:** Clasificar tu estado emocional en 4 categorías

**Tipo:** Clasificación Multiclase (Supervised Learning)

**Input:** 10 características numéricas [0-1]

**Output:** 4 probabilidades (suma = 1.0)
- Positivo
- Neutral
- Negativo  
- Crítico

**Ejemplo:**

```
Input: [0.8, 0.1, 0.75, 0.3, 0.8, 0.88, 0.75, 1, 0.7, 1.0]
        │    │    │     │    │    │     │    │   │    │
        │    │    │     │    │    │     │    │   │    └─ Comidas
        │    │    │     │    │    │     │    │   └───── Cal. Alimentación
        │    │    │     │    │    │     │    └────────── Actividad Física
        │    │    │     │    │    │     └─────────────── Hidratación
        │    │    │     │    │    └───────────────────── Horas Sueño
        │    │    │     │    └────────────────────────── Cal. Sueño
        │    │    │     └─────────────────────────────── Nivel Estrés
        │    │    └───────────────────────────────────── Estado Ánimo
        │    └────────────────────────────────────────── Ratio Negativo
        └─────────────────────────────────────────────── Ratio Positivo

Output: [0.85, 0.10, 0.04, 0.01]
         │     │     │     │
         │     │     │     └─ Crítico: 1%
         │     │     └────── Negativo: 4%
         │     └─────────── Neutral: 10%
         └───────────────── Positivo: 85% ← GANADOR
```

### 📈 Modelo 2: Predicción de Bienestar

**Objetivo:** Predecir tu score de bienestar (0-100)

**Tipo:** Regresión (Supervised Learning)

**Input:** Mismas 10 características [0-1]

**Output:** 1 número continuo [0-100]

**Ejemplo:**

```
Input: [0.8, 0.1, 0.75, 0.3, 0.8, 0.88, 0.75, 1, 0.7, 1.0]

Output: 78.5
        │
        └─ Score predicho de bienestar
```

### 🏗️ Arquitectura de Red Neuronal

#### **Modelo Emocional (Clasificación)**

```
Input Layer (10 neuronas)
    │
    ├─ Ratio Positivo [0-1]
    ├─ Ratio Negativo [0-1]
    ├─ Estado Ánimo [0-1]
    ├─ Nivel Estrés [0-1]
    ├─ Calidad Sueño [0-1]
    ├─ Horas Sueño [0-1]
    ├─ Hidratación [0-1]
    ├─ Actividad Física [0-1]
    ├─ Calidad Alimentación [0-1]
    └─ Comidas [0-1]
    │
    ▼
Dense Layer 1 (16 neuronas, ReLU)
    ├─ Neurona 1: Weighted sum + ReLU
    ├─ Neurona 2: Weighted sum + ReLU
    │   ...
    └─ Neurona 16: Weighted sum + ReLU
    │
    ▼
Dropout (20%) - Previene overfitting
    │
    ▼
Dense Layer 2 (8 neuronas, ReLU)
    ├─ Neurona 1
    │   ...
    └─ Neurona 8
    │
    ▼
Output Layer (4 neuronas, Softmax)
    ├─ Positivo [0-1]
    ├─ Neutral [0-1]
    ├─ Negativo [0-1]
    └─ Crítico [0-1]
```

**Código TypeScript:**

```typescript
const model = tf.sequential({
  layers: [
    // Capa 1: 10 → 16
    tf.layers.dense({
      inputShape: [10],
      units: 16,
      activation: 'relu',
      kernelInitializer: 'heNormal'
    }),
    
    // Dropout para regularización
    tf.layers.dropout({ rate: 0.2 }),
    
    // Capa 2: 16 → 8
    tf.layers.dense({
      units: 8,
      activation: 'relu'
    }),
    
    // Capa de salida: 8 → 4
    tf.layers.dense({
      units: 4,
      activation: 'softmax'
    })
  ]
});

// Compilar
model.compile({
  optimizer: tf.train.adam(0.001),
  loss: 'categoricalCrossentropy',
  metrics: ['accuracy']
});
```

#### **Modelo de Bienestar (Regresión)**

```
Input Layer (10 neuronas)
    │
    ▼
Dense Layer 1 (32 neuronas, ReLU)
    │
    ▼
Dropout (30%)
    │
    ▼
Dense Layer 2 (16 neuronas, ReLU)
    │
    ▼
Dropout (20%)
    │
    ▼
Dense Layer 3 (8 neuronas, ReLU)
    │
    ▼
Output Layer (1 neurona, Sigmoid * 100)
    │
    └─ Score [0-100]
```

**Código TypeScript:**

```typescript
const model = tf.sequential({
  layers: [
    // Capa 1: 10 → 32
    tf.layers.dense({
      inputShape: [10],
      units: 32,
      activation: 'relu'
    }),
    tf.layers.dropout({ rate: 0.3 }),
    
    // Capa 2: 32 → 16
    tf.layers.dense({
      units: 16,
      activation: 'relu'
    }),
    tf.layers.dropout({ rate: 0.2 }),
    
    // Capa 3: 16 → 8
    tf.layers.dense({
      units: 8,
      activation: 'relu'
    }),
    
    // Salida: 8 → 1 (escalado a 0-100)
    tf.layers.dense({
      units: 1,
      activation: 'sigmoid'
    })
  ]
});

// Compilar
model.compile({
  optimizer: tf.train.adam(0.001),
  loss: 'meanSquaredError',
  metrics: ['mae']  // Mean Absolute Error
});
```

---

## 4. TensorFlow.js - Nivel Avanzado

### 🔧 ¿Qué es TensorFlow.js?

**TensorFlow** = Biblioteca de Machine Learning de Google
**TensorFlow.js** = Versión para JavaScript (navegador + Node.js)

**Ventajas:**
- ✅ Corre en el navegador (sin servidor)
- ✅ Usa GPU (aceleración WebGL)
- ✅ Privacidad (datos no salen del dispositivo)
- ✅ Gratis (sin costos de servidor)
- ✅ Offline (funciona sin internet)

**Desventajas:**
- ❌ Limitado por hardware del dispositivo
- ❌ Modelos grandes = más tiempo de carga
- ❌ Menos potente que TensorFlow Python

### 🧮 Conceptos Fundamentales

#### **1. Tensores**

Un tensor es un **array multidimensional**:

```typescript
// Scalar (0D)
const scalar = tf.scalar(3.14);
// Shape: []

// Vector (1D)
const vector = tf.tensor1d([1, 2, 3, 4]);
// Shape: [4]

// Matriz (2D)
const matrix = tf.tensor2d([[1, 2], [3, 4]]);
// Shape: [2, 2]

// Tensor 3D
const tensor3d = tf.tensor3d([[[1], [2]], [[3], [4]]]);
// Shape: [2, 2, 1]
```

**En NuPsi:**

```typescript
// Features de 1 día (Vector 1D)
const features = tf.tensor1d([0.8, 0.1, 0.75, 0.3, 0.8, 0.88, 0.75, 1, 0.7, 1.0]);
// Shape: [10]

// Features de 30 días (Matriz 2D)
const batch = tf.tensor2d([
  [0.8, 0.1, 0.75, ...],  // Día 1
  [0.6, 0.2, 0.60, ...],  // Día 2
  // ... 30 días
]);
// Shape: [30, 10]
```

#### **2. Operaciones**

```typescript
// Suma
const a = tf.tensor1d([1, 2, 3]);
const b = tf.tensor1d([4, 5, 6]);
const sum = tf.add(a, b);  // [5, 7, 9]

// Multiplicación matricial
const A = tf.tensor2d([[1, 2], [3, 4]]);
const B = tf.tensor2d([[5, 6], [7, 8]]);
const product = tf.matMul(A, B);
// [[19, 22], [43, 50]]

// Activación ReLU
const x = tf.tensor1d([-1, 0, 1, 2]);
const relu = tf.relu(x);  // [0, 0, 1, 2]

// Softmax
const logits = tf.tensor1d([1.0, 2.0, 3.0, 4.0]);
const probs = tf.softmax(logits);
// [0.032, 0.087, 0.236, 0.645] (suma = 1)
```

#### **3. Capas Densas (Dense Layers)**

Una capa densa hace esto:

```
Input: x = [x1, x2, x3]
Weights: W = [[w11, w12], [w21, w22], [w31, w32]]
Bias: b = [b1, b2]

Output: y = relu(x · W + b)
```

**Ejemplo numérico:**

```typescript
const x = tf.tensor2d([[1, 2, 3]]);  // Input: [1, 2, 3]

const W = tf.tensor2d([
  [0.5, -0.3],
  [0.2,  0.4],
  [-0.1, 0.6]
]);

const b = tf.tensor1d([0.1, 0.2]);

// Forward pass
const z = tf.add(tf.matMul(x, W), b);
// z = [[1, 2, 3]] · W + [0.1, 0.2]
// z = [[0.5*1 + 0.2*2 + (-0.1)*3 + 0.1,
//       -0.3*1 + 0.4*2 + 0.6*3 + 0.2]]
// z = [[0.6, 2.7]]

const y = tf.relu(z);
// y = [[0.6, 2.7]]  (ReLU no cambia nada porque ambos > 0)
```

**En TensorFlow.js es automático:**

```typescript
const layer = tf.layers.dense({
  units: 2,
  activation: 'relu',
  inputShape: [3]
});

const output = layer.apply(x);
// Hace todo lo anterior automáticamente
```

### 🎓 Proceso de Entrenamiento

#### **Paso 1: Preparar Datos**

```typescript
// Datos de entrenamiento
const datosUsuario = [
  { emociones: ['feliz', 'motivado'], sueño: 8, ejercicio: true, ... },
  { emociones: ['triste', 'cansado'], sueño: 5, ejercicio: false, ... },
  // ... 30 días
];

// Convertir a features
const X_train = datosUsuario.map(d => prepareFeatures(d));
// [[0.8, 0.1, 0.75, ...], [0.2, 0.7, 0.40, ...], ...]

// Labels (clasificación manual inicial)
const y_train = datosUsuario.map(d => clasificarManual(d));
// ['positivo', 'negativo', 'neutral', ...]

// Convertir labels a one-hot encoding
const y_encoded = tf.tensor2d(y_train.map(label => {
  if (label === 'positivo') return [1, 0, 0, 0];
  if (label === 'neutral') return [0, 1, 0, 0];
  if (label === 'negativo') return [0, 0, 1, 0];
  return [0, 0, 0, 1];  // crítico
}));

// Convertir a tensores
const X = tf.tensor2d(X_train);
// Shape: [30, 10]

const y = y_encoded;
// Shape: [30, 4]
```

#### **Paso 2: Crear Modelo**

```typescript
const model = tf.sequential({
  layers: [
    tf.layers.dense({
      inputShape: [10],
      units: 16,
      activation: 'relu'
    }),
    tf.layers.dropout({ rate: 0.2 }),
    tf.layers.dense({ units: 8, activation: 'relu' }),
    tf.layers.dense({ units: 4, activation: 'softmax' })
  ]
});
```

#### **Paso 3: Compilar**

```typescript
model.compile({
  optimizer: tf.train.adam(0.001),  // Optimizador
  loss: 'categoricalCrossentropy',  // Función de pérdida
  metrics: ['accuracy']             // Métricas
});
```

**¿Qué hace cada uno?**

**Optimizer (Adam):**
- Ajusta los pesos para minimizar el error
- Learning rate 0.001 = qué tan grandes son los pasos

**Loss (Categorical Cross-Entropy):**
- Mide qué tan mal está el modelo
- Para clasificación multiclase

```typescript
// Ejemplo de cálculo de loss
const y_true = [1, 0, 0, 0];  // Real: Positivo
const y_pred = [0.7, 0.2, 0.08, 0.02];  // Predicción

// Cross-Entropy Loss
let loss = 0;
for (let i = 0; i < 4; i++) {
  loss -= y_true[i] * Math.log(y_pred[i]);
}
// loss = -1*log(0.7) - 0*log(0.2) - 0*log(0.08) - 0*log(0.02)
// loss = 0.357

// Si la predicción fuera perfecta [1, 0, 0, 0]:
// loss = -1*log(1) = 0 ← Pérdida mínima
```

#### **Paso 4: Entrenar**

```typescript
await model.fit(X, y, {
  epochs: 50,              // 50 pasadas completas por los datos
  batchSize: 8,            // Procesa 8 ejemplos a la vez
  validationSplit: 0.2,    // 20% para validación
  shuffle: true,           // Mezcla datos
  callbacks: {
    onEpochEnd: (epoch, logs) => {
      console.log(`Epoch ${epoch}: loss=${logs.loss.toFixed(4)}, acc=${logs.acc.toFixed(4)}`);
    }
  }
});
```

**Lo que pasa internamente:**

```
Epoch 0:
  - Inicializa pesos aleatoriamente
  - Forward pass: Calcula predicciones
  - Calcula loss: 1.3862 (muy alto)
  - Backward pass: Calcula gradientes
  - Actualiza pesos
  - Accuracy: 0.375 (37.5%)

Epoch 1:
  - Forward pass con nuevos pesos
  - Loss: 1.1234 (mejorando)
  - Backward pass
  - Actualiza pesos
  - Accuracy: 0.500 (50%)

...

Epoch 50:
  - Loss: 0.1124 (muy bajo)
  - Accuracy: 0.975 (97.5%)
  
✓ Modelo entrenado
```

#### **Paso 5: Evaluar**

```typescript
// Datos de validación
const X_val = tf.tensor2d([[0.75, 0.15, 0.70, ...]]);
const y_val = tf.tensor2d([[1, 0, 0, 0]]);  // Real: Positivo

// Evaluar
const result = model.evaluate(X_val, y_val);
const loss = await result[0].data();
const accuracy = await result[1].data();

console.log(`Validation Loss: ${loss}`);
console.log(`Validation Accuracy: ${accuracy}`);
```

#### **Paso 6: Predecir**

```typescript
// Nuevos datos (hoy)
const hoy = prepareFeatures(datosHoy);
const X_new = tf.tensor2d([hoy]);

// Predecir
const prediction = model.predict(X_new);
const probabilities = await prediction.data();
// [0.85, 0.10, 0.04, 0.01]

// Interpretar
const categories = ['positivo', 'neutral', 'negativo', 'critico'];
const maxIndex = probabilities.indexOf(Math.max(...probabilities));
const categoria = categories[maxIndex];
const confianza = probabilities[maxIndex];

console.log(`Categoría: ${categoria} (${(confianza*100).toFixed(1)}%)`);
// Categoría: positivo (85.0%)
```

### 💾 Persistencia (IndexedDB)

```typescript
// Guardar modelo
await model.save('indexeddb://nupsi-emotional-model');

// Cargar modelo
const loadedModel = await tf.loadLayersModel('indexeddb://nupsi-emotional-model');

// Ahora puedes usarlo
const prediction = loadedModel.predict(X_new);
```

**¿Qué se guarda?**
- Arquitectura del modelo (JSON)
- Pesos entrenados (binario)
- Configuración del optimizador
- Metadata

**Tamaño aproximado:**
- Modelo Emocional: ~50-100 KB
- Modelo Bienestar: ~100-150 KB

---

## 5. Feature Engineering - Nivel Experto

### 🔬 Transformación de Datos

**Feature Engineering** = Convertir datos brutos en números que el modelo entienda.

#### **Feature 1: Ratio de Emociones Positivas**

```typescript
function calcularRatioPositivo(emociones: string[]): number {
  const emocionesPositivas = [
    'feliz', 'motivado', 'tranquilo', 
    'energético', 'optimista', 'agradecido'
  ];
  
  const count = emociones.filter(e => 
    emocionesPositivas.includes(e.toLowerCase())
  ).length;
  
  return emociones.length > 0 
    ? count / emociones.length 
    : 0;
}

// Ejemplos:
calcularRatioPositivo(['feliz', 'motivado'])  // 1.0
calcularRatioPositivo(['feliz', 'triste'])    // 0.5
calcularRatioPositivo(['triste', 'ansioso'])  // 0.0
```

**¿Por qué es útil?**
- Normaliza (siempre entre 0 y 1)
- Captura proporción, no cantidad absoluta
- ["feliz"] y ["feliz", "feliz"] dan el mismo valor (1.0)

#### **Feature 2: Ratio de Emociones Negativas**

```typescript
function calcularRatioNegativo(emociones: string[]): number {
  const emocionesNegativas = [
    'triste', 'ansioso', 'estresado', 
    'cansado', 'frustrado', 'enojado'
  ];
  
  const count = emociones.filter(e => 
    emocionesNegativas.includes(e.toLowerCase())
  ).length;
  
  return emociones.length > 0 
    ? count / emociones.length 
    : 0;
}
```

**Combinación de features:**
```
ratioPositivo = 0.8, ratioNegativo = 0.2
→ Mayormente positivo (emociones mixtas)

ratioPositivo = 0.0, ratioNegativo = 1.0
→ Completamente negativo

ratioPositivo = 0.0, ratioNegativo = 0.0
→ Emociones neutras o ninguna emoción registrada
```

#### **Feature 3: Estado de Ánimo Normalizado**

```typescript
function normalizarEstadoAnimo(estado: string): number {
  const mapa = {
    'excelente': 1.0,
    'bueno': 0.75,
    'regular': 0.5,
    'malo': 0.25,
    'muy-malo': 0.0
  };
  
  return mapa[estado] ?? 0.5;  // Default: regular
}
```

**¿Por qué estos valores?**
- Escala ordinal: excelente > bueno > regular > malo > muy-malo
- Equidistantes: 0.25 de diferencia entre cada nivel
- Rango [0, 1]: Compatible con otras features

#### **Feature 4: Nivel de Estrés Normalizado**

```typescript
function normalizarEstres(nivel: number): number {
  // Input: 1-10
  // Output: 0-1
  return (nivel - 1) / 9;
}

// Ejemplos:
normalizarEstres(1)   // 0.0 (sin estrés)
normalizarEstres(5.5) // 0.5 (estrés moderado)
normalizarEstres(10)  // 1.0 (estrés máximo)
```

**¿Por qué normalizar?**
- Redes neuronales funcionan mejor con valores [0, 1]
- Evita que features con valores grandes dominen
- Facilita convergencia durante entrenamiento

#### **Feature 5-6: Sueño**

```typescript
function normalizarCalidadSueno(calidad: number): number {
  // Input: 1-10
  // Output: 0-1
  return (calidad - 1) / 9;
}

function normalizarHorasSueno(horas: number): number {
  // Asumimos 8 horas como óptimo
  // Input: 0-24
  // Output: 0-1 (capped)
  return Math.min(horas / 8, 1.0);
}

// Ejemplos:
normalizarHorasSueno(4)   // 0.5 (poco sueño)
normalizarHorasSueno(8)   // 1.0 (óptimo)
normalizarHorasSueno(10)  // 1.0 (mucho sueño, pero capped)
```

**Feature engineering avanzado:**
```typescript
function combinedSleepScore(horas: number, calidad: number): number {
  const horasNorm = normalizarHorasSueno(horas);
  const calidadNorm = normalizarCalidadSueno(calidad);
  
  // Promedio ponderado
  return 0.6 * calidadNorm + 0.4 * horasNorm;
}
```

#### **Feature 7: Hidratación**

```typescript
function normalizarHidratacion(vasos: number): number {
  // Asumimos 8 vasos (2L) como óptimo
  return Math.min(vasos / 8, 1.0);
}

// Ejemplos:
normalizarHidratacion(4)   // 0.5
normalizarHidratacion(8)   // 1.0
normalizarHidratacion(12)  // 1.0 (capped)
```

#### **Feature 8: Actividad Física (Binaria)**

```typescript
function normalizarActividadFisica(realizo: boolean): number {
  return realizo ? 1.0 : 0.0;
}
```

**Feature engineering avanzado:**
```typescript
function actividadFisicaScore(
  realizo: boolean,
  tipo: string,
  duracion: number
): number {
  if (!realizo) return 0.0;
  
  // Peso por tipo
  const pesoTipo = {
    'cardio': 0.8,
    'fuerza': 1.0,
    'yoga': 0.6,
    'deportes': 0.9
  }[tipo] ?? 0.5;
  
  // Normalizar duración (30-60 min óptimo)
  const duracionNorm = Math.min(duracion / 60, 1.0);
  
  return pesoTipo * duracionNorm;
}
```

#### **Feature 9-10: Alimentación**

```typescript
function normalizarCalidadAlimentacion(calidad: number): number {
  return (calidad - 1) / 9;
}

function normalizarComidas(numComidas: number): number {
  // 4 comidas como óptimo
  return Math.min(numComidas / 4, 1.0);
}
```

### 🎯 Feature Matrix Completa

```typescript
function prepareFeatures(dato: DailyMLInput): number[] {
  return [
    calcularRatioPositivo(dato.emociones),          // [0-1]
    calcularRatioNegativo(dato.emociones),          // [0-1]
    normalizarEstadoAnimo(dato.estadoAnimo),        // [0-1]
    normalizarEstres(dato.nivelEstres),             // [0-1]
    normalizarCalidadSueno(dato.calidadSueno),      // [0-1]
    normalizarHorasSueno(dato.horasSueno),          // [0-1]
    normalizarHidratacion(dato.vasosAgua),          // [0-1]
    normalizarActividadFisica(dato.actividadFisica),// [0-1]
    normalizarCalidadAlimentacion(dato.calidadAlimentacion), // [0-1]
    normalizarComidas(dato.comidas)                 // [0-1]
  ];
}
```

**Ejemplo real:**

```typescript
const dato = {
  emociones: ['feliz', 'motivado', 'cansado'],
  estadoAnimo: 'bueno',
  nivelEstres: 4,
  calidadSueno: 7,
  horasSueno: 7,
  vasosAgua: 6,
  actividadFisica: true,
  tipoActividad: 'cardio',
  duracionActividad: 30,
  comidas: 4,
  calidadAlimentacion: 7
};

const features = prepareFeatures(dato);
// [
//   0.667,  // 2/3 positivas
//   0.333,  // 1/3 negativas
//   0.75,   // bueno
//   0.333,  // estrés 4/10
//   0.667,  // calidad sueño 7/10
//   0.875,  // 7h sueño
//   0.75,   // 6 vasos
//   1.0,    // sí ejercicio
//   0.667,  // calidad alimentación 7/10
//   1.0     // 4 comidas
// ]
```

### 📊 Análisis de Correlaciones

Para saber qué features son más importantes:

```typescript
function calcularCorrelacion(feature: number[], target: number[]): number {
  // Pearson correlation coefficient
  const n = feature.length;
  const meanX = feature.reduce((a, b) => a + b) / n;
  const meanY = target.reduce((a, b) => a + b) / n;
  
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;
  
  for (let i = 0; i < n; i++) {
    const diffX = feature[i] - meanX;
    const diffY = target[i] - meanY;
    numerator += diffX * diffY;
    denomX += diffX * diffX;
    denomY += diffY * diffY;
  }
  
  return numerator / Math.sqrt(denomX * denomY);
}

// Ejemplo de uso
const ratiosPositivos = datosUsuario.map(d => calcularRatioPositivo(d.emociones));
const scores = datosUsuario.map(d => d.scoreManual);

const correlacion = calcularCorrelacion(ratiosPositivos, scores);
// 0.82 → Alta correlación positiva
// Conclusión: Ratio positivo es muy predictivo del score
```

---

## 6. Entrenamiento y Optimización

### 🎯 Hiperparámetros

**Hiperparámetros** = Configuración del modelo (NO se aprenden, se eligen)

#### **Learning Rate**

```typescript
optimizer: tf.train.adam(0.001)  // ← Learning rate
```

**¿Qué hace?**
- Controla qué tan grandes son los pasos al actualizar pesos
- Muy alto → Modelo no converge (oscila)
- Muy bajo → Entrenamiento muy lento

```
Learning Rate = 0.1  (Muy alto)
Epoch 0: loss = 1.38
Epoch 1: loss = 2.54  ← Empeora
Epoch 2: loss = 1.12
Epoch 3: loss = 3.21  ← Oscila

Learning Rate = 0.001  (Óptimo)
Epoch 0: loss = 1.38
Epoch 1: loss = 1.15  ← Mejora
Epoch 2: loss = 0.94
Epoch 3: loss = 0.78  ← Converge

Learning Rate = 0.00001  (Muy bajo)
Epoch 0: loss = 1.38
Epoch 1: loss = 1.37  ← Mejora muy lenta
Epoch 2: loss = 1.36
Epoch 3: loss = 1.35  ← Muy lento
```

#### **Batch Size**

```typescript
await model.fit(X, y, {
  batchSize: 8  // ← Batch size
});
```

**¿Qué hace?**
- Cuántos ejemplos procesa antes de actualizar pesos

```
Total ejemplos: 30
Batch size: 8

Batch 1: Ejemplos 0-7   → Forward → Loss → Backward → Update
Batch 2: Ejemplos 8-15  → Forward → Loss → Backward → Update
Batch 3: Ejemplos 16-23 → Forward → Loss → Backward → Update
Batch 4: Ejemplos 24-29 → Forward → Loss → Backward → Update

Total updates por epoch: 4
```

**Trade-offs:**
- Batch pequeño (4-8):
  - ✅ Más updates por epoch (aprende más rápido)
  - ❌ Gradientes ruidosos (menos estable)
  
- Batch grande (32-64):
  - ✅ Gradientes suaves (más estable)
  - ❌ Menos updates por epoch (aprende más lento)
  - ❌ Necesita más memoria

**En NuPsi:**
- Pocos datos (10-30 ejemplos) → Batch pequeño (8)
- Muchos datos (100+) → Batch más grande (16-32)

#### **Epochs**

```typescript
await model.fit(X, y, {
  epochs: 50  // ← Número de epochs
});
```

**¿Qué es un epoch?**
- 1 epoch = 1 pasada completa por TODOS los datos

```
Epoch 0: Procesa todos los 30 ejemplos (en batches)
Epoch 1: Procesa todos los 30 ejemplos (en batches)
...
Epoch 50: Procesa todos los 30 ejemplos (en batches)

Total ejemplos vistos: 30 * 50 = 1,500
```

**¿Cuántos epochs?**
- Muy pocos → Underfitting (no aprende suficiente)
- Demasiados → Overfitting (memoriza, no generaliza)

**Cómo detectar:**

```
Epoch 0:  train_loss=1.38, val_loss=1.42
Epoch 10: train_loss=0.62, val_loss=0.68
Epoch 20: train_loss=0.34, val_loss=0.41
Epoch 30: train_loss=0.18, val_loss=0.25  ← Óptimo
Epoch 40: train_loss=0.09, val_loss=0.32  ← Overfitting
Epoch 50: train_loss=0.04, val_loss=0.45  ← Overfitting severo
```

**Early Stopping:**

```typescript
await model.fit(X, y, {
  epochs: 100,
  validationSplit: 0.2,
  callbacks: {
    onEpochEnd: (epoch, logs) => {
      // Si val_loss no mejora en 10 epochs → Stop
      if (epoch > 10 && logs.val_loss > bestValLoss + 0.01) {
        patienceCounter++;
        if (patienceCounter >= 10) {
          model.stopTraining = true;
        }
      } else {
        bestValLoss = logs.val_loss;
        patienceCounter = 0;
      }
    }
  }
});
```

#### **Dropout Rate**

```typescript
tf.layers.dropout({ rate: 0.2 })  // ← Dropout rate
```

**¿Qué hace?**
- Durante entrenamiento, "apaga" aleatoriamente 20% de neuronas
- Previene overfitting (el modelo no puede memorizar)

```
Sin Dropout:
  Layer [1, 2, 3, 4, 5, 6, 7, 8]
  → Todas activas
  → Modelo memoriza patrones específicos

Con Dropout 0.2:
  Epoch 0: [1, X, 3, 4, X, 6, 7, 8]  (20% apagadas)
  Epoch 1: [1, 2, X, 4, 5, X, 7, X]
  Epoch 2: [X, 2, 3, X, 5, 6, X, 8]
  → Modelo debe aprender patrones robustos
  → No puede depender de neuronas específicas
```

**Durante predicción:**
- Dropout se desactiva
- Todas las neuronas están activas

#### **Validation Split**

```typescript
await model.fit(X, y, {
  validationSplit: 0.2  // ← 20% para validación
});
```

**¿Para qué?**
- Detectar overfitting
- Evaluar generalización

```
Total datos: 30
Training: 24 (80%)
Validation: 6 (20%)

Entrenamiento:
  - Usa 24 ejemplos para actualizar pesos
  
Después de cada epoch:
  - Evalúa en 6 ejemplos de validación
  - NO actualiza pesos con estos ejemplos
  - Solo mide performance
```

### ⚙️ Optimizadores

#### **SGD (Stochastic Gradient Descent)**

```typescript
optimizer: tf.train.sgd(0.01)
```

**Algoritmo:**
```
weight_new = weight_old - learning_rate * gradient
```

**Ventajas:**
- ✅ Simple
- ✅ Funciona bien en casos simples

**Desventajas:**
- ❌ Sensible al learning rate
- ❌ Puede quedarse en mínimos locales

#### **Adam (Adaptive Moment Estimation)**

```typescript
optimizer: tf.train.adam(0.001)
```

**Algoritmo (simplificado):**
```
m = beta1 * m + (1-beta1) * gradient      // Momentum
v = beta2 * v + (1-beta2) * gradient^2    // Adaptive learning rate

weight_new = weight_old - lr * m / sqrt(v)
```

**Ventajas:**
- ✅ Adapta learning rate por parámetro
- ✅ Funciona bien en la mayoría de casos
- ✅ Menos sensible a hiperparámetros

**Desventajas:**
- ❌ Más complejo
- ❌ Usa más memoria

**En NuPsi: Usamos Adam** porque:
- Converge más rápido
- Funciona bien con pocos datos
- Menos tuning de hiperparámetros

### 📈 Métricas

#### **Loss (Pérdida)**

**Para Clasificación (Cross-Entropy):**

```typescript
loss: 'categoricalCrossentropy'
```

```
y_true = [1, 0, 0, 0]  // Positivo
y_pred = [0.7, 0.2, 0.08, 0.02]

loss = -sum(y_true * log(y_pred))
     = -1*log(0.7)
     = 0.357

Si predicción perfecta:
y_pred = [1, 0, 0, 0]
loss = -1*log(1) = 0  ← Mínimo
```

**Para Regresión (MSE):**

```typescript
loss: 'meanSquaredError'
```

```
y_true = 78  // Score real
y_pred = 72  // Score predicho

loss = (y_true - y_pred)^2
     = (78 - 72)^2
     = 36

Si predicción perfecta:
y_pred = 78
loss = 0  ← Mínimo
```

#### **Accuracy**

```typescript
metrics: ['accuracy']
```

```
Total predicciones: 10

Correctas:
  Pred: Positivo, Real: Positivo ✓
  Pred: Neutral, Real: Neutral ✓
  Pred: Negativo, Real: Negativo ✓
  Pred: Positivo, Real: Positivo ✓
  Pred: Neutral, Real: Neutral ✓
  Pred: Positivo, Real: Positivo ✓
  Pred: Positivo, Real: Positivo ✓

Incorrectas:
  Pred: Positivo, Real: Neutral ✗
  Pred: Neutral, Real: Negativo ✗
  Pred: Negativo, Real: Positivo ✗

Accuracy = 7/10 = 0.7 = 70%
```

#### **MAE (Mean Absolute Error)**

```typescript
metrics: ['mae']
```

```
Predicciones:
  Pred: 78, Real: 75  → Error: |78-75| = 3
  Pred: 65, Real: 70  → Error: |65-70| = 5
  Pred: 82, Real: 80  → Error: |82-80| = 2

MAE = (3 + 5 + 2) / 3 = 3.33

Interpretación: En promedio, te equivocas por 3.33 puntos
```

---

## 7. Deployment en el Navegador

### 🌐 Ejecución Client-Side

**Ventajas:**
- ✅ Privacidad (datos no salen del dispositivo)
- ✅ Gratis (sin costos de servidor)
- ✅ Offline (funciona sin internet)
- ✅ Baja latencia (sin round-trip al servidor)

**Desventajas:**
- ❌ Limitado por hardware del usuario
- ❌ Tamaño inicial de descarga (TensorFlow.js ~500KB)
- ❌ No todos los navegadores soportan WebGL

### 🚀 Flujo de Carga

```typescript
// 1. Importar TensorFlow.js
import * as tf from '@tensorflow/tfjs';

// 2. Intentar cargar modelo guardado
async function loadModel(): Promise<tf.LayersModel | null> {
  try {
    const model = await tf.loadLayersModel('indexeddb://nupsi-emotional-model');
    console.log('✓ Modelo cargado desde IndexedDB');
    return model;
  } catch (e) {
    console.log('✗ No hay modelo guardado');
    return null;
  }
}

// 3. Si no existe, entrenar uno nuevo
async function ensureModel(datos: DailyMLInput[]): Promise<tf.LayersModel> {
  let model = await loadModel();
  
  if (!model) {
    console.log('Entrenando nuevo modelo...');
    model = await trainModel(datos);
    await model.save('indexeddb://nupsi-emotional-model');
  }
  
  return model;
}

// 4. Usar para predicciones
async function predict(dato: DailyMLInput): Promise<Prediction> {
  const model = await ensureModel(datosHistoricos);
  const features = prepareFeatures(dato);
  const X = tf.tensor2d([features]);
  
  const prediction = model.predict(X) as tf.Tensor;
  const probabilities = await prediction.data();
  
  // ¡IMPORTANTE! Liberar memoria
  X.dispose();
  prediction.dispose();
  
  return interpretPrediction(probabilities);
}
```

### 🧹 Gestión de Memoria

**Problema:** TensorFlow.js usa GPU → Memoria limitada

**Solución:** Dispose de tensores

```typescript
// ❌ MAL: Memory leak
function badPredict(data) {
  const X = tf.tensor2d(data);
  const y = model.predict(X);
  return y.data();
  // X e y no se liberan → Memoria crece
}

// ✅ BIEN: Libera memoria
async function goodPredict(data) {
  const X = tf.tensor2d(data);
  const y = model.predict(X) as tf.Tensor;
  const result = await y.data();
  
  // Liberar tensores
  X.dispose();
  y.dispose();
  
  return result;
}

// ✅ MEJOR: Tidy (automático)
function bestPredict(data) {
  return tf.tidy(() => {
    const X = tf.tensor2d(data);
    const y = model.predict(X) as tf.Tensor;
    return y.data();
    // Al salir de tidy(), X e y se liberan automáticamente
  });
}
```

**Monitorear memoria:**

```typescript
console.log('Tensors en memoria:', tf.memory().numTensors);
console.log('Bytes usados:', tf.memory().numBytes);
```

### ⚡ Aceleración WebGL

TensorFlow.js automáticamente usa **WebGL** (GPU) si está disponible.

```typescript
// Verificar backend
console.log('Backend actual:', tf.getBackend());
// "webgl" → Usa GPU
// "cpu" → Fallback a CPU

// Configurar backend manualmente
await tf.setBackend('webgl');
await tf.ready();
```

**Performance:**
```
CPU:    100-500ms por predicción
WebGL:  10-50ms por predicción
→ 10x más rápido
```

### 📦 Bundle Size Optimization

```typescript
// ❌ Importar todo TensorFlow.js (~2MB)
import * as tf from '@tensorflow/tfjs';

// ✅ Solo lo necesario (~500KB)
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
```

**En Angular:**

```typescript
// angular.json
{
  "budgets": [
    {
      "type": "initial",
      "maximumWarning": "2mb",
      "maximumError": "5mb"
    }
  ]
}
```

### 🔄 Re-entrenamiento Automático

```typescript
class MLAutoTrainer {
  private readonly RE_TRAIN_INTERVAL_DAYS = 7;
  
  async checkAndRetrain(userId: string) {
    const lastTrain = await this.getLastTrainDate(userId);
    const daysSince = this.daysSince(lastTrain);
    
    if (daysSince >= this.RE_TRAIN_INTERVAL_DAYS) {
      console.log('Re-entrenando modelo (han pasado 7 días)...');
      
      // Obtener datos recientes
      const datos = await this.getDailyMLInputs(userId, 30);
      
      if (datos.length >= 10) {
        // Re-entrenar
        await this.trainEmotionalModel(datos);
        await this.saveModel('emotional');
        
        // Guardar fecha
        await this.saveLastTrainDate(userId, new Date());
        
        console.log('✓ Modelo re-entrenado');
      }
    }
  }
}
```

---

## 🎓 RESUMEN COMPLETO

### Para Niños (5 años):
El celular aprende cómo te sientes cada día. Si ve que cuando duermes bien y haces ejercicio estás feliz, la próxima vez te dirá "haz ejercicio y duerme bien para estar feliz".

### Para Principiantes (Nivel Básico):
NuPsi usa Machine Learning para aprender de tus hábitos. Registras cómo te sientes, qué comes, cuánto duermes. El modelo encuentra patrones y te da consejos personalizados. Todo pasa en tu celular, privado y gratis.

### Para Intermedios (Nivel Medio):
Dos modelos de TensorFlow.js: uno clasifica emociones (Positivo/Neutral/Negativo/Crítico) y otro predice tu score de bienestar (0-100). Usan redes neuronales densas con 2-3 capas ocultas, entrenadas con tus datos. Features normalizadas [0-1]. Modelos guardados en IndexedDB del navegador.

### Para Avanzados (Nivel Técnico):
Arquitectura: Red neuronal densa (10 input → 16 hidden (ReLU+Dropout) → 8 hidden (ReLU) → 4 output (Softmax)). Entrenamiento con Adam optimizer (lr=0.001), categorical cross-entropy loss, 50 epochs, batch size 8, validation split 20%. Features: ratios emocionales, estado anímico ordinal, métricas de sueño/hidratación/ejercicio/alimentación normalizadas min-max. Predicción client-side con TensorFlow.js + WebGL acceleration. Persistencia en IndexedDB. Re-entrenamiento automático cada 7 días. Memory management con tensor disposal. Fallback a heurística si datos < 10 registros.

---

## 📚 RECURSOS

- **TensorFlow.js:** https://www.tensorflow.org/js
- **Tutorial ML:** https://developers.google.com/machine-learning/crash-course
- **Guía Completa NuPsi:** [GUIA_COMPLETA_NUPSI.md](./GUIA_COMPLETA_NUPSI.md)
- **Rasa Bot:** [RASA_BOT_EXPLICACION_COMPLETA.md](./RASA_BOT_EXPLICACION_COMPLETA.md)

---

## 👨‍💻 AUTOR

**Documentación Técnica de Modelos ML - NuPsi**
Fecha: Noviembre 2025

---

## 📄 LICENCIA

MIT License - Proyecto NuPsi
