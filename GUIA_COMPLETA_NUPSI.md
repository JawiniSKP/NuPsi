# 📚 GUÍA COMPLETA DEL PROYECTO NUPSI
## Análisis Recursivo Completo - De Principiante a Experto

---

## 📖 TABLA DE CONTENIDOS

1. [¿Qué es NuPsi? - Explicación para niños](#1-qué-es-nupsi---explicación-para-niños)
2. [¿Cómo funciona NuPsi? - Nivel Básico](#2-cómo-funciona-nupsi---nivel-básico)
3. [Arquitectura del Proyecto - Nivel Intermedio](#3-arquitectura-del-proyecto---nivel-intermedio)
4. [Componentes Técnicos - Nivel Avanzado](#4-componentes-técnicos---nivel-avanzado)
5. [Flujo de Datos Completo](#5-flujo-de-datos-completo)
6. [Tecnologías Utilizadas](#6-tecnologías-utilizadas)

---

## 1. ¿Qué es NuPsi? - Explicación para niños

### 🎯 La Idea Simple

Imagina que tienes un **amigo muy inteligente** que:
- Siempre te escucha cuando hablas
- Te ayuda a cuidar tu salud
- Te da consejos sobre qué comer y cómo ejercitarte
- Entiende cómo te sientes emocionalmente
- Aprende de ti cada día

**NuPsi es ese amigo, pero en tu teléfono móvil** 📱

### 🧩 Las Piezas del Rompecabezas

NuPsi está hecho de 3 piezas principales:

1. **La Pantalla (Frontend)** 📺
   - Es lo que ves y tocas
   - Como la pantalla de tu juego favorito
   - Hecha con Ionic y Angular

2. **El Cerebro Conversacional (Rasa Bot)** 🤖
   - Es quien entiende lo que dices
   - Como cuando hablas con Alexa o Siri
   - Puede responder preguntas sobre salud

3. **El Cerebro Inteligente (Modelos ML)** 🧠
   - Aprende de tus hábitos
   - Como un profesor que te conoce mejor cada día
   - Te da consejos personalizados

### 🔄 ¿Cómo trabajan juntas?

```
TÚ → Escribes "¿Qué debo comer hoy?"
     ↓
PANTALLA → Envía tu mensaje al cerebro
     ↓
RASA BOT → Lee tu mensaje y lo entiende
     ↓
GEMINI/ML → Piensa en la mejor respuesta
     ↓
RASA BOT → Prepara la respuesta
     ↓
PANTALLA → Te muestra "Te recomiendo frutas y proteínas..."
     ↓
TÚ ← Recibes la respuesta
```

---

## 2. ¿Cómo funciona NuPsi? - Nivel Básico

### 🏗️ La Estructura de Carpetas

```
NuPsi/
├── 📱 src/                    # La aplicación móvil (lo que ves)
│   ├── app/                   # El código de la app
│   │   ├── pages/             # Las pantallas (Login, Chat, Perfil)
│   │   ├── services/          # Los ayudantes (Chat, ML, Auth)
│   │   └── components/        # Piezas reutilizables (Menú, Botones)
│   └── assets/                # Imágenes, iconos, logos
│
├── 🤖 rasa-bot/               # El cerebro conversacional
│   ├── data/                  # Lo que el bot aprendió
│   │   ├── nlu.yml            # Ejemplos de frases
│   │   ├── rules.yml          # Reglas fijas
│   │   └── stories.yml        # Conversaciones completas
│   ├── actions/               # Acciones personalizadas
│   │   └── actions.py         # Código Python del bot
│   ├── config.yml             # Configuración del aprendizaje
│   ├── domain.yml             # Vocabulario del bot
│   └── models/                # El cerebro entrenado
│
├── 🧠 Modelos ML (en src/)
│   ├── ml-classification.service.ts    # Clasificador de emociones
│   └── tensorflow-ml.service.ts        # Predictor de bienestar
│
└── ⚙️ Configuración
    ├── package.json           # Dependencias de JavaScript
    ├── angular.json           # Configuración de Angular
    └── capacitor.config.ts    # Configuración móvil
```

### 🎭 Los Personajes Principales

#### 1. **El Frontend (Ionic/Angular)**
**Rol:** La cara bonita del proyecto
**Responsabilidades:**
- Mostrar las pantallas
- Capturar lo que escribes
- Mostrar las respuestas del bot
- Guardar datos en Firebase
- Ejecutar modelos de Machine Learning localmente

**Lenguaje:** TypeScript + HTML + CSS

#### 2. **El Bot Rasa**
**Rol:** El cerebro que entiende el lenguaje
**Responsabilidades:**
- Leer tus mensajes
- Entender qué quieres decir (clasificar intenciones)
- Decidir qué responder
- Llamar a Gemini cuando no sabe algo

**Lenguaje:** Python

#### 3. **Gemini (Google AI)**
**Rol:** El experto externo
**Responsabilidades:**
- Responder preguntas complejas
- Generar respuestas creativas
- Ayudar cuando Rasa no está seguro

**Tecnología:** API de Google

#### 4. **Modelos ML (TensorFlow.js)**
**Rol:** El analista personal
**Responsabilidades:**
- Analizar tus emociones
- Predecir tu nivel de bienestar
- Detectar patrones en tus hábitos
- Darte recomendaciones personalizadas

**Lenguaje:** TypeScript con TensorFlow.js

---

## 3. Arquitectura del Proyecto - Nivel Intermedio

### 🏛️ Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                     USUARIO (App Móvil)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND (Ionic/Angular/Capacitor)             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Pages   │  │ Services │  │Components│  │  Guards  │   │
│  │  (UI)    │  │(Lógica)  │  │(Reuso)   │  │(Seguridad)│  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────┬───────────────────────────────────┬────────────┘
             │                                   │
             │ HTTP/WebSocket                    │ Firebase SDK
             │                                   │
             ▼                                   ▼
┌────────────────────────┐         ┌────────────────────────┐
│   RASA BOT (Backend)   │         │  FIREBASE (BaaS)       │
│  ┌──────────────────┐  │         │  ┌──────────────────┐  │
│  │  NLU Pipeline    │  │         │  │  Authentication  │  │
│  │  (DIETClassifier)│  │         │  ├──────────────────┤  │
│  ├──────────────────┤  │         │  │  Firestore DB    │  │
│  │  Policies        │  │         │  ├──────────────────┤  │
│  │  (TEDPolicy)     │  │         │  │  Storage         │  │
│  ├──────────────────┤  │         │  └──────────────────┘  │
│  │  Actions         │  │         └────────────────────────┘
│  │  (Python)        │  │
│  └────────┬─────────┘  │
└───────────┼────────────┘
            │ API Call
            ▼
┌────────────────────────┐
│   GEMINI AI (Google)   │
│  ┌──────────────────┐  │
│  │ Generative Model │  │
│  │  (gemini-2.5)    │  │
│  └──────────────────┘  │
└────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│          TENSORFLOW.JS (Local en el navegador)             │
│  ┌──────────────────┐         ┌──────────────────┐        │
│  │ Modelo Emocional │         │ Modelo Bienestar │        │
│  │  (Clasificación) │         │   (Regresión)    │        │
│  └──────────────────┘         └──────────────────┘        │
│              ↓                          ↓                  │
│         IndexedDB (Persistencia Local)                     │
└────────────────────────────────────────────────────────────┘
```

### 🔄 Flujo de una Conversación

#### **Escenario 1: Pregunta Simple**

```
1. Usuario escribe: "Hola"
   ↓
2. Frontend (chat.service.ts):
   - Captura el mensaje
   - Añade al historial local
   - Envía HTTP POST a Rasa
   ↓
3. Rasa NLU:
   - Tokeniza: ["hola"]
   - Clasifica intent: "greet" (confianza: 0.99)
   - No extrae entidades
   ↓
4. Rasa Core (RulePolicy):
   - Busca regla para "greet"
   - Encuentra: greet → utter_greet
   - Decide acción
   ↓
5. Rasa responde:
   {
     "text": "¡Hola! Soy tu asistente...",
     "recipient_id": "user123"
   }
   ↓
6. Frontend:
   - Recibe respuesta
   - Muestra en el chat
   - Guarda en Firebase (opcional)
```

#### **Escenario 2: Pregunta Compleja (Fallback a Gemini)**

```
1. Usuario: "¿Cuál es la diferencia entre proteína whey e isolate?"
   ↓
2. Rasa NLU:
   - Clasifica varios intents posibles
   - Confianza máxima: 0.45 (< threshold 0.55)
   - Activa: nlu_fallback
   ↓
3. RulePolicy:
   - Regla: nlu_fallback → action_fallback_to_gemini
   ↓
4. action_fallback_to_gemini (Python):
   - Construye prompt con SYSTEM_PERSONA
   - Llama a Gemini API
   - Recibe respuesta detallada
   ↓
5. Gemini responde con explicación técnica
   ↓
6. Usuario recibe respuesta completa y precisa
```

#### **Escenario 3: Análisis ML**

```
1. Usuario completa formulario diario
   ↓
2. ml-classification.service.ts:
   - Guarda datos en Firestore
   - Obtiene últimos 30 días
   ↓
3. tensorflow-ml.service.ts:
   - Prepara features (10 características)
   - Normaliza datos [0-1]
   ↓
4. Si datos >= 10:
   - Entrena modelo emocional (50 epochs)
   - Guarda en IndexedDB
   ↓
5. Predicción:
   - Carga modelo entrenado
   - Predice categoría emocional
   - Calcula confianza
   ↓
6. Genera insights y recomendaciones
   ↓
7. Muestra en pantalla "Aura Insights"
```

### 🗂️ Base de Datos Firebase

```
firestore/
└── usuarios/
    └── {userId}/
        ├── profile/
        │   ├── nombre
        │   ├── email
        │   ├── objetivo
        │   └── restricciones
        │
        ├── dailyMLInputs/
        │   └── {docId}/
        │       ├── fecha: Timestamp
        │       ├── emociones: string[]
        │       ├── estadoAnimo: string
        │       ├── nivelEstres: number (1-10)
        │       ├── calidadSueno: number (1-10)
        │       ├── horasSueno: number
        │       ├── vasosAgua: number
        │       ├── actividadFisica: boolean
        │       ├── tipoActividad: string
        │       ├── duracionActividad: number
        │       ├── comidas: number
        │       ├── calidadAlimentacion: number (1-10)
        │       ├── peso?: number
        │       ├── estatura?: number
        │       ├── imc?: number
        │       └── notas?: string
        │
        ├── auraInsights/
        │   └── {docId}/
        │       ├── fecha: Timestamp
        │       ├── clasificacionEmocional:
        │       │   ├── categoria: string
        │       │   ├── confianza: number
        │       │   ├── emocionDominante: string
        │       │   └── tendencia: string
        │       ├── patronesDetectados: Array<{
        │       │       patron: string,
        │       │       frecuencia: number
        │       │   }>
        │       ├── recomendaciones: Array<{
        │       │       area: string,
        │       │       texto: string,
        │       │       prioridad: string
        │       │   }>
        │       └── scoreGeneral: number
        │
        └── bienestarIntegral/
            └── {docId}/
                ├── fecha: Timestamp
                ├── clasificacion:
                │   ├── nivel: string
                │   ├── confianza: number
                │   └── scoreTotal: number
                ├── dimensiones:
                │   ├── emocional: number (0-100)
                │   ├── fisica: number (0-100)
                │   ├── habitos: number (0-100)
                │   ├── nutricion: number (0-100)
                │   └── social: number (0-100)
                ├── tendenciaSemanal: string
                ├── tendenciaMensual: string
                ├── alertas: string[]
                └── logros: string[]
```

---

## 4. Componentes Técnicos - Nivel Avanzado

### 🔬 1. Frontend (Ionic/Angular)

#### **Stack Tecnológico**
- **Framework:** Angular 17+ (Standalone Components)
- **UI Framework:** Ionic 7+
- **Mobile Runtime:** Capacitor 5+
- **Language:** TypeScript 5+
- **State Management:** RxJS Observables
- **Forms:** Reactive Forms
- **Routing:** Angular Router con Guards

#### **Servicios Principales**

##### **AuthService** (`auth.service.ts`)
```typescript
// Maneja autenticación con Firebase
export class AuthService {
  - login(email, password): Promise<UserCredential>
  - register(email, password): Promise<UserCredential>
  - logout(): Promise<void>
  - getCurrentUser(): Observable<User | null>
  - updateProfile(data): Promise<void>
}
```

##### **ChatService** (`chat.service.ts`)
```typescript
// Comunicación con Rasa Bot
export class ChatService {
  - sendMessage(message: string): Observable<BotResponse>
  - getChatHistory(): Observable<Message[]>
  - saveChatToFirestore(messages): Promise<void>
  
  // Endpoint: http://localhost:5005/webhooks/rest/webhook
  private RASA_URL = environment.rasaUrl;
}
```

##### **MLClassificationService** (`ml-classification.service.ts`)
```typescript
// Orquestador de Machine Learning
export class MLClassificationService {
  // Datos diarios
  - saveDailyMLInput(input: DailyMLInput): Promise<void>
  - getDailyMLInputs(userId: string, dias: number): Observable<DailyMLInput[]>
  
  // Insights IA
  - getLatestAuraInsight(userId: string): Observable<AuraInsight>
  - generateAuraInsight(userId: string): Promise<void>
  - clasificarEstadoEmocional(datos): EmotionalClassification
  - detectarPatrones(datos): Pattern[]
  - generarRecomendaciones(clasificacion, patrones): Recommendation[]
  
  // Bienestar Integral
  - getLatestBienestarIntegral(userId): Observable<BienestarIntegral>
  - generateBienestarIntegral(userId): Promise<void>
  - calcularDimensiones(datos): Dimensions
  - clasificarBienestar(dimensiones): WellnessClassification
  
  // Delega a TensorFlow.js cuando hay suficientes datos
  private useTensorflowML = true;
}
```

##### **TensorflowMLService** (`tensorflow-ml.service.ts`)
```typescript
// Machine Learning Real con TensorFlow.js
export class TensorflowMLService {
  // Modelos
  private emotionalModel: tf.LayersModel | null = null;
  private wellnessModel: tf.LayersModel | null = null;
  
  // Clasificación Emocional (Red Neuronal Densa)
  - trainEmotionalModel(datos: DailyMLInput[]): Promise<void>
  - predictEmotionalState(dato: DailyMLInput): Promise<{
      categoria: string,
      probabilidades: {[key: string]: number},
      confianza: number
    }>
  
  // Predicción de Bienestar (Regresión)
  - trainWellnessModel(datos: DailyMLInput[]): Promise<void>
  - predictWellnessScore(dato: DailyMLInput): Promise<{
      scorePredicho: number,
      confianza: number,
      factoresImportantes: Factor[]
    }>
  
  // Persistencia
  - saveModel(modelName: 'emotional' | 'wellness'): Promise<void>
  - loadModel(modelName: 'emotional' | 'wellness'): Promise<void>
  
  // Utilidades
  - prepareFeatures(dato: DailyMLInput): number[]
  - normalizeData(features: number[]): number[]
  - disposeModels(): void
}
```

#### **Arquitectura del Modelo Emocional**

```typescript
// Input: 10 features
const model = tf.sequential({
  layers: [
    tf.layers.dense({
      inputShape: [10],
      units: 16,
      activation: 'relu',
      kernelInitializer: 'heNormal'
    }),
    tf.layers.dropout({ rate: 0.2 }),
    tf.layers.dense({
      units: 8,
      activation: 'relu'
    }),
    tf.layers.dense({
      units: 4,  // Positivo, Neutral, Negativo, Crítico
      activation: 'softmax'
    })
  ]
});

// Compilación
model.compile({
  optimizer: tf.train.adam(0.001),
  loss: 'categoricalCrossentropy',
  metrics: ['accuracy']
});

// Entrenamiento
await model.fit(X_train, y_train, {
  epochs: 50,
  batchSize: 8,
  validationSplit: 0.2,
  callbacks: {
    onEpochEnd: (epoch, logs) => {
      console.log(`Epoch ${epoch}: loss=${logs.loss}, acc=${logs.acc}`);
    }
  }
});

// Guardar en IndexedDB
await model.save('indexeddb://nupsi-emotional-model');
```

#### **Features Engineering**

```typescript
function prepareFeatures(dato: DailyMLInput): number[] {
  // 1. Ratio de emociones positivas
  const emocionesPositivas = ['feliz', 'motivado', 'tranquilo', 'energético', 'optimista'];
  const positivas = dato.emociones.filter(e => emocionesPositivas.includes(e)).length;
  const ratioPositivo = positivas / (dato.emociones.length || 1);
  
  // 2. Ratio de emociones negativas
  const emocionesNegativas = ['triste', 'ansioso', 'estresado', 'cansado', 'frustrado'];
  const negativas = dato.emociones.filter(e => emocionesNegativas.includes(e)).length;
  const ratioNegativo = negativas / (dato.emociones.length || 1);
  
  // 3. Estado de ánimo normalizado
  const estadoAnimoMap = {
    'excelente': 1.0,
    'bueno': 0.75,
    'regular': 0.5,
    'malo': 0.25,
    'muy-malo': 0.0
  };
  const estadoAnimo = estadoAnimoMap[dato.estadoAnimo] || 0.5;
  
  // 4. Nivel de estrés normalizado
  const nivelEstres = dato.nivelEstres / 10;
  
  // 5. Calidad de sueño
  const calidadSueno = dato.calidadSueno / 10;
  
  // 6. Horas de sueño normalizadas (8h óptimo)
  const horasSueno = Math.min(dato.horasSueno / 8, 1.0);
  
  // 7. Hidratación (8 vasos óptimo)
  const hidratacion = Math.min(dato.vasosAgua / 8, 1.0);
  
  // 8. Actividad física (binario)
  const actividadFisica = dato.actividadFisica ? 1 : 0;
  
  // 9. Calidad alimentación
  const calidadAlimentacion = dato.calidadAlimentacion / 10;
  
  // 10. Número de comidas normalizado (4 comidas óptimo)
  const comidas = Math.min(dato.comidas / 4, 1.0);
  
  return [
    ratioPositivo,
    ratioNegativo,
    estadoAnimo,
    nivelEstres,
    calidadSueno,
    horasSueno,
    hidratacion,
    actividadFisica,
    calidadAlimentacion,
    comidas
  ];
}
```

### 🤖 2. Rasa Bot (Backend Conversacional)

#### **Stack Tecnológico**
- **Framework:** Rasa 3.6+
- **Language:** Python 3.8+
- **NLU Model:** DIETClassifier
- **Policies:** RulePolicy, MemoizationPolicy, TEDPolicy
- **LLM Integration:** Google Gemini 2.5 Flash
- **Deployment:** Docker + Python virtual environment

#### **Pipeline de NLU (config.yml)**

```yaml
pipeline:
  # 1. Tokenización
  - name: WhitespaceTokenizer
    # Divide el texto en palabras por espacios
    # "hola mundo" → ["hola", "mundo"]
  
  # 2. Extracción de features con Regex
  - name: RegexFeaturizer
    # Detecta patrones como emails, URLs, números
  
  # 3. Features léxico-sintácticas
  - name: LexicalSyntacticFeaturizer
    # Extrae características gramaticales (POS tags)
  
  # 4. Vectorización de palabras completas
  - name: CountVectorsFeaturizer
    # Convierte palabras en vectores numéricos
    # Bag of Words
  
  # 5. Vectorización de caracteres (n-gramas)
  - name: CountVectorsFeaturizer
    analyzer: "char_wb"
    min_ngram: 1
    max_ngram: 4
    # Captura similitudes fonéticas
    # "proteína" → ["p", "pr", "pro", "prot", ...]
  
  # 6. CLASIFICADOR PRINCIPAL
  - name: DIETClassifier
    epochs: 100
    constrain_similarities: true
    # Dual Intent Entity Transformer
    # Clasifica intenciones y extrae entidades
    # Usa embeddings contextuales
  
  # 7. Mapeo de sinónimos
  - name: EntitySynonymMapper
    # "pecho" → "pectorales"
  
  # 8. FALLBACK AUTOMÁTICO
  - name: FallbackClassifier
    threshold: 0.55
    ambiguity_threshold: 0.05
    # Si confianza < 0.55 → nlu_fallback
```

#### **¿Cómo funciona DIETClassifier?**

```python
# DIET = Dual Intent Entity Transformer
# Es un modelo de deep learning que hace 2 cosas a la vez:
# 1. Clasificación de intenciones
# 2. Extracción de entidades

# Arquitectura simplificada:
Input: "Quiero ejercicios para pecho"
  ↓
[Embeddings] → Convierte palabras en vectores densos
  ↓
[Transformer Layers] → Captura contexto (atención)
  ↓
[Intent Classifier Head] → Predice intent: "ask_muscle_group" (0.95)
[Entity Extractor Head] → Extrae entidad: muscle_group="pecho"
  ↓
Output: {
  "intent": {"name": "ask_muscle_group", "confidence": 0.95},
  "entities": [{"entity": "muscle_group", "value": "pecho"}]
}
```

#### **Policies (config.yml)**

```yaml
policies:
  # 1. RulePolicy - Maneja reglas determinísticas
  - name: RulePolicy
    core_fallback_threshold: 0.4
    fallback_action_name: "action_fallback_to_gemini"
    # Si ninguna política tiene confianza > 0.4 → fallback
  
  # 2. MemoizationPolicy - Memoria exacta de historias
  - name: MemoizationPolicy
    # Si ve la misma secuencia de intents → misma acción
    # Útil para flujos determinísticos
  
  # 3. TEDPolicy - Transformer Embedding Dialogue
  - name: TEDPolicy
    max_history: 5  # Considera últimos 5 turnos
    epochs: 100
    constrain_similarities: true
    # Usa machine learning para predecir siguiente acción
    # Generaliza más allá de las historias exactas
```

#### **Domain (domain.yml) - Explicado**

```yaml
# INTENTS: Lo que el usuario puede querer
intents:
  - greet                    # Saludo
  - goodbye                  # Despedida
  - ask_diet_general         # Consulta sobre dieta
  - ask_specific_food        # Pregunta sobre un alimento
  - express_sadness          # Expresión emocional
  - nlu_fallback            # No entendió (baja confianza)
  - ask_gemini              # Pregunta directa a IA avanzada

# ENTITIES: Información específica a extraer
entities:
  - macronutrient   # Ej: "proteínas", "carbohidratos"
  - muscle_group    # Ej: "pecho", "piernas"
  - goal           # Ej: "perder grasa", "ganar músculo"
  - region         # Ej: "Santiago", "Valparaíso"

# SLOTS: Memoria del bot (variables de sesión)
slots:
  macronutrient:
    type: text
    influence_conversation: true
    mappings:
      - type: from_entity
        entity: macronutrient
  # Cuando se detecta entidad "macronutrient" → se guarda en slot

  user_region:
    type: text
    influence_conversation: true
    mappings:
      - type: from_entity
        entity: region
      - type: custom  # También puede ser seteado por acción

  latitude:
    type: float
    influence_conversation: false
    mappings:
      - type: custom  # Solo por acción (GPS)

  longitude:
    type: float
    influence_conversation: false
    mappings:
      - type: custom

# RESPONSES: Respuestas predefinidas
responses:
  utter_greet:
    - text: "¡Hola! Soy tu asistente de nutrición..."
  
  utter_ask_diet_general:
    - text: "Basea tu alimentación en verduras, frutas..."

# ACTIONS: Acciones personalizadas (Python)
actions:
  - action_answer_specific_food      # Responde sobre alimento
  - action_propose_meal_plan         # Genera plan de comidas
  - action_fallback_to_gemini        # Delega a Gemini
  - action_call_gemini_chat          # Chat directo con Gemini
  - action_search_nearby_professional # Busca profesionales

# FORMS: Formularios multi-paso
forms:
  nutrition_profile_form:
    required_slots:
      - user_goal
      - dietary_restrictions
      - activity_level
```

#### **Training Data (data/nlu.yml)**

```yaml
nlu:
  - intent: greet
    examples: |
      - hola
      - buenos días
      - buenas tardes
      - hey
      - holi
      # El modelo aprenderá variaciones

  - intent: ask_diet_general
    examples: |
      - qué es una dieta saludable
      - cómo comer sano
      - consejos de alimentación
      - qué debo comer
      - ayúdame con mi dieta
      # Con ~10-20 ejemplos, DIET generaliza bien

  - intent: ask_specific_food
    examples: |
      - cuántas calorías tiene el [pollo](macronutrient)
      - propiedades del [arroz](macronutrient)
      - beneficios de las [proteínas](macronutrient)
      # [valor](entidad) marca entidades para entrenamiento

  - intent: ask_muscle_group
    examples: |
      - ejercicios para [pecho](muscle_group)
      - rutina de [piernas](muscle_group)
      - cómo entrenar [espalda](muscle_group)
```

#### **Rules (data/rules.yml)**

```yaml
rules:
  # Regla 1: Pregunta directa a Gemini
  - rule: Pregunta directa a Gemini
    steps:
      - intent: ask_gemini
      - action: action_call_gemini_chat
    # Siempre que detecte ask_gemini → llama a Gemini

  # Regla 2: Fallback automático
  - rule: Baja confianza → Fallback con Gemini
    steps:
      - intent: nlu_fallback
      - action: action_fallback_to_gemini
    # Si confianza < 0.55 → delega a Gemini

  # Regla 3: Bloqueo médico
  - rule: Bloqueo Médico y Pregunta de Centros
    steps:
      - intent: ask_medical_diagnosis
      - action: action_handle_medical_query
      - action: action_listen
    # Ética: No da diagnósticos
```

#### **Stories (data/stories.yml)**

```yaml
stories:
  # Historia 1: Flujo feliz
  - story: happy path
    steps:
      - intent: greet
      - action: utter_greet
      - intent: ask_capabilities
      - action: utter_ask_capabilities
      - intent: thanks
      - action: utter_thanks
      - intent: goodbye
      - action: utter_goodbye

  # Historia 2: Consulta con entidad
  - story: consulta alimento con macronutriente
    steps:
      - intent: ask_specific_food
        entities:
          - macronutrient: proteínas
      - slot_was_set:
          - macronutrient: "proteínas"
      - action: action_answer_specific_food
    # TEDPolicy aprende este patrón
```

#### **Custom Actions (actions/actions.py)**

```python
# Acción: Fallback a Gemini
class ActionFallbackToGemini(Action):
    def name(self) -> Text:
        return "action_fallback_to_gemini"

    async def run(
        self, 
        dispatcher: CollectingDispatcher, 
        tracker: Tracker, 
        domain: Dict[Text, Any]
    ) -> List[EventType]:
        # 1. Obtener mensaje del usuario
        user_message = tracker.latest_message.get("text", "")
        
        # 2. Construir prompt con contexto
        prompt = f"{SYSTEM_PERSONA}\n\nUsuario: {user_message}"
        
        # 3. Llamar a Gemini
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = await model.generate_content_async(prompt)
        
        # 4. Enviar respuesta al usuario
        dispatcher.utter_message(text=response.text)
        
        return []  # No cambiar slots
```

```python
# Acción: Búsqueda de profesionales
class ActionSearchNearbyProfessional(Action):
    def name(self) -> Text:
        return "action_search_nearby_professional"

    async def run(
        self, 
        dispatcher: CollectingDispatcher, 
        tracker: Tracker, 
        domain: Dict[Text, Any]
    ) -> List[EventType]:
        # 1. Obtener ubicación de slots
        lat = tracker.get_slot("latitude")
        lon = tracker.get_slot("longitude")
        region = tracker.get_slot("user_region")
        
        # 2. Validar ubicación
        if not (lat and lon) and not region:
            dispatcher.utter_message(
                text="Para buscarte un profesional, necesito saber dónde estás. ¿Podrías decirme tu ciudad?"
            )
            return [
                SlotSet("asked_for_location", True),
                SlotSet("is_searching_professional", True)
            ]
        
        # 3. Construir contexto de búsqueda
        if lat and lon:
            location_context = f"cerca de ({lat}, {lon})"
        else:
            location_context = f"en {region}"
        
        # 4. Prompt para Gemini
        prompt = f"El usuario necesita un profesional de salud {location_context}. Da 3-4 sugerencias de búsqueda."
        
        # 5. Llamar a Gemini
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = await model.generate_content_async(prompt)
        
        # 6. Responder
        dispatcher.utter_message(text=response.text)
        
        # 7. Limpiar slots de control
        return [
            SlotSet("asked_for_location", None),
            SlotSet("is_searching_professional", None)
        ]
```

### 🧠 3. Integración Gemini

#### **¿Por qué Gemini?**

Rasa es **excelente** para:
- ✅ Diálogos estructurados
- ✅ Flujos predefinidos
- ✅ Extracción de entidades
- ✅ Clasificación rápida de intenciones

Rasa es **limitado** para:
- ❌ Preguntas abiertas
- ❌ Razonamiento complejo
- ❌ Creatividad
- ❌ Conocimiento general

**Gemini complementa a Rasa:**
- 🎯 Maneja lo inesperado
- 🎯 Genera respuestas creativas
- 🎯 Contextualiza mejor
- 🎯 Conocimiento actualizado

#### **Arquitectura Híbrida**

```
┌─────────────────────────────────────┐
│        Usuario: "Hola"              │
└──────────────┬──────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│   RASA NLU                           │
│   Confianza: 0.99 (intent: greet)   │
└──────────────┬───────────────────────┘
               │ ALTA CONFIANZA
               ▼
┌──────────────────────────────────────┐
│   RASA RESPONDE                      │
│   "¡Hola! Soy tu asistente..."       │
└──────────────────────────────────────┘

VS.

┌─────────────────────────────────────────────┐
│  Usuario: "¿Es mejor cardio o pesas para    │
│           quemar grasa visceral?"           │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│   RASA NLU                                   │
│   Confianza: 0.42 (< threshold 0.55)         │
│   Intent más probable: ask_exercise_general  │
└──────────────┬───────────────────────────────┘
               │ BAJA CONFIANZA
               ▼
┌──────────────────────────────────────────────┐
│   FALLBACK: nlu_fallback                     │
│   Activa: action_fallback_to_gemini          │
└──────────────┬───────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│   GEMINI GENERA RESPUESTA                    │
│   "Ambos son efectivos, pero estudios        │
│    muestran que el entrenamiento de fuerza   │
│    es más eficiente para grasa visceral..."  │
└──────────────────────────────────────────────┘
```

#### **Configuración de Gemini**

```python
# En actions.py
import google.generativeai as genai

# Configuración
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# Persona del sistema (contexto)
SYSTEM_PERSONA = (
    "Eres un asistente experto en NUTRICIÓN, CAMBIOS FÍSICOS, "
    "APOYO EMOCIONAL, RUTINAS DE EJERCICIO y BIENESTAR. "
    "Responde SOLO sobre estos temas. "
    "**BAJO NINGUNA CIRCUNSTANCIA DEBES PROPORCIONAR DIAGNÓSTICOS MÉDICOS.**"
    "Si el usuario pide algo fuera de este alcance, "
    "redirígelo al bienestar/nutrición/entrenamiento. "
    "Responde SIEMPRE en español, de manera empática y motivadora."
)

# Modelo
model = genai.GenerativeModel("gemini-2.5-flash")

# Llamada asíncrona
async def call_gemini(prompt: str):
    response = await model.generate_content_async(
        f"{SYSTEM_PERSONA}\n\n{prompt}"
    )
    return response.text
```

---

## 5. Flujo de Datos Completo

### 📊 Flujo End-to-End: Usuario → Respuesta

```
[1] USUARIO ABRE LA APP
    ↓
[2] Angular carga AuthGuard
    ↓
[3] AuthService verifica Firebase Auth
    ↓
    ├─→ NO autenticado → Redirige a /login
    └─→ Autenticado → Acceso a /home
    
[4] USUARIO VA AL CHAT (/chat)
    ↓
[5] ChatPage se inicializa
    ↓
[6] chat.service.ts carga historial de Firestore
    ↓
[7] Usuario escribe: "Quiero perder grasa"
    ↓
[8] ChatPage captura el mensaje
    ↓
[9] chat.service.ts:
    - Añade mensaje al array local
    - Muestra en UI inmediatamente
    - Envía HTTP POST a Rasa
    
[10] RASA RECIBE EL MENSAJE
     ↓
[11] NLU Pipeline:
     - WhitespaceTokenizer: ["quiero", "perder", "grasa"]
     - CountVectorsFeaturizer: [0.2, 0.0, 0.8, ...]
     - DIETClassifier: Clasifica intent
       → Intent: "ask_weight_loss" (confianza: 0.87)
       → Entidad: goal="perder grasa"
     ↓
[12] Rasa Core (Policies):
     - RulePolicy: No encuentra regla específica
     - TEDPolicy: Busca historia similar
       → Encuentra: ask_weight_loss → utter_ask_weight_loss
     - Selecciona acción: utter_ask_weight_loss
     ↓
[13] Rasa ejecuta acción:
     - Es una respuesta simple (utter)
     - Toma texto de domain.yml
     - Responde: "Déficit calórico moderado + fuerza + cardio..."
     ↓
[14] Rasa envía JSON:
     {
       "recipient_id": "user123",
       "text": "Déficit calórico moderado + fuerza + cardio..."
     }
     ↓
[15] chat.service.ts recibe respuesta:
     - Añade al historial local
     - Muestra en UI
     - Guarda en Firestore (opcional)
     ↓
[16] USUARIO VE LA RESPUESTA

===== ESCENARIO 2: PREGUNTA COMPLEJA =====

[7b] Usuario escribe: "¿La cetosis es mejor que el déficit calórico normal?"
     ↓
[11b] DIETClassifier:
      - Intent más probable: ask_diet_general (0.48)
      - Confianza < 0.55 threshold
      → FallbackClassifier activa: nlu_fallback
     ↓
[12b] RulePolicy:
      - Encuentra regla: nlu_fallback → action_fallback_to_gemini
     ↓
[13b] action_fallback_to_gemini (Python):
      - Construye prompt con SYSTEM_PERSONA
      - Llama a Gemini API (async)
      - Espera respuesta (timeout: 30s)
     ↓
[14b] Gemini responde:
      "La cetosis y el déficit calórico son enfoques diferentes.
       El déficit calórico es el principio fundamental...
       La cetosis es un estado metabólico...
       Para la mayoría de personas, el déficit calórico sostenible
       con macronutrientes balanceados es más efectivo..."
     ↓
[15b] Usuario recibe respuesta detallada y contextualizada

===== ESCENARIO 3: FORMULARIO ML =====

[4c] Usuario va a /ml-daily-form
     ↓
[5c] MlDailyFormPage carga:
     - Reactive Form con validaciones
     - 5 pasos (stepper)
     ↓
[6c] Usuario completa formulario:
     Paso 1: Emociones → ["feliz", "motivado"]
     Paso 2: Estado anímico → "bueno"
     Paso 3: Sueño → 7 horas, calidad 8/10
     Paso 4: Hábitos → 6 vasos agua, sí ejercicio
     Paso 5: Alimentación → 4 comidas, calidad 7/10
     ↓
[7c] Usuario presiona "Guardar"
     ↓
[8c] ml-classification.service.ts:
     - saveDailyMLInput(formData)
     - Guarda en Firestore: usuarios/{uid}/dailyMLInputs
     - Timestamp actual
     ↓
[9c] Automático: generateAuraInsight(userId)
     ↓
[10c] Obtiene últimos 7 días de datos
     ↓
[11c] ¿Hay >= 10 registros?
     ├─→ SÍ: Usa TensorFlow.js
     │   - tensorflow-ml.service.ts
     │   - Prepara features [10 valores]
     │   - Normaliza [0-1]
     │   - Carga modelo de IndexedDB
     │   - Predice: model.predict(features)
     │   - Resultado: {categoria: "positivo", confianza: 0.89}
     │
     └─→ NO: Usa heurística (algoritmo basado en reglas)
         - Calcula ratio de emociones
         - Clasifica según thresholds
     ↓
[12c] detectarPatrones(datos):
     - Analiza tendencias
     - Detecta: "Hidratación baja" (3 de 7 días < 6 vasos)
     ↓
[13c] generarRecomendaciones(clasificacion, patrones):
     - Basado en categoría y patrones
     - Ejemplo: "Aumenta consumo de agua a 8 vasos/día"
     ↓
[14c] Guarda insight en Firestore:
     usuarios/{uid}/auraInsights
     ↓
[15c] Usuario ve "Datos guardados ✓"
     ↓
[16c] Usuario va a /aura-insights
     ↓
[17c] AuraInsightsPage:
     - getLatestAuraInsight(userId)
     - Observa cambios en Firestore (real-time)
     - Muestra tarjetas:
       * Clasificación: "Positivo" (confianza 89%)
       * Emoción dominante: "Feliz"
       * Tendencia: "Mejorando"
       * Score: 78/100
       * Patrones: ["Hidratación baja"]
       * Recomendaciones: [...]
```

### 🔄 Ciclo de Aprendizaje del Modelo ML

```
DÍA 1-9:
  - Usuario registra datos diarios
  - Se guardan en Firestore
  - Insights generados por HEURÍSTICA (reglas)
  - Confianza: Media
  
DÍA 10:
  - Se alcanzan 10 registros
  - tensorflow-ml.service.ts detecta umbral
  - ENTRENA MODELO EMOCIONAL:
    * Prepara dataset (10 ejemplos)
    * Crea labels (4 categorías)
    * Entrena red neuronal (50 epochs)
    * Valida (20% split)
    * Guarda en IndexedDB
  - Insights ahora generados por ML REAL
  - Confianza: Alta (basada en modelo)
  
DÍA 20:
  - Se alcanzan 20 registros
  - ENTRENA MODELO DE BIENESTAR:
    * Prepara dataset (20 ejemplos)
    * Regresión (score 0-100)
    * Entrena (100 epochs)
    * Guarda en IndexedDB
  - Predicciones de bienestar ahora por ML
  
DÍA 30+:
  - RE-ENTRENAMIENTO AUTOMÁTICO cada 7 días
  - Modelos mejoran con más datos
  - Predicciones cada vez más precisas
  - Personalización total al usuario
```

---

## 6. Tecnologías Utilizadas

### 📱 Frontend Stack

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **Angular** | 17+ | Framework web progresivo |
| **Ionic** | 7+ | UI components móviles |
| **Capacitor** | 5+ | Runtime nativo iOS/Android |
| **TypeScript** | 5+ | Lenguaje con tipado fuerte |
| **RxJS** | 7+ | Programación reactiva |
| **Firebase SDK** | 10+ | Authentication + Firestore |
| **TensorFlow.js** | 4+ | Machine Learning en navegador |

### 🤖 Backend Stack (Rasa)

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **Rasa** | 3.6+ | Framework de diálogo |
| **Python** | 3.8-3.10 | Lenguaje base |
| **spaCy** | 3+ | NLP utilities |
| **scikit-learn** | 1+ | ML tradicional |
| **TensorFlow** | 2+ | Deep learning (DIET) |

### 🧠 AI/ML Stack

| Tecnología | Propósito |
|-----------|-----------|
| **Google Gemini 2.5** | LLM para fallback y chat avanzado |
| **DIETClassifier** | Intent classification + NER |
| **TensorFlow.js** | Modelos personalizados locales |
| **CountVectorizer** | Feature extraction (NLU) |

### 🗄️ Database & Auth

| Servicio | Propósito |
|---------|-----------|
| **Firebase Auth** | Autenticación de usuarios |
| **Firestore** | Base de datos NoSQL |
| **IndexedDB** | Almacenamiento local de modelos ML |

### 🛠️ DevOps & Tools

| Herramienta | Propósito |
|------------|-----------|
| **Docker** | Containerización |
| **Git** | Control de versiones |
| **npm** | Gestión de paquetes (Node) |
| **pip** | Gestión de paquetes (Python) |
| **Rasa CLI** | Train, test, shell |

---

## 🎓 RESUMEN PARA APRENDIZAJE

### Para Principiantes:
1. NuPsi es una app móvil que te ayuda con salud y bienestar
2. Tiene un chat inteligente que entiende lo que escribes
3. Aprende de ti y te da consejos personalizados
4. Funciona en tu celular (Android/iOS)

### Para Intermedios:
1. Frontend: Ionic/Angular con TypeScript
2. Backend: Rasa Bot con Python
3. IA: Gemini para preguntas complejas
4. ML: TensorFlow.js para análisis personalizado
5. Database: Firebase Firestore

### Para Avanzados:
1. **Arquitectura**: Microservicios híbridos (SPA + Chatbot + LLM)
2. **NLU**: DIETClassifier con embeddings contextuales
3. **Políticas**: Ensemble (Rule + Memorization + TED)
4. **ML Local**: Redes neuronales densas entrenadas en navegador
5. **Fallback**: Sistema híbrido reglas → ML → LLM
6. **Persistencia**: Multi-layer (Firestore + IndexedDB)
7. **Real-time**: Observables RxJS + Firestore listeners

---

## 📚 DOCUMENTOS COMPLEMENTARIOS

- **[RASA_BOT_EXPLICACION_COMPLETA.md](./RASA_BOT_EXPLICACION_COMPLETA.md)** - Deep dive en Rasa
- **[MODELOS_ML_EXPLICACION_COMPLETA.md](./MODELOS_ML_EXPLICACION_COMPLETA.md)** - Deep dive en ML
- **[TENSORFLOW_ML_README.md](./TENSORFLOW_ML_README.md)** - Modelos TensorFlow.js
- **[MODELOS_ML_README.md](./MODELOS_ML_README.md)** - Servicios de clasificación

---

## 👨‍💻 AUTOR

**Documentación Técnica Completa - Proyecto NuPsi**
Fecha: Noviembre 2025

Colaboradores:
- Javiera Concha - Frontend & Database
- Jisella Vergara - DevOps & Testing
- Camilo Zamora - Rasa Bot & AI Integration

---

## 📄 LICENCIA

Este proyecto se distribuye bajo la licencia MIT.
