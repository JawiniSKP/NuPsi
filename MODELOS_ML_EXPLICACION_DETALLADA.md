# 🧠 Modelos de Clasificación ML en NuPsi
## Explicación Completa: Del Nivel Más Simple al Más Técnico

---

## 📖 Tabla de Contenidos

1. [Nivel Principiante: ¿Qué es Machine Learning?](#nivel-1-principiante)
2. [Nivel Intermedio: Los 3 Modelos de NuPsi](#nivel-2-intermedio)
3. [Nivel Avanzado: Arquitectura de Redes Neuronales](#nivel-3-avanzado)
4. [Nivel Experto: Implementación TensorFlow.js](#nivel-4-experto)

---

# Nivel 1: Principiante

## ¿Qué es Machine Learning?

**Machine Learning** (Aprendizaje Automático) es cuando una computadora **aprende** sin que la programemos explícitamente.

### Analogía Simple: Niño Aprendiendo Animales

**Método Tradicional (Programación):**
```
Le decimos reglas:
- Si tiene 4 patas y ladra → Es un perro
- Si tiene rayas negras y blancas → Es una cebra
- Si tiene trompa → Es un elefante
```

**Machine Learning:**
```
Le mostramos 100 fotos:
- Foto 1: Perro (etiqueta: perro)
- Foto 2: Gato (etiqueta: gato)
- Foto 3: Perro (etiqueta: perro)
...

El niño aprende por sí mismo los patrones:
- Perros tienen orejas caídas, cola
- Gatos tienen bigotes, son pequeños
```

### ¿Qué es "Clasificación"?

**Clasificar** es poner cosas en **categorías**.

**Ejemplos cotidianos:**
- Email: ¿Es spam o no spam?
- Fruta: ¿Es manzana, plátano o naranja?
- Película: ¿Es comedia, terror o drama?

**En NuPsi:**
- Estado emocional: ¿Es positivo, neutral, negativo o crítico?
- Bienestar: ¿Es óptimo, bueno, regular, bajo o crítico?

---

## ¿Qué hace NuPsi con Machine Learning?

NuPsi usa ML para **entender tu estado de bienestar** basándose en tus datos diarios:

```
Tus datos:
✅ ¿Cómo te sientes? (feliz, triste, ansioso)
✅ ¿Cuánto dormiste? (7 horas)
✅ ¿Cuánta agua bebiste? (6 vasos)
✅ ¿Hiciste ejercicio? (Sí, 30 min)
✅ ¿Cómo comiste? (Saludable)

        ↓
    [MODELO ML]
        ↓

Resultado:
🎯 Estado: POSITIVO (85% confianza)
📊 Score: 78/100
💡 Recomendaciones personalizadas
```

---

## Los 3 Sistemas ML de NuPsi

### 1. **Clasificación Emocional** 🎭

**¿Qué hace?** Predice tu estado emocional

**Entrada:** Tus emociones, estrés, sueño, alimentación
**Salida:** Positivo, Neutral, Negativo o Crítico

**Ejemplo:**
```
Usuario reporta:
- Emociones: feliz, motivado
- Estrés: 3/10
- Sueño: 8 horas
- Ejercicio: Sí

Modelo predice:
→ Estado: POSITIVO (87% confianza)
```

### 2. **Predicción de Score** 📊

**¿Qué hace?** Calcula un número de 0 a 100 que representa tu bienestar

**Entrada:** Los mismos datos
**Salida:** Un número (0-100)

**Ejemplo:**
```
Mismo usuario:
→ Score: 82/100
→ Interpretación: "Muy bien, sigue así"
```

### 3. **Análisis Integral** 💪

**¿Qué hace?** Analiza 5 dimensiones de tu bienestar

**Las 5 dimensiones:**
1. 💭 Emocional (tu ánimo)
2. 💪 Física (ejercicio, IMC)
3. 🎯 Hábitos (sueño, agua)
4. 🥗 Nutrición (comidas)
5. 🤝 Social (relaciones)

**Ejemplo:**
```
Análisis:
💭 Emocional:  85/100 (Muy bien)
💪 Física:     70/100 (Bien)
🎯 Hábitos:    75/100 (Bien)
🥗 Nutrición:  80/100 (Muy bien)
🤝 Social:     78/100 (Bien)
────────────────────────
Total: 77/100 (BUENO)
```

---

## ¿Cómo Funciona el ML? (Explicación Simple)

### Paso 1: Recopilar Datos

```
Día 1: feliz, 8h sueño, ejercicio → Estado: Positivo
Día 2: triste, 5h sueño, no ejercicio → Estado: Negativo
Día 3: neutral, 7h sueño, ejercicio → Estado: Neutral
...
Día 30: motivado, 8h sueño, ejercicio → Estado: Positivo
```

### Paso 2: Entrenar el Modelo

```
El modelo busca patrones:
- Si sueño > 7h + ejercicio → 80% probabilidad Positivo
- Si sueño < 6h + estrés alto → 75% probabilidad Negativo
- Si todo está en medio → 70% probabilidad Neutral
```

### Paso 3: Hacer Predicciones

```
Nuevo día:
Usuario: "Dormí 8h, hice ejercicio, me siento feliz"

Modelo: "He visto esto antes... es muy similar a los días 
        que clasificamos como Positivo"

Predicción: POSITIVO (85% confianza)
```

---

# Nivel 2: Intermedio

## Conceptos Fundamentales

### 1. Features (Características)

Son los **datos de entrada** que el modelo usa para aprender.

En NuPsi, usamos **10 features**:

```javascript
1. Ratio emociones positivas    // 0.8 (80% positivas)
2. Ratio emociones negativas     // 0.2 (20% negativas)
3. Estado de ánimo normalizado   // 0.9 (excelente)
4. Nivel de estrés normalizado   // 0.3 (bajo estrés)
5. Calidad de sueño              // 0.8 (buena)
6. Horas de sueño normalizadas   // 0.88 (7 horas)
7. Hidratación normalizada       // 0.75 (6 vasos)
8. Actividad física              // 1.0 (sí hizo)
9. Calidad alimentación          // 0.9 (muy buena)
10. Número de comidas            // 0.8 (4 comidas)
```

**¿Por qué normalizar?**

Convertimos todo a escala **0-1** para que el modelo compare mejor:

```
SIN normalizar:
- Horas de sueño: 7 (número grande)
- Actividad física: 1 (número pequeño)
→ El modelo da más importancia al sueño (injusto)

CON normalización:
- Horas de sueño: 0.88 (7/8)
- Actividad física: 1.0
→ El modelo trata todo igual (justo)
```

### 2. Labels (Etiquetas)

Son las **respuestas correctas** que queremos que el modelo aprenda.

**Para Clasificación Emocional:**
```javascript
Positivo  → [1, 0, 0, 0]
Neutral   → [0, 1, 0, 0]
Negativo  → [0, 0, 1, 0]
Crítico   → [0, 0, 0, 1]
```

**¿Por qué vectores?**

Porque el modelo necesita números. Este formato se llama **One-Hot Encoding**.

### 3. Training (Entrenamiento)

Es el proceso donde el modelo **aprende** de los ejemplos.

```
Iteración 1:
Datos: [0.8, 0.2, 0.9, 0.3, ...]
Etiqueta real: Positivo [1, 0, 0, 0]
Predicción: [0.25, 0.25, 0.25, 0.25] (adivina al azar)
Error: GRANDE
→ Ajusta sus "pesos" (neuronas)

Iteración 100:
Datos: [0.8, 0.2, 0.9, 0.3, ...]
Etiqueta real: Positivo [1, 0, 0, 0]
Predicción: [0.45, 0.30, 0.15, 0.10]
Error: Medio
→ Sigue ajustando

Iteración 1000:
Datos: [0.8, 0.2, 0.9, 0.3, ...]
Etiqueta real: Positivo [1, 0, 0, 0]
Predicción: [0.89, 0.07, 0.03, 0.01]
Error: PEQUEÑO ✅
→ ¡Ya aprendió!
```

### 4. Epochs (Épocas)

Una **época** es cuando el modelo ve **todos** los datos de entrenamiento una vez.

```
Tenemos 30 ejemplos de datos:

Época 1: Ve los 30 ejemplos → Precisión: 40%
Época 2: Ve los 30 ejemplos → Precisión: 55%
Época 3: Ve los 30 ejemplos → Precisión: 68%
...
Época 50: Ve los 30 ejemplos → Precisión: 95% ✅
```

**Configuración en NuPsi:**
- Modelo Emocional: **50 epochs**
- Modelo de Bienestar: **100 epochs**

### 5. Batch Size (Tamaño de Lote)

Cuántos ejemplos procesa el modelo **a la vez** antes de ajustar pesos.

```
30 ejemplos totales, batch_size = 8:

Batch 1: Ejemplos 1-8   → Ajusta pesos
Batch 2: Ejemplos 9-16  → Ajusta pesos
Batch 3: Ejemplos 17-24 → Ajusta pesos
Batch 4: Ejemplos 25-30 → Ajusta pesos
→ Completó 1 época
```

**Configuración en NuPsi:**
- Modelo Emocional: **batch_size = 8**
- Modelo de Bienestar: **batch_size = 16**

---

## Redes Neuronales Explicadas

Una **red neuronal** es un modelo inspirado en el cerebro humano.

### Analogía: Red de Decisiones

Imagina que decides si salir a correr:

```
Inputs (Sensores):
👁️ ¿Hace sol? → Sí (1)
🌡️ ¿Hace calor? → No (0)
⏰ ¿Tengo tiempo? → Sí (1)
💤 ¿Estoy cansado? → No (0)

Capa Oculta (Neuronas pensando):
Neurona 1: "Sol + tiempo = bueno para correr" → 0.9
Neurona 2: "No hace calor, pero hay sol" → 0.7
Neurona 3: "No estoy cansado + tiempo" → 0.8

Capa de Salida (Decisión):
"Voy a correr": 0.85 (85% probabilidad) ✅
"Me quedo en casa": 0.15 (15% probabilidad)
```

### Arquitectura Básica

```
Input Layer          Hidden Layers         Output Layer
(Datos)              (Procesamiento)       (Predicción)

[Feature 1]              [Neurona 1]
[Feature 2]    →         [Neurona 2]    →    [Positivo]
[Feature 3]              [Neurona 3]         [Neutral]
[Feature 4]              [Neurona 4]         [Negativo]
...                      ...                 [Crítico]
[Feature 10]             [Neurona 16]
```

**Cada conexión tiene un "peso" (importancia):**

```
Feature "Horas de sueño" → Neurona 1 → Peso: 0.8 (importante)
Feature "Hidratación" → Neurona 1 → Peso: 0.3 (menos importante)
```

---

## Los 3 Modelos en Detalle

### Modelo 1: Clasificación Emocional

**Arquitectura:**

```
Input (10 neuronas)
    ↓
Hidden Layer 1 (16 neuronas + ReLU)
    ↓
Dropout (20% de neuronas apagadas) → Previene overfitting
    ↓
Hidden Layer 2 (8 neuronas + ReLU)
    ↓
Output (4 neuronas + Softmax)
    ↓
[Prob_Positivo, Prob_Neutral, Prob_Negativo, Prob_Crítico]
```

**¿Qué es ReLU?**

Es una **función de activación** que ayuda a las neuronas a "pensar":

```python
ReLU(x) = max(0, x)

Ejemplos:
ReLU(-5) = 0   # Valores negativos → 0
ReLU(0) = 0    # Cero → 0
ReLU(5) = 5    # Valores positivos → sin cambio
```

**¿Qué es Softmax?**

Convierte números en **probabilidades** que suman 1:

```python
Input: [2.5, 1.0, 0.5, 0.1]

Softmax:
[0.73, 0.16, 0.09, 0.02]
 ↑     ↑     ↑     ↑
Posi  Neut  Neg   Crít

Total: 0.73 + 0.16 + 0.09 + 0.02 = 1.0 ✅
```

**¿Qué es Dropout?**

Apaga **aleatoriamente** algunas neuronas durante el entrenamiento:

```
Sin Dropout:
[Neurona 1] [Neurona 2] [Neurona 3] [Neurona 4]
    ON          ON          ON          ON

Con Dropout 20%:
[Neurona 1] [Neurona 2] [Neurona 3] [Neurona 4]
    ON          OFF         ON          ON
```

**Beneficio:** Previene que el modelo "memorice" en lugar de "aprender".

**Ejemplo de Uso:**

```typescript
// Datos del usuario
const datos = {
  emociones: ['feliz', 'motivado'],
  estadoAnimo: 'bueno',
  nivelEstres: 4,
  horasSueno: 7,
  calidadSueno: 8,
  vasosAgua: 6,
  actividadFisica: true,
  tipoActividad: 'correr',
  comidas: 4,
  calidadAlimentacion: 8
};

// Procesamiento
const features = [
  0.67,  // ratio positivas (2/3)
  0.33,  // ratio negativas (1/3)
  0.75,  // estado ánimo bueno
  0.4,   // estrés moderado
  0.8,   // calidad sueño
  0.88,  // horas sueño (7/8)
  0.75,  // hidratación (6/8)
  1.0,   // actividad física
  0.8,   // calidad alimentación
  0.8    // comidas (4/5)
];

// Predicción del modelo
const prediccion = model.predict(features);
// [0.85, 0.10, 0.04, 0.01]

// Interpretación
{
  categoria: 'positivo',
  confianza: 0.85,
  probabilidades: {
    positivo: 0.85,
    neutral: 0.10,
    negativo: 0.04,
    critico: 0.01
  }
}
```

### Modelo 2: Predicción de Score

**Arquitectura:**

```
Input (10 neuronas)
    ↓
Hidden Layer 1 (32 neuronas + ReLU)
    ↓
Dropout (30%)
    ↓
Hidden Layer 2 (16 neuronas + ReLU)
    ↓
Dropout (20%)
    ↓
Hidden Layer 3 (8 neuronas + ReLU)
    ↓
Output (1 neurona + Sigmoid)
    ↓
Score (0-100)
```

**¿Qué es Sigmoid?**

Convierte cualquier número en un valor entre **0 y 1**:

```python
Sigmoid(x) = 1 / (1 + e^(-x))

Ejemplos:
Sigmoid(-10) = 0.00004 ≈ 0
Sigmoid(0) = 0.5
Sigmoid(10) = 0.99995 ≈ 1
```

**Luego multiplicamos por 100** para obtener un score de 0-100.

**Ejemplo de Uso:**

```typescript
// Mismos datos del usuario
const features = [0.67, 0.33, 0.75, 0.4, 0.8, 0.88, 0.75, 1.0, 0.8, 0.8];

// Predicción del modelo
const prediccion = model.predict(features);
// Output: 0.78

// Convertir a score
const score = Math.round(prediccion * 100);
// 78

{
  scorePredicho: 78,
  confianza: 0.85,
  interpretacion: 'Bueno',
  factoresImportantes: [
    { factor: 'Estado Emocional', impacto: 0.92 },
    { factor: 'Calidad de Sueño', impacto: 0.85 },
    { factor: 'Actividad Física', impacto: 0.78 }
  ]
}
```

### Modelo 3: Análisis Integral

Este modelo combina **heurística + ML**.

**Cálculo de las 5 Dimensiones:**

```typescript
// 1. Dimensión Emocional (30% del total)
emocional = (
  ratioPositivas * 0.4 +
  estadoAnimo * 0.4 +
  (1 - nivelEstres) * 0.2
) * 100

// 2. Dimensión Física (25% del total)
fisica = (
  actividadFisica * 0.7 +
  indicadorIMC * 0.3
) * 100

// 3. Dimensión Hábitos (20% del total)
habitos = (
  calidadSueno * 0.6 +
  hidratacion * 0.4
) * 100

// 4. Dimensión Nutrición (15% del total)
nutricion = (
  calidadAlimentacion * 0.6 +
  frecuenciaComidas * 0.4
) * 100

// 5. Dimensión Social (10% del total)
social = estadoEmocional * 100
```

**Score Total:**

```typescript
scoreTotal = (
  emocional * 0.30 +
  fisica * 0.25 +
  habitos * 0.20 +
  nutricion * 0.15 +
  social * 0.10
)
```

**Clasificación:**

```typescript
if (scoreTotal >= 80) return 'Óptimo';
if (scoreTotal >= 65) return 'Bueno';
if (scoreTotal >= 50) return 'Regular';
if (scoreTotal >= 35) return 'Bajo';
return 'Crítico';
```

**Ejemplo Completo:**

```typescript
Usuario:
- Emociones: feliz, motivado
- Estado: bueno (0.75)
- Estrés: 4/10 (0.4)
- Sueño: 8h, calidad 8/10
- Agua: 6 vasos
- Ejercicio: Sí
- Comidas: 4, calidad 8/10
- IMC: 22.5 (normal)

Cálculos:

emocional = (0.67*0.4 + 0.75*0.4 + 0.6*0.2) * 100 = 69
fisica = (1.0*0.7 + 0.9*0.3) * 100 = 97
habitos = (0.8*0.6 + 0.75*0.4) * 100 = 78
nutricion = (0.8*0.6 + 0.8*0.4) * 100 = 80
social = 0.75 * 100 = 75

scoreTotal = 69*0.30 + 97*0.25 + 78*0.20 + 80*0.15 + 75*0.10
           = 20.7 + 24.25 + 15.6 + 12 + 7.5
           = 80.05

Resultado: ÓPTIMO ✅
```

---

# Nivel 3: Avanzado

## TensorFlow.js: ML en el Navegador

**TensorFlow.js** es una librería de Google para hacer ML en JavaScript.

### ¿Por qué en el Navegador?

**Ventajas:**
- ✅ **Privacidad**: Los datos nunca salen del dispositivo
- ✅ **Velocidad**: No hay latencia de red
- ✅ **Offline**: Funciona sin internet
- ✅ **Gratis**: No hay costos de servidor

**Desventajas:**
- ⚠️ Limitado por el hardware del dispositivo
- ⚠️ Modelos deben ser pequeños (< 10 MB)

### Aceleración GPU con WebGL

TensorFlow.js usa **WebGL** para usar la GPU del dispositivo:

```
CPU: 100 operaciones/segundo
GPU: 10,000 operaciones/segundo (100x más rápido)
```

---

## Arquitectura Detallada

### Clasificación Emocional

```typescript
const model = tf.sequential({
  layers: [
    // Input: 10 features
    tf.layers.dense({
      units: 16,              // 16 neuronas
      activation: 'relu',      // Función ReLU
      inputShape: [10],        // 10 features de entrada
      kernelInitializer: 'heNormal',  // Inicialización de pesos
    }),
    
    // Regularización
    tf.layers.dropout({
      rate: 0.2               // Apaga 20% de neuronas
    }),
    
    // Hidden layer 2
    tf.layers.dense({
      units: 8,
      activation: 'relu'
    }),
    
    // Output: 4 categorías
    tf.layers.dense({
      units: 4,
      activation: 'softmax'   // Probabilidades
    })
  ]
});

// Compilar modelo
model.compile({
  optimizer: tf.train.adam(0.001),        // Optimizador Adam
  loss: 'categoricalCrossentropy',        // Función de pérdida
  metrics: ['accuracy']                   // Métrica a monitorear
});
```

**Parámetros del Modelo:**

```
Capa 1: (10 inputs × 16 neuronas) + 16 biases = 176 parámetros
Capa 2: (16 inputs × 8 neuronas) + 8 biases = 136 parámetros
Capa 3: (8 inputs × 4 neuronas) + 4 biases = 36 parámetros

Total: 348 parámetros entrenables
```

### Predicción de Score

```typescript
const model = tf.sequential({
  layers: [
    tf.layers.dense({
      units: 32,
      activation: 'relu',
      inputShape: [10],
      kernelInitializer: 'heNormal'
    }),
    tf.layers.dropout({ rate: 0.3 }),
    
    tf.layers.dense({
      units: 16,
      activation: 'relu'
    }),
    tf.layers.dropout({ rate: 0.2 }),
    
    tf.layers.dense({
      units: 8,
      activation: 'relu'
    }),
    
    // Output: 1 valor continuo
    tf.layers.dense({
      units: 1,
      activation: 'sigmoid'   // 0-1
    })
  ]
});

model.compile({
  optimizer: tf.train.adam(0.001),
  loss: 'meanSquaredError',      // MSE para regresión
  metrics: ['mae']               // Mean Absolute Error
});
```

**Parámetros:**

```
Capa 1: (10 × 32) + 32 = 352
Capa 2: (32 × 16) + 16 = 528
Capa 3: (16 × 8) + 8 = 136
Capa 4: (8 × 1) + 1 = 9

Total: 1,025 parámetros
```

---

## Proceso de Entrenamiento

### Preparación de Datos

```typescript
// Datos crudos del usuario
const datosUsuario = [
  { emociones: ['feliz'], estadoAnimo: 'bueno', ... },
  { emociones: ['triste', 'ansioso'], estadoAnimo: 'malo', ... },
  ...
];

// 1. Extraer features
const X = datosUsuario.map(dato => extractFeatures(dato));
// [[0.8, 0.2, 0.9, ...], [0.3, 0.7, 0.4, ...], ...]

// 2. Crear labels
const y = datosUsuario.map(dato => createLabel(dato));
// [[1,0,0,0], [0,0,1,0], ...]

// 3. Convertir a tensores
const xs = tf.tensor2d(X);    // Shape: [n, 10]
const ys = tf.tensor2d(y);    // Shape: [n, 4]

// 4. Normalizar (ya están en 0-1)
```

### Entrenamiento

```typescript
await model.fit(xs, ys, {
  epochs: 50,              // 50 iteraciones
  batchSize: 8,            // 8 ejemplos por lote
  validationSplit: 0.2,    // 20% para validación
  shuffle: true,           // Mezclar datos
  callbacks: {
    onEpochEnd: (epoch, logs) => {
      console.log(`Época ${epoch + 1}/50`);
      console.log(`  Loss: ${logs.loss.toFixed(4)}`);
      console.log(`  Accuracy: ${logs.acc.toFixed(4)}`);
      console.log(`  Val Loss: ${logs.val_loss.toFixed(4)}`);
      console.log(`  Val Acc: ${logs.val_acc.toFixed(4)}`);
    }
  }
});
```

**Output del Entrenamiento:**

```
Época 1/50
  Loss: 1.3862
  Accuracy: 0.3750
  Val Loss: 1.4521
  Val Acc: 0.3333

Época 10/50
  Loss: 0.8234
  Accuracy: 0.6875
  Val Loss: 0.9102
  Val Acc: 0.6667

Época 25/50
  Loss: 0.4521
  Accuracy: 0.8750
  Val Loss: 0.5234
  Val Acc: 0.8333

Época 50/50
  Loss: 0.1124
  Accuracy: 0.9750
  Val Loss: 0.2156
  Val Acc: 0.9167 ✅
```

### Guardado del Modelo

```typescript
// Guardar en IndexedDB del navegador
await model.save('indexeddb://nupsi-emotional-model');

// Información guardada:
// - Arquitectura del modelo (JSON)
// - Pesos entrenados (binario)
// - Configuración del optimizador

// Nombres de modelos usados en el proyecto:
// - 'indexeddb://nupsi-emotional-model' (Clasificación Emocional)
// - 'indexeddb://nupsi-wellness-model' (Predicción de Bienestar)
```

---

## Predicción en Tiempo Real

```typescript
async function predecirEstadoEmocional(dato: DailyMLInput) {
  // 1. Cargar modelo
  const model = await tf.loadLayersModel(
    'indexeddb://nupsi-emotional-model'
  );
  
  // 2. Extraer features
  const features = extractFeatures(dato);
  // [0.8, 0.2, 0.9, 0.3, 0.8, 0.88, 0.75, 1.0, 0.9, 0.8]
  
  // 3. Convertir a tensor
  const input = tf.tensor2d([features]);
  // Shape: [1, 10]
  
  // 4. Predecir
  const prediction = model.predict(input) as tf.Tensor;
  
  // 5. Obtener probabilidades
  const probabilities = await prediction.data();
  // Float32Array [0.85, 0.10, 0.04, 0.01]
  
  // 6. Encontrar categoría
  const categorias = ['positivo', 'neutral', 'negativo', 'critico'];
  const maxIndex = probabilities.indexOf(Math.max(...probabilities));
  
  // 7. Liberar memoria
  input.dispose();
  prediction.dispose();
  
  // 8. Retornar resultado
  return {
    categoria: categorias[maxIndex],
    confianza: probabilities[maxIndex],
    probabilidades: {
      positivo: probabilities[0],
      neutral: probabilities[1],
      negativo: probabilities[2],
      critico: probabilities[3]
    }
  };
}
```

---

# Nivel 4: Experto

## Implementación Completa

### TensorflowMLService

```typescript
import * as tf from '@tensorflow/tfjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TensorflowMLService {
  
  private emotionalModel: tf.LayersModel | null = null;
  private wellnessModel: tf.LayersModel | null = null;
  
  constructor() {
    this.initializeBackend();
  }
  
  /**
   * Inicializa el backend de TensorFlow (WebGL)
   */
  private async initializeBackend() {
    await tf.ready();
    await tf.setBackend('webgl');
    console.log('TensorFlow.js backend:', tf.getBackend());
  }
  
  /**
   * Extrae features numéricas de los datos del usuario
   */
  private extractFeatures(dato: DailyMLInput): number[] {
    // Clasificar emociones
    const emocionesPositivas = [
      'feliz', 'motivado', 'tranquilo', 'energético', 'optimista'
    ];
    const emocionesNegativas = [
      'triste', 'ansioso', 'estresado', 'cansado', 'frustrado'
    ];
    
    const positivas = dato.emociones.filter(e => 
      emocionesPositivas.includes(e)
    ).length;
    const negativas = dato.emociones.filter(e => 
      emocionesNegativas.includes(e)
    ).length;
    const total = dato.emociones.length || 1;
    
    // Normalizar estado de ánimo
    const estadoAnimoMap: { [key: string]: number } = {
      'excelente': 1.0,
      'bueno': 0.75,
      'regular': 0.5,
      'malo': 0.25,
      'muy-malo': 0.0
    };
    
    return [
      positivas / total,                           // 1. Ratio positivas
      negativas / total,                           // 2. Ratio negativas
      estadoAnimoMap[dato.estadoAnimo] || 0.5,    // 3. Estado ánimo
      1 - (dato.nivelEstres / 10),                // 4. Nivel estrés (invertido)
      dato.calidadSueno / 10,                     // 5. Calidad sueño
      Math.min(dato.horasSueno / 8, 1),           // 6. Horas sueño
      Math.min(dato.vasosAgua / 8, 1),            // 7. Hidratación
      dato.actividadFisica ? 1 : 0,               // 8. Actividad física
      dato.calidadAlimentacion / 10,              // 9. Calidad alimentación
      Math.min(dato.comidas / 5, 1)               // 10. Número comidas
    ];
  }
  
  /**
   * Crea etiqueta one-hot para clasificación
   */
  private createEmotionalLabel(dato: DailyMLInput): number[] {
    const features = this.extractFeatures(dato);
    const ratioPositivo = features[0];
    
    // Clasificación heurística para entrenamiento
    if (ratioPositivo >= 0.7) return [1, 0, 0, 0];  // Positivo
    if (ratioPositivo >= 0.4) return [0, 1, 0, 0];  // Neutral
    if (ratioPositivo >= 0.2) return [0, 0, 1, 0];  // Negativo
    return [0, 0, 0, 1];                            // Crítico
  }
  
  /**
   * Crea modelo de clasificación emocional
   */
  private createEmotionalModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        // Input + Hidden Layer 1
        tf.layers.dense({
          units: 16,
          activation: 'relu',
          inputShape: [10],
          kernelInitializer: 'heNormal',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
        }),
        
        // Dropout
        tf.layers.dropout({ rate: 0.2 }),
        
        // Hidden Layer 2
        tf.layers.dense({
          units: 8,
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
        }),
        
        // Output Layer
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
    
    return model;
  }
  
  /**
   * Entrena modelo de clasificación emocional
   */
  async trainEmotionalModel(datos: DailyMLInput[]): Promise<void> {
    if (datos.length < 10) {
      throw new Error('Se necesitan al menos 10 registros para entrenar');
    }
    
    console.log('🧠 Entrenando modelo emocional...');
    
    // Preparar datos
    const X = datos.map(d => this.extractFeatures(d));
    const y = datos.map(d => this.createEmotionalLabel(d));
    
    // Convertir a tensores
    const xs = tf.tensor2d(X);
    const ys = tf.tensor2d(y);
    
    // Crear modelo
    this.emotionalModel = this.createEmotionalModel();
    
    // Entrenar
    await this.emotionalModel.fit(xs, ys, {
      epochs: 50,
      batchSize: 8,
      validationSplit: 0.2,
      shuffle: true,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if ((epoch + 1) % 10 === 0) {
            console.log(`Época ${epoch + 1}/50 - ` +
                       `Loss: ${logs?.loss.toFixed(4)} - ` +
                       `Acc: ${logs?.acc.toFixed(4)}`);
          }
          
          // Early stopping si accuracy > 95%
          if ((logs?.acc || 0) > 0.95) {
            console.log('✅ Precisión excelente alcanzada!');
            this.emotionalModel?.stopTraining = true;
          }
        }
      }
    });
    
    // Liberar memoria
    xs.dispose();
    ys.dispose();
    
    console.log('✅ Modelo emocional entrenado!');
  }
  
  /**
   * Predice estado emocional
   */
  async predictEmotionalState(
    dato: DailyMLInput
  ): Promise<EmotionalPrediction> {
    
    if (!this.emotionalModel) {
      await this.loadModel('emotional');
    }
    
    if (!this.emotionalModel) {
      throw new Error('Modelo emocional no disponible');
    }
    
    // Extraer features
    const features = this.extractFeatures(dato);
    const input = tf.tensor2d([features]);
    
    // Predecir
    const prediction = this.emotionalModel.predict(input) as tf.Tensor;
    const probabilities = await prediction.array() as number[][];
    const probs = probabilities[0];
    
    // Interpretar
    const categorias = ['positivo', 'neutral', 'negativo', 'critico'];
    const maxIndex = probs.indexOf(Math.max(...probs));
    
    // Liberar memoria
    input.dispose();
    prediction.dispose();
    
    return {
      categoria: categorias[maxIndex],
      confianza: probs[maxIndex],
      probabilidades: {
        positivo: probs[0],
        neutral: probs[1],
        negativo: probs[2],
        critico: probs[3]
      }
    };
  }
  
  /**
   * Guarda modelo en IndexedDB
   */
  async saveModel(modelName: 'emotional' | 'wellness'): Promise<void> {
    const model = modelName === 'emotional' 
      ? this.emotionalModel 
      : this.wellnessModel;
    
    if (!model) {
      throw new Error(`Modelo ${modelName} no está cargado`);
    }
    
    const path = `indexeddb://nupsi-${modelName}-model`;
    await model.save(path);
    
    console.log(`✅ Modelo ${modelName} guardado en ${path}`);
  }
  
  /**
   * Carga modelo desde IndexedDB
   */
  async loadModel(modelName: 'emotional' | 'wellness'): Promise<void> {
    const path = `indexeddb://nupsi-${modelName}-model`;
    
    try {
      const model = await tf.loadLayersModel(path);
      
      if (modelName === 'emotional') {
        this.emotionalModel = model;
      } else {
        this.wellnessModel = model;
      }
      
      console.log(`✅ Modelo ${modelName} cargado desde ${path}`);
    } catch (error) {
      console.log(`⚠️  No se pudo cargar modelo ${modelName}:`, error);
    }
  }
  
  /**
   * Obtiene estado de los modelos
   */
  getModelsStatus() {
    return {
      emotional: {
        loaded: this.emotionalModel !== null,
        trained: this.emotionalModel !== null
      },
      wellness: {
        loaded: this.wellnessModel !== null,
        trained: this.wellnessModel !== null
      }
    };
  }
  
  /**
   * Libera memoria de los modelos
   */
  disposeModels() {
    if (this.emotionalModel) {
      this.emotionalModel.dispose();
      this.emotionalModel = null;
    }
    if (this.wellnessModel) {
      this.wellnessModel.dispose();
      this.wellnessModel = null;
    }
    
    console.log('🗑️  Modelos liberados de memoria');
  }
}

// Interfaces
interface DailyMLInput {
  emociones: string[];
  estadoAnimo: string;
  nivelEstres: number;
  horasSueno: number;
  calidadSueno: number;
  vasosAgua: number;
  actividadFisica: boolean;
  comidas: number;
  calidadAlimentacion: number;
}

interface EmotionalPrediction {
  categoria: string;
  confianza: number;
  probabilidades: {
    positivo: number;
    neutral: number;
    negativo: number;
    critico: number;
  };
}
```

---

## Optimizaciones Avanzadas

### 1. Data Augmentation

Aumentar datos artificialmente para mejorar el entrenamiento:

```typescript
function augmentData(dato: DailyMLInput): DailyMLInput[] {
  const augmented = [dato];
  
  // Agregar ruido pequeño
  for (let i = 0; i < 3; i++) {
    augmented.push({
      ...dato,
      nivelEstres: Math.max(1, Math.min(10, 
        dato.nivelEstres + (Math.random() - 0.5)
      )),
      vasosAgua: Math.max(0, Math.min(12, 
        dato.vasosAgua + Math.floor(Math.random() * 2 - 1)
      ))
    });
  }
  
  return augmented;
}
```

### 2. Learning Rate Scheduling

Ajustar tasa de aprendizaje durante el entrenamiento:

```typescript
const learningRateSchedule = (epoch: number) => {
  const initialLR = 0.001;
  const decayRate = 0.95;
  return initialLR * Math.pow(decayRate, epoch / 10);
};

model.compile({
  optimizer: tf.train.adam(learningRateSchedule(0)),
  loss: 'categoricalCrossentropy',
  metrics: ['accuracy']
});
```

### 3. Batch Normalization

Normalizar activaciones entre capas:

```typescript
tf.layers.dense({ units: 16, activation: 'relu' }),
tf.layers.batchNormalization(),  // ← Normaliza
tf.layers.dropout({ rate: 0.2 })
```

### 4. Ensemble Methods

Combinar múltiples modelos:

```typescript
async function ensemblePredict(dato: DailyMLInput) {
  const pred1 = await model1.predictEmotionalState(dato);
  const pred2 = await model2.predictEmotionalState(dato);
  const pred3 = await model3.predictEmotionalState(dato);
  
  // Promedio de probabilidades
  const avgProbs = {
    positivo: (pred1.probabilidades.positivo + 
               pred2.probabilidades.positivo + 
               pred3.probabilidades.positivo) / 3,
    // ... resto de categorías
  };
  
  return avgProbs;
}
```

---

## Métricas de Evaluación

### Confusion Matrix

```
                 Predicho
             Pos  Neu  Neg  Crí
Real  Pos    18   2    0    0
      Neu    1    15   3    1
      Neg    0    2    17   1
      Crí    0    0    1    19

Accuracy = (18+15+17+19) / 80 = 86.25%
```

### Precision, Recall, F1-Score

```typescript
function calculateMetrics(confusionMatrix: number[][]) {
  const metrics = [];
  
  for (let i = 0; i < confusionMatrix.length; i++) {
    const tp = confusionMatrix[i][i];
    const fp = confusionMatrix.map(row => row[i]).reduce((a,b) => a+b) - tp;
    const fn = confusionMatrix[i].reduce((a,b) => a+b) - tp;
    
    const precision = tp / (tp + fp);
    const recall = tp / (tp + fn);
    const f1 = 2 * (precision * recall) / (precision + recall);
    
    metrics.push({ precision, recall, f1 });
  }
  
  return metrics;
}
```

---

## Conclusión Técnica

El sistema ML de NuPsi implementa:

✅ **Redes Neuronales Densas** para clasificación y regresión
✅ **TensorFlow.js** para ML en el navegador
✅ **Aceleración GPU** con WebGL
✅ **Persistencia local** en IndexedDB
✅ **Privacidad** total (datos en el dispositivo)
✅ **Optimizaciones** avanzadas (dropout, regularización, etc.)

**Resultado:** Un sistema de análisis de bienestar **personalizado, privado y eficiente**.

---

**¡Ahora eres un experto en los modelos ML de NuPsi!** 🎓🧠
