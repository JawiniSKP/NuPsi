# 📚 Análisis Completo del Proyecto NuPsi
## Guía Paso a Paso para Entender Todo el Sistema

---

## 🎯 ¿Qué es NuPsi?

**NuPsi** es una aplicación móvil de **bienestar y acompañamiento** que combina:
- 📱 Una **app móvil** (Android/iOS) hecha con Ionic y Angular
- 🤖 Un **chatbot inteligente** hecho con Rasa (Python)
- 🧠 **Modelos de Machine Learning** para analizar el estado emocional y bienestar
- ☁️ **Firebase** como base de datos en la nube
- ✨ **Google Gemini** como inteligencia artificial avanzada

### Objetivo Principal
Ayudar a las personas a:
- Mejorar su nutrición
- Hacer ejercicio
- Gestionar sus emociones
- Monitorear su bienestar general

---

## 📂 Estructura del Proyecto (Simplificada)

Imagina el proyecto como una **casa con diferentes habitaciones**:

```
NuPsi (La Casa)
│
├── 📱 src/                    → La App Móvil (lo que el usuario ve)
├── 🤖 rasa-bot/               → El Cerebro del Chatbot (inteligencia conversacional)
├── 🔥 firebase/               → La Base de Datos (donde se guardan los datos)
├── 🎨 android/                → Versión Android de la app
└── 🍎 ios/                    → Versión iOS de la app
```

---

# 🤖 PARTE 1: RASA-BOT (El Chatbot Inteligente)

## ¿Qué es Rasa?

**Rasa** es un framework de código abierto para crear chatbots conversacionales.

### Analogía Simple:
Imagina que Rasa es como un **recepcionista inteligente** que:
1. **Escucha** lo que dices
2. **Entiende** qué quieres
3. **Responde** apropiadamente
4. **Aprende** con el tiempo

---

## 🧩 Componentes del Rasa-Bot

### 1️⃣ **config.yml** - La Configuración del Cerebro

Este archivo define **cómo el bot entiende el lenguaje**.

```yaml
language: es  # ← El bot habla español

pipeline:     # ← Pasos para entender el texto
  - WhitespaceTokenizer        # Separa palabras por espacios
  - RegexFeaturizer            # Detecta patrones (números, emails)
  - LexicalSyntacticFeaturizer # Entiende gramática
  - CountVectorsFeaturizer     # Cuenta palabras importantes
  - DIETClassifier             # Clasifica intenciones (el cerebro principal)
  - FallbackClassifier         # Maneja cuando no entiende
```

#### ✨ Explicación paso a paso:

**Paso 1: WhitespaceTokenizer**
```
Usuario escribe: "quiero bajar de peso"
Bot separa:     ["quiero", "bajar", "de", "peso"]
```

**Paso 2: CountVectorsFeaturizer**
```
Cuenta frecuencias: 
"bajar" → 1
"peso"  → 1
```

**Paso 3: DIETClassifier**
```
Analiza y clasifica:
"quiero bajar de peso" → Intent: ask_weight_loss (90% confianza)
```

**Paso 4: FallbackClassifier**
```
Si confianza < 55% → Activa fallback
Ejemplo: "djfkdjfkdjf" → nlu_fallback → Gemini responde
```

---

### 2️⃣ **domain.yml** - El Conocimiento del Bot

Este archivo define:
- ✅ **Intents**: Lo que el usuario quiere hacer
- 📊 **Entities**: Datos específicos que se extraen
- 💾 **Slots**: Memoria del bot
- 💬 **Responses**: Respuestas predefinidas
- ⚙️ **Actions**: Acciones personalizadas

#### Ejemplo de Intent:
```yaml
intents:
  - greet              # Saludar
  - ask_diet_general   # Preguntar sobre dieta
  - express_sadness    # Expresar tristeza
```

#### Ejemplo de Entity:
```yaml
entities:
  - muscle_group  # Ej: "pecho", "espalda", "piernas"
```

#### Ejemplo de Slot:
```yaml
slots:
  user_name:
    type: text
    influence_conversation: true  # Afecta las respuestas
```

#### Ejemplo de Response:
```yaml
responses:
  utter_greet:
    - text: "¡Hola! Soy tu asistente de nutrición. ¿En qué te ayudo?"
```

---

### 3️⃣ **data/nlu.yml** - Ejemplos de Entrenamiento

Aquí es donde el bot **aprende** a reconocer lo que dice el usuario.

#### Analogía:
Es como enseñarle a un niño mostrándole **ejemplos**.

```yaml
- intent: greet
  examples: |
    - hola
    - buenos días
    - que tal
    - hey

- intent: ask_weight_loss
  examples: |
    - quiero bajar de peso
    - cómo puedo adelgazar
    - necesito perder grasa
    - ayúdame a perder peso
```

**¿Cómo funciona?**

Cuando el usuario escribe: **"hola amigo"**

1. El bot busca el intent más parecido
2. Encuentra que se parece a los ejemplos de `greet`
3. Clasifica como `greet` con 85% de confianza
4. Ejecuta la respuesta `utter_greet`

---

### 4️⃣ **data/stories.yml** - Conversaciones Ejemplo

Define **flujos de conversación completos**.

#### Analogía:
Es como un **guión de una obra de teatro**.

```yaml
- story: happy path
  steps:
    - intent: greet                    # Usuario: "hola"
    - action: utter_greet              # Bot: "¡Hola!"
    - intent: ask_capabilities         # Usuario: "qué puedes hacer"
    - action: utter_ask_capabilities   # Bot: "Puedo ayudarte con..."
    - intent: thanks                   # Usuario: "gracias"
    - action: utter_thanks             # Bot: "¡Con gusto!"
```

---

### 5️⃣ **data/rules.yml** - Reglas Fijas

Define comportamientos que **siempre** deben ocurrir.

```yaml
- rule: Despedida amable
  steps:
    - intent: goodbye
    - action: utter_goodbye

- rule: Fallback a Gemini
  steps:
    - intent: nlu_fallback
    - action: action_fallback_to_gemini
```

**Diferencia entre Stories y Rules:**
- **Stories**: Ejemplos de conversaciones (puede variar)
- **Rules**: Reglas estrictas (siempre igual)

---

### 6️⃣ **actions/actions.py** - Código Personalizado

Aquí es donde el bot hace cosas **complejas** usando Python.

#### Ejemplo: Calcular IMC

```python
class ActionCalculateBmi(Action):
    def name(self) -> Text: 
        return "action_calculate_bmi"

    def run(self, dispatcher, tracker, domain):
        # Obtener datos del usuario
        weight = float(tracker.get_slot("weight_kg"))
        height = float(tracker.get_slot("height_m"))
        
        # Calcular
        bmi = weight / (height * height)
        
        # Responder
        dispatcher.utter_message(text=f"Tu IMC es {bmi}")
        
        return []
```

**¿Qué hace?**
1. Obtiene peso y altura del usuario
2. Calcula el IMC
3. Envía el resultado al usuario

---

## 🔄 Flujo Completo de una Conversación

Veamos un ejemplo **paso a paso**:

### Escenario: Usuario quiere bajar de peso

```
👤 Usuario: "hola"
```

**1. NLU (Natural Language Understanding)**
```
Input: "hola"
↓
WhitespaceTokenizer → ["hola"]
↓
DIETClassifier → Intent: greet (95% confianza)
```

**2. Dialogue Management**
```
Intent: greet
↓
Busca en rules.yml
↓
Encuentra: rule "Saludo por defecto"
↓
Ejecuta: utter_greet
```

**3. Response**
```
🤖 Bot: "¡Hola! Soy tu asistente de nutrición. ¿En qué te ayudo?"
```

---

```
👤 Usuario: "quiero bajar de peso"
```

**1. NLU**
```
Input: "quiero bajar de peso"
↓
DIETClassifier → Intent: ask_weight_loss (88% confianza)
```

**2. Dialogue Management**
```
Intent: ask_weight_loss
↓
Busca en domain.yml
↓
Ejecuta: utter_ask_weight_loss
```

**3. Response**
```
🤖 Bot: "Déficit calórico moderado + fuerza + cardio + sueño. 
        ¿Quieres un menú base y recomendaciones?"
```

---

## 🌟 Integración con Gemini (IA Avanzada)

### ¿Qué es Gemini?
Es un **modelo de IA de Google** que puede responder preguntas complejas.

### ¿Cuándo se usa?

**Caso 1: Fallback (No entiende)**
```
👤 Usuario: "cuéntame sobre la guerra de las galaxias"
↓
DIETClassifier → Confianza: 30% (bajo)
↓
FallbackClassifier → nlu_fallback
↓
action_fallback_to_gemini
↓
Gemini responde con contexto de nutrición/bienestar
```

**Caso 2: Pregunta directa compleja**
```
👤 Usuario: pregunta directa con /ask_gemini
↓
action_call_gemini_chat
↓
Gemini responde directamente
```

### Código de Integración:

```python
class ActionFallbackToGemini(Action):
    async def run(self, dispatcher, tracker, domain):
        # Obtener mensaje del usuario
        user_message = tracker.latest_message.get("text")
        
        # Crear prompt con contexto
        prompt = f"{SYSTEM_PERSONA}\n\nUsuario: {user_message}"
        
        # Llamar a Gemini
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = await model.generate_content_async(prompt)
        
        # Enviar respuesta
        dispatcher.utter_message(text=response.text)
        
        return []
```

**SYSTEM_PERSONA** define el comportamiento:
```python
SYSTEM_PERSONA = """
Eres un asistente experto en NUTRICIÓN, CAMBIOS FÍSICOS, 
APOYO EMOCIONAL, RUTINAS DE EJERCICIO.
Responde SOLO sobre estos temas.
Evita dar diagnósticos médicos.
"""
```

---

## 🔒 Protección contra Consultas Médicas

El bot **NO** puede dar diagnósticos médicos (ética y seguridad).

### Flujo de Protección:

```
👤 Usuario: "tengo fiebre y dolor de cabeza"
↓
DIETClassifier → Intent: ask_medical_diagnosis
↓
action_handle_medical_query (bloquea)
↓
🤖 Bot: "No puedo dar diagnósticos. ¿Necesitas centros de salud cercanos?"
```

### Código de Bloqueo:

```python
class ActionHandleMedicalQuery(Action):
    def run(self, dispatcher, tracker, domain):
        # 1. Mensaje de negativa ética
        dispatcher.utter_message(
            text="🚨 No estoy autorizado para dar diagnósticos médicos."
        )
        
        # 2. Redirección a ayuda
        dispatcher.utter_message(
            text="¿Necesitas centros de salud cercanos?",
            buttons=[
                {"title": "Sí, por favor", "payload": "/affirm"},
                {"title": "No, gracias", "payload": "/deny"}
            ]
        )
        
        return [SlotSet("asked_for_health_center", True)]
```

---

# 🧠 PARTE 2: MODELOS DE CLASIFICACIÓN ML

## Visión General

NuPsi tiene **3 sistemas de Machine Learning**:

1. **Clasificación Emocional** (TensorFlow.js)
2. **Predicción de Bienestar** (TensorFlow.js)
3. **Análisis Integral** (Heurística + ML)

---

## 1️⃣ Clasificación Emocional

### ¿Qué hace?
Predice el **estado emocional** del usuario basado en sus datos diarios.

### Entrada (10 características):
1. Ratio emociones positivas (0-1)
2. Ratio emociones negativas (0-1)
3. Estado de ánimo (0-1)
4. Nivel de estrés (0-1)
5. Calidad de sueño (0-1)
6. Horas de sueño (0-1)
7. Hidratación (0-1)
8. Actividad física (0 o 1)
9. Calidad alimentación (0-1)
10. Número de comidas (0-1)

### Salida (4 categorías):
- **Positivo**: Estado emocional saludable
- **Neutral**: Estado estable
- **Negativo**: Necesita atención
- **Crítico**: Requiere apoyo urgente

### Arquitectura de la Red Neuronal:

```
Input (10 neuronas)
    ↓
Hidden Layer 1 (16 neuronas + ReLU + Dropout 20%)
    ↓
Hidden Layer 2 (8 neuronas + ReLU)
    ↓
Output (4 neuronas + Softmax)
    ↓
[Positivo, Neutral, Negativo, Crítico]
```

### Ejemplo de Predicción:

```typescript
// Datos del usuario
const datos = {
  emociones: ['feliz', 'motivado'],
  estadoAnimo: 'bueno',
  nivelEstres: 4,
  horasSueno: 7,
  vasosAgua: 6,
  actividadFisica: true
}

// Predicción
const resultado = await tensorflowML.predictEmotionalState(datos);

// Resultado:
{
  categoria: 'positivo',
  probabilidades: {
    positivo: 0.85,  // 85% de confianza
    neutral: 0.10,
    negativo: 0.04,
    critico: 0.01
  },
  confianza: 0.85
}
```

---

## 2️⃣ Predicción de Score de Bienestar

### ¿Qué hace?
Calcula un **score de 0 a 100** que representa el bienestar general.

### Arquitectura de la Red Neuronal:

```
Input (10 neuronas)
    ↓
Hidden Layer 1 (32 neuronas + ReLU + Dropout 30%)
    ↓
Hidden Layer 2 (16 neuronas + ReLU + Dropout 20%)
    ↓
Hidden Layer 3 (8 neuronas + ReLU)
    ↓
Output (1 neurona + Sigmoid)
    ↓
Score (0-100)
```

### Ejemplo:

```typescript
const prediccion = await tensorflowML.predictWellnessScore(datos);

// Resultado:
{
  scorePredicho: 78,
  confianza: 0.85,
  factoresImportantes: [
    { factor: 'Estado Emocional', impacto: 0.92 },
    { factor: 'Calidad de Sueño', impacto: 0.85 },
    { factor: 'Hidratación', impacto: 0.75 }
  ]
}
```

---

## 3️⃣ Análisis de Bienestar Integral

### ¿Qué hace?
Analiza **5 dimensiones** del bienestar:

1. 💭 **Emocional**: Estado anímico y emociones
2. 💪 **Física**: Actividad física + IMC
3. 🎯 **Hábitos**: Hidratación + sueño
4. 🥗 **Nutrición**: Calidad y frecuencia de comidas
5. 🤝 **Social**: Basado en estado emocional

### Clasificación Final:

```typescript
// Cálculo ponderado
scoreTotal = (
  emocional × 0.30 +
  fisica × 0.25 +
  habitos × 0.20 +
  nutricion × 0.15 +
  social × 0.10
)

// Niveles:
Óptimo:  score >= 80
Bueno:   65 <= score < 80
Regular: 50 <= score < 65
Bajo:    35 <= score < 50
Crítico: score < 35
```

### Ejemplo Visual:

```
Usuario: María
━━━━━━━━━━━━━━━━━━━━━━━━━━
Dimensiones:
💭 Emocional:  ████████░░ 82/100
💪 Física:     ██████░░░░ 65/100
🎯 Hábitos:    ███████░░░ 70/100
🥗 Nutrición:  ████████░░ 78/100
🤝 Social:     ███████░░░ 75/100
━━━━━━━━━━━━━━━━━━━━━━━━━━
Score Total: 74/100
Nivel: BUENO 👍
Tendencia: ↗️ Mejorando
```

---

## 🔬 ¿Cómo Funciona el Machine Learning?

### Analogía Simple:

Imagina que quieres enseñarle a un niño a identificar frutas:

**Método Tradicional (Heurística):**
```
Le dices reglas:
- Si es redonda y roja → Manzana
- Si es alargada y amarilla → Plátano
```

**Machine Learning:**
```
Le muestras 100 ejemplos:
- Foto 1: Manzana (etiqueta: manzana)
- Foto 2: Plátano (etiqueta: plátano)
- Foto 3: Manzana (etiqueta: manzana)
...

El niño aprende por sí mismo los patrones
```

### Aplicado a NuPsi:

**Datos de Entrenamiento:**
```javascript
// Ejemplo 1: Usuario con buen bienestar
{
  input: [0.8, 0.1, 0.9, 0.3, 0.8, 0.9, 0.8, 1, 0.9, 0.8],
  output: [1, 0, 0, 0]  // Positivo
}

// Ejemplo 2: Usuario con mal bienestar
{
  input: [0.2, 0.9, 0.3, 0.8, 0.4, 0.5, 0.3, 0, 0.4, 0.4],
  output: [0, 0, 0, 1]  // Crítico
}
```

**Proceso de Entrenamiento:**
```
Época 1:  Precisión: 40%
Época 10: Precisión: 65%
Época 30: Precisión: 87%
Época 50: Precisión: 95% ✅
```

**Predicción:**
```javascript
// Nuevos datos de usuario
const nuevoDato = {
  emociones: ['triste', 'ansioso'],
  estadoAnimo: 'malo',
  nivelEstres: 8,
  horasSueno: 4,
  vasosAgua: 2,
  actividadFisica: false
}

// El modelo predice:
{
  categoria: 'negativo',
  confianza: 0.89
}
```

---

## 📊 Flujo Completo del Sistema ML

### Paso 1: Usuario Completa Formulario Diario

```
Formulario ML (/ml-daily-form)
━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Paso 1/5: Estado Emocional
¿Cómo te sientes hoy?
☑️ Feliz  ☑️ Motivado  ☐ Triste

Estado de ánimo: ⭐⭐⭐⭐⭐
Nivel de estrés: ⭐⭐⭐⭐⭐
━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Paso 2: Datos se Guardan en Firebase

```javascript
// Estructura en Firestore
usuarios/{userId}/dailyMLInputs/{docId}
{
  fecha: "2025-11-24",
  emociones: ['feliz', 'motivado'],
  estadoAnimo: 'bueno',
  nivelEstres: 4,
  horasSueno: 7,
  calidadSueno: 8,
  vasosAgua: 6,
  actividadFisica: true,
  tipoActividad: 'correr',
  duracionActividad: 30,
  comidas: 4,
  calidadAlimentacion: 8,
  peso: 70,
  estatura: 1.75,
  imc: 22.9
}
```

### Paso 3: Modelo ML Analiza los Datos

```typescript
// El servicio procesa automáticamente
const resultado = await mlService.generateAuraInsight(userId);

// Internamente:
1. Obtiene últimos 7 días de datos
2. Normaliza las características (0-1)
3. Ejecuta predicción con TensorFlow.js
4. Genera recomendaciones
5. Guarda en Firebase
```

### Paso 4: Usuario Ve los Insights

```
Insights IA Aura (/aura-insights)
━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Clasificación Emocional
   Categoría: POSITIVO
   Confianza: 85%
   Emoción dominante: Felicidad
   Tendencia: ↗️ Mejorando

📊 Score General: 78/100
━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 Patrones Detectados
   • Hidratación baja (3 días)
   • Sueño insuficiente (2 días)

💡 Recomendaciones
   • Aumenta tu ingesta de agua
   • Intenta dormir 7-8 horas
━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔧 Servicios TypeScript

### ml-classification.service.ts

Este servicio **coordina** todo el análisis ML.

```typescript
export class MLClassificationService {
  
  // Guardar datos diarios
  async saveDailyMLInput(input: DailyMLInput) {
    // 1. Guardar en Firebase
    await this.firestore.collection(`usuarios/${userId}/dailyMLInputs`)
      .add(input);
    
    // 2. Generar insights automáticamente
    await this.generateAuraInsight(userId);
    await this.generateBienestarIntegral(userId);
  }
  
  // Generar insight emocional
  private async generateAuraInsight(userId: string) {
    // 1. Obtener datos históricos
    const datos = await this.getDailyMLInputs(userId, 7);
    
    // 2. Clasificar estado emocional (TensorFlow o heurística)
    const clasificacion = await this.clasificarEstadoEmocional(datos);
    
    // 3. Detectar patrones
    const patrones = this.detectarPatrones(datos);
    
    // 4. Generar recomendaciones
    const recomendaciones = this.generarRecomendaciones(clasificacion, patrones);
    
    // 5. Guardar en Firebase
    await this.firestore.collection(`usuarios/${userId}/auraInsights`)
      .add({
        fecha: new Date(),
        clasificacionEmocional: clasificacion,
        patronesDetectados: patrones,
        recomendaciones: recomendaciones
      });
  }
}
```

### tensorflow-ml.service.ts

Este servicio maneja las **redes neuronales**.

```typescript
export class TensorflowMLService {
  
  // Entrenar modelo emocional
  async trainEmotionalModel(datos: DailyMLInput[]) {
    // 1. Preparar datos
    const X = datos.map(d => this.extractFeatures(d));
    const y = datos.map(d => this.labelEmotionalState(d));
    
    // 2. Convertir a tensores
    const xs = tf.tensor2d(X);
    const ys = tf.tensor2d(y);
    
    // 3. Crear modelo
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ units: 16, activation: 'relu', inputShape: [10] }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 8, activation: 'relu' }),
        tf.layers.dense({ units: 4, activation: 'softmax' })
      ]
    });
    
    // 4. Compilar
    model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
    
    // 5. Entrenar
    await model.fit(xs, ys, {
      epochs: 50,
      batchSize: 8,
      validationSplit: 0.2
    });
    
    // 6. Guardar modelo
    await model.save('indexeddb://nupsi-emotional-model');
  }
  
  // Predecir estado emocional
  async predictEmotionalState(dato: DailyMLInput) {
    // 1. Cargar modelo
    const model = await tf.loadLayersModel('indexeddb://nupsi-emotional-model');
    
    // 2. Preparar dato
    const features = this.extractFeatures(dato);
    const input = tf.tensor2d([features]);
    
    // 3. Predecir
    const prediction = model.predict(input) as tf.Tensor;
    const probabilities = await prediction.data();
    
    // 4. Interpretar resultado
    const categorias = ['positivo', 'neutral', 'negativo', 'critico'];
    const maxIndex = probabilities.indexOf(Math.max(...probabilities));
    
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
}
```

---

## 🎨 Interfaz de Usuario (Frontend)

### Páginas Principales:

1. **/ml-daily-form** - Formulario diario
2. **/aura-insights** - Análisis emocional
3. **/bienestar-integral** - Análisis completo

### Ejemplo de Componente:

```typescript
// aura-insights.page.ts
export class AuraInsightsPage implements OnInit {
  insight: AuraInsight | null = null;
  loading = true;

  async ngOnInit() {
    await this.loadInsight();
  }

  async loadInsight() {
    try {
      // Obtener último insight
      this.insight = await this.mlService.getLatestAuraInsight(this.userId);
      
      // Si no hay datos, redirigir al formulario
      if (!this.insight) {
        this.router.navigate(['/ml-daily-form']);
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.loading = false;
    }
  }
}
```

---

## 🔐 Seguridad y Privacidad

### Reglas de Firebase:

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /usuarios/{userId} {
      // Solo el usuario puede acceder a sus datos
      allow read, write: if request.auth.uid == userId;
      
      match /dailyMLInputs/{docId} {
        allow read, write: if request.auth.uid == userId;
      }
      
      match /auraInsights/{docId} {
        allow read, write: if request.auth.uid == userId;
      }
    }
  }
}
```

### Privacidad del ML:

- ✅ Modelos entrenados **localmente** en el dispositivo
- ✅ Datos guardados en **IndexedDB del navegador**
- ✅ No se envía información a servidores externos
- ✅ Cada usuario tiene su **modelo personalizado**

---

## 🔄 Flujo de Datos Completo

```
📱 Usuario interactúa con la App
         ↓
🤖 Puede chatear con el Bot (Rasa)
   ├── Pregunta simple → Respuesta predefinida
   ├── Pregunta compleja → Gemini responde
   └── Pregunta médica → Bloqueo ético
         ↓
📝 Completa formulario diario
         ↓
🔥 Datos se guardan en Firebase
         ↓
🧠 TensorFlow.js analiza los datos
   ├── Clasifica estado emocional
   ├── Predice score de bienestar
   └── Detecta patrones
         ↓
💡 Genera insights y recomendaciones
         ↓
📊 Usuario ve resultados en la app
         ↓
📈 El modelo aprende y mejora con más datos
```

---

## 📚 Resumen Final

### Tecnologías Clave:

1. **Frontend**: Ionic + Angular + TypeScript
2. **Chatbot**: Rasa + Python + Google Gemini
3. **ML**: TensorFlow.js + Redes Neuronales
4. **Base de Datos**: Firebase Firestore
5. **Móvil**: Capacitor (Android/iOS)

### Conceptos Principales:

- **NLU**: Entender lenguaje natural
- **Intent**: Intención del usuario
- **Entity**: Datos específicos
- **Slot**: Memoria del bot
- **Action**: Código personalizado
- **Red Neuronal**: Modelo de ML que aprende
- **Feature**: Característica de entrada
- **Predicción**: Salida del modelo

### Flujos Principales:

1. **Conversación con Bot**:
   Usuario → NLU → Intent → Action → Respuesta

2. **Análisis ML**:
   Formulario → Firebase → TensorFlow → Insight → Usuario

3. **Aprendizaje**:
   Más datos → Re-entrenamiento → Mejor precisión

---

## 🎯 Conclusión

**NuPsi** es un sistema **complejo pero bien organizado** que combina:

- 🤖 **Chatbot conversacional** para guiar al usuario
- 🧠 **Machine Learning** para análisis personalizado
- 📱 **App móvil** intuitiva y bonita
- 🔐 **Seguridad** y privacidad de datos

Todo está diseñado para **ayudar a las personas** a mejorar su bienestar de manera **científica y personalizada**.

---

**¿Tienes preguntas específicas sobre alguna parte?**
