# 📊 RESUMEN VISUAL COMPLETO - PROYECTO NUPSI
## Diagramas y Esquemas de Arquitectura

---

## 🎯 VISIÓN GENERAL DEL SISTEMA

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PROYECTO NUPSI                              │
│          Aplicación de Bienestar y Acompañamiento Integral          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  👤 USUARIO                                                          │
│  │                                                                   │
│  ├─ Descarga app desde Play Store / App Store                       │
│  ├─ Inicia sesión con Firebase Auth                                 │
│  ├─ Completa formulario diario de bienestar                         │
│  ├─ Chatea con el bot Rasa                                          │
│  └─ Ve insights y recomendaciones personalizadas                    │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  📱 FRONTEND (Ionic/Angular/Capacitor)                              │
│  │                                                                   │
│  ├─ Pages: Login, Home, Chat, Perfil, Formularios, Insights         │
│  ├─ Services: Auth, Chat, ML Classification, TensorFlow ML          │
│  ├─ Components: Menu, Cards, Forms, Charts                          │
│  └─ Guards: Auth Guard, Route Protection                            │
└─────────────────────────────────────────────────────────────────────┘
            ↓                    ↓                    ↓
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐
│  🔥 FIREBASE    │  │  🤖 RASA BOT    │  │  🧠 TENSORFLOW.JS   │
│                 │  │                 │  │                     │
│  Authentication │  │  NLU Pipeline   │  │  Modelo Emocional   │
│  Firestore DB   │  │  Policies       │  │  Modelo Bienestar   │
│  Storage        │  │  Actions        │  │  IndexedDB          │
└─────────────────┘  └─────────────────┘  └─────────────────────┘
                              ↓
                    ┌─────────────────┐
                    │  ✨ GEMINI AI   │
                    │                 │
                    │  Fallback       │
                    │  Chat Avanzado  │
                    └─────────────────┘
```

---

## 🏗️ ARQUITECTURA DETALLADA

### Capa de Presentación (Frontend)

```
┌─────────────────────────────────────────────────────────────────────┐
│                     IONIC/ANGULAR APPLICATION                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │  PAGES (Standalone Components)                             │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌──────────────────┐     │    │
│  │  │   Login     │ │    Home     │ │      Chat        │     │    │
│  │  │   Page      │ │    Page     │ │      Page        │     │    │
│  │  └─────────────┘ └─────────────┘ └──────────────────┘     │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌──────────────────┐     │    │
│  │  │ ML Daily    │ │    Aura     │ │   Bienestar      │     │    │
│  │  │   Form      │ │  Insights   │ │   Integral       │     │    │
│  │  └─────────────┘ └─────────────┘ └──────────────────┘     │    │
│  └───────────────────────────────────────────────────────────┘    │
│                                 ↕                                   │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │  SERVICES (Business Logic)                                 │    │
│  │  ┌──────────────┐ ┌──────────────┐ ┌─────────────────┐    │    │
│  │  │  AuthService │ │ ChatService  │ │ MLClassification│    │    │
│  │  │              │ │              │ │    Service      │    │    │
│  │  │ - login()    │ │ - sendMsg()  │ │ - saveInput()   │    │    │
│  │  │ - register() │ │ - getHistory│ │ - generate      │    │    │
│  │  │ - logout()   │ │ - saveChat() │ │   Insights()    │    │    │
│  │  └──────────────┘ └──────────────┘ └─────────────────┘    │    │
│  │  ┌──────────────────────────────────────────────────┐     │    │
│  │  │  TensorflowMLService                              │     │    │
│  │  │  - trainEmotionalModel()                          │     │    │
│  │  │  - trainWellnessModel()                           │     │    │
│  │  │  - predictEmotionalState()                        │     │    │
│  │  │  - predictWellnessScore()                         │     │    │
│  │  │  - saveModel() / loadModel()                      │     │    │
│  │  └──────────────────────────────────────────────────┘     │    │
│  └───────────────────────────────────────────────────────────┘    │
│                                 ↕                                   │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │  COMPONENTS (Reusable UI)                                  │    │
│  │  ┌────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐     │    │
│  │  │  Menu  │ │  Cards   │ │  Forms   │ │   Charts    │     │    │
│  │  └────────┘ └──────────┘ └──────────┘ └─────────────┘     │    │
│  └───────────────────────────────────────────────────────────┘    │
│                                 ↕                                   │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │  GUARDS (Security & Routing)                               │    │
│  │  ┌───────────────┐                                         │    │
│  │  │  Auth Guard   │  → Protege rutas privadas               │    │
│  │  └───────────────┘                                         │    │
│  └───────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### Capa de Backend y Datos

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FIREBASE (BaaS)                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │  AUTHENTICATION                                            │    │
│  │  - Email/Password                                          │    │
│  │  - OAuth (Google, Facebook)                                │    │
│  │  - JWT Tokens                                              │    │
│  └───────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │  FIRESTORE DATABASE                                        │    │
│  │                                                            │    │
│  │  usuarios/{userId}/                                        │    │
│  │    ├─ profile/                                             │    │
│  │    ├─ dailyMLInputs/     (Formularios diarios)            │    │
│  │    ├─ auraInsights/      (Análisis emocional)             │    │
│  │    ├─ bienestarIntegral/ (Análisis de bienestar)          │    │
│  │    └─ chatHistory/       (Historial de chat)              │    │
│  └───────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │  STORAGE                                                   │    │
│  │  - Imágenes de perfil                                      │    │
│  │  - Documentos                                              │    │
│  └───────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         RASA BOT (Python)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │  NLU PIPELINE                                              │    │
│  │  ┌────────────────────────────────────────────────────┐   │    │
│  │  │  WhitespaceTokenizer                                │   │    │
│  │  │  RegexFeaturizer                                    │   │    │
│  │  │  LexicalSyntacticFeaturizer                         │   │    │
│  │  │  CountVectorsFeaturizer (word)                      │   │    │
│  │  │  CountVectorsFeaturizer (char n-grams)             │   │    │
│  │  │  DIETClassifier ← MODELO PRINCIPAL                  │   │    │
│  │  │  EntitySynonymMapper                                │   │    │
│  │  │  FallbackClassifier (threshold: 0.55)              │   │    │
│  │  └────────────────────────────────────────────────────┘   │    │
│  └───────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │  DIALOGUE POLICIES                                         │    │
│  │  ┌────────────────────────────────────────────────────┐   │    │
│  │  │  RulePolicy     → Reglas estrictas                 │   │    │
│  │  │  MemoizationPolicy → Memoria de conversaciones     │   │    │
│  │  │  TEDPolicy      → ML (Transformer)                 │   │    │
│  │  └────────────────────────────────────────────────────┘   │    │
│  └───────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │  CUSTOM ACTIONS (Python)                                   │    │
│  │  ┌────────────────────────────────────────────────────┐   │    │
│  │  │  action_fallback_to_gemini                         │   │    │
│  │  │  action_call_gemini_chat                           │   │    │
│  │  │  action_handle_medical_query                       │   │    │
│  │  │  action_search_nearby_professional                 │   │    │
│  │  │  action_propose_meal_plan                          │   │    │
│  │  │  action_propose_workout                            │   │    │
│  │  └────────────────────────────────────────────────────┘   │    │
│  └───────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      GEMINI AI (Google)                             │
├─────────────────────────────────────────────────────────────────────┤
│  - Model: gemini-2.5-flash                                          │
│  - System Persona: Experto en nutrición y bienestar                 │
│  - Uso: Fallback cuando Rasa confianza < 0.55                       │
│  - Uso: Chat directo para preguntas complejas                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUJO DE DATOS COMPLETO

### 1. Flujo de Autenticación

```
┌─────────┐     ┌──────────┐     ┌─────────────┐     ┌──────────┐
│ Usuario │────▶│ Angular  │────▶│   Firebase  │────▶│ Firestore│
│ ingresa │     │   Auth   │     │     Auth    │     │   User   │
│  email  │     │ Service  │     │             │     │  Profile │
│  pass   │     │          │     │             │     │          │
└─────────┘     └──────────┘     └─────────────┘     └──────────┘
                     │                    │
                     │                    └─────▶ JWT Token
                     │                             │
                     └────────────────────────────┘
                                  │
                                  ▼
                     Usuario autenticado → Acceso a App
```

### 2. Flujo de Chat con Rasa Bot

```
Usuario escribe mensaje
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│  FRONTEND: ChatService.sendMessage()                     │
│  - Añade mensaje al array local                          │
│  - Muestra en UI inmediatamente                          │
│  - HTTP POST a http://localhost:5005/webhooks/rest       │
└──────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│  RASA NLU: Procesa mensaje                               │
│  1. Tokeniza: ["quiero", "ejercicios", "pecho"]          │
│  2. Featuriza: Vectores numéricos                        │
│  3. DIETClassifier:                                      │
│     - Intent: ask_muscle_group (0.95)                    │
│     - Entity: muscle_group="pecho"                       │
└──────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│  RASA CORE: Selecciona acción                            │
│  1. RulePolicy: No encuentra regla (0.0)                 │
│  2. MemoizationPolicy: No encuentra historia (0.0)       │
│  3. TEDPolicy: action_propose_workout (0.89)             │
│  → Ganador: action_propose_workout                       │
└──────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│  CUSTOM ACTION: action_propose_workout                   │
│  - Genera rutina de pecho                                │
│  - Retorna texto de respuesta                            │
└──────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│  FRONTEND: Recibe respuesta                              │
│  - Añade respuesta al array local                        │
│  - Muestra en UI                                         │
│  - (Opcional) Guarda en Firestore                        │
└──────────────────────────────────────────────────────────┘
        │
        ▼
    Usuario ve respuesta
```

### 3. Flujo de Chat con Fallback a Gemini

```
Usuario: "¿La cetosis es mejor que el ayuno intermitente?"
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│  RASA NLU: Clasifica                                     │
│  - Intent más probable: ask_diet_general (0.42)          │
│  - Confianza < threshold (0.55)                          │
│  → FallbackClassifier: intent=nlu_fallback               │
└──────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│  RASA CORE: RulePolicy                                   │
│  - Encuentra regla:                                      │
│    nlu_fallback → action_fallback_to_gemini              │
└──────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│  ACTION: action_fallback_to_gemini                       │
│  1. Construye prompt con SYSTEM_PERSONA                  │
│  2. Llama a Gemini API (async)                           │
│  3. Espera respuesta (timeout: 30s)                      │
└──────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│  GEMINI AI: Genera respuesta                             │
│  - Analiza pregunta en contexto de nutrición             │
│  - Genera respuesta detallada y empática                 │
│  - Retorna texto                                         │
└──────────────────────────────────────────────────────────┘
        │
        ▼
    Usuario recibe respuesta completa de Gemini
```

### 4. Flujo de Machine Learning

```
Usuario completa formulario diario
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│  ML-DAILY-FORM PAGE                                      │
│  - Valida formulario                                     │
│  - Envía a MLClassificationService.saveDailyMLInput()    │
└──────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│  FIRESTORE: Guarda datos                                 │
│  usuarios/{uid}/dailyMLInputs/{docId}                    │
│  {                                                        │
│    fecha: Timestamp,                                     │
│    emociones: ['feliz', 'motivado'],                     │
│    estadoAnimo: 'bueno',                                 │
│    nivelEstres: 4,                                       │
│    ...                                                   │
│  }                                                        │
└──────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│  ML-CLASSIFICATION SERVICE                               │
│  - Obtiene últimos 30 días de datos                      │
│  - Cuenta registros                                      │
└──────────────────────────────────────────────────────────┘
        │
        ▼
    ¿Datos >= 10?
        │
    ┌───┴───┐
    │       │
   SÍ      NO
    │       │
    ▼       ▼
┌────────┐ ┌──────────┐
│   ML   │ │Heurística│
│  Real  │ │ (Reglas) │
└────────┘ └──────────┘
    │
    ▼
┌──────────────────────────────────────────────────────────┐
│  TENSORFLOW-ML SERVICE                                   │
│  1. Prepara features (10 valores normalizados)           │
│  2. Convierte a tensor                                   │
│  3. Carga modelo de IndexedDB                            │
│  4. model.predict(features)                              │
│  5. Interpreta probabilidades                            │
└──────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│  Genera Insights                                         │
│  {                                                        │
│    categoria: 'positivo',                                │
│    confianza: 0.89,                                      │
│    emocionDominante: 'feliz',                            │
│    tendencia: 'mejorando',                               │
│    scoreGeneral: 78,                                     │
│    patronesDetectados: [...],                            │
│    recomendaciones: [...]                                │
│  }                                                        │
└──────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│  FIRESTORE: Guarda Insights                              │
│  usuarios/{uid}/auraInsights/{docId}                     │
└──────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│  AURA-INSIGHTS PAGE                                      │
│  - Muestra clasificación emocional                       │
│  - Muestra score con progress bar                        │
│  - Lista patrones detectados                             │
│  - Muestra recomendaciones                               │
└──────────────────────────────────────────────────────────┘
        │
        ▼
    Usuario ve insights personalizados
```

---

## 🧠 ARQUITECTURA DE MODELOS ML

### Modelo 1: Clasificación Emocional

```
INPUT FEATURES (10 valores normalizados [0-1])
┌───────────────────────────────────────────────────────────┐
│ [0.8, 0.1, 0.75, 0.3, 0.8, 0.88, 0.75, 1.0, 0.7, 1.0]    │
│   │    │    │     │    │    │     │     │    │    │       │
│   │    │    │     │    │    │     │     │    │    └─ Comidas
│   │    │    │     │    │    │     │     │    └───── Cal. Alimentación
│   │    │    │     │    │    │     │     └────────── Actividad Física
│   │    │    │     │    │    │     └─────────────── Hidratación
│   │    │    │     │    │    └───────────────────── Horas Sueño
│   │    │    │     │    └────────────────────────── Cal. Sueño
│   │    │    │     └─────────────────────────────── Nivel Estrés
│   │    │    └───────────────────────────────────── Estado Ánimo
│   │    └────────────────────────────────────────── Ratio Negativo
│   └─────────────────────────────────────────────── Ratio Positivo
└───────────────────────────────────────────────────────────┘
                           │
                           ▼
┌───────────────────────────────────────────────────────────┐
│                   DENSE LAYER 1                           │
│                 16 neuronas, ReLU                         │
│                                                           │
│  [neuron1]  [neuron2]  ...  [neuron16]                   │
│     │          │               │                          │
│     └──────────┴───────────────┘                          │
│              Weighted Sum + ReLU                          │
│           output = max(0, W·x + b)                        │
└───────────────────────────────────────────────────────────┘
                           │
                           ▼
┌───────────────────────────────────────────────────────────┐
│                    DROPOUT (20%)                          │
│      Apaga aleatoriamente 20% de neuronas                 │
│          (solo durante entrenamiento)                     │
└───────────────────────────────────────────────────────────┘
                           │
                           ▼
┌───────────────────────────────────────────────────────────┐
│                   DENSE LAYER 2                           │
│                  8 neuronas, ReLU                         │
│                                                           │
│  [neuron1]  [neuron2]  ...  [neuron8]                    │
└───────────────────────────────────────────────────────────┘
                           │
                           ▼
┌───────────────────────────────────────────────────────────┐
│                   OUTPUT LAYER                            │
│                4 neuronas, Softmax                        │
│                                                           │
│  [Positivo]  [Neutral]  [Negativo]  [Crítico]            │
│     0.85        0.10       0.04        0.01               │
│      │           │          │           │                 │
│      └───────────┴──────────┴───────────┘                 │
│           Suma = 1.0 (100%)                               │
└───────────────────────────────────────────────────────────┘
                           │
                           ▼
                  PREDICCIÓN: POSITIVO
                  Confianza: 85%
```

### Modelo 2: Predicción de Bienestar (Regresión)

```
INPUT FEATURES (10 valores)
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│               DENSE LAYER 1                               │
│            32 neuronas, ReLU                              │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│              DROPOUT (30%)                                │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│               DENSE LAYER 2                               │
│            16 neuronas, ReLU                              │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│              DROPOUT (20%)                                │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│               DENSE LAYER 3                               │
│             8 neuronas, ReLU                              │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│              OUTPUT LAYER                                 │
│          1 neurona, Sigmoid                               │
│          output * 100 = score                             │
│                                                           │
│               [0.785]                                     │
│                  │                                        │
│                  ▼                                        │
│            Score: 78.5                                    │
└───────────────────────────────────────────────────────────┘
```

---

## 📊 PROCESO DE ENTRENAMIENTO

```
FASE 1: RECOLECCIÓN DE DATOS
┌─────────────────────────────────────┐
│  Día 1: Usuario registra datos     │
│  Día 2: Usuario registra datos     │
│  ...                                │
│  Día 10: Usuario registra datos    │
│  → Datos suficientes para entrenar │
└─────────────────────────────────────┘
            │
            ▼
FASE 2: PREPARACIÓN DE DATOS
┌─────────────────────────────────────┐
│  1. Obtener últimos 30 días         │
│  2. Convertir a features [10 vals]  │
│  3. Normalizar [0-1]                │
│  4. Crear labels (one-hot)          │
│  5. Dividir train/validation (80/20)│
└─────────────────────────────────────┘
            │
            ▼
FASE 3: CONSTRUCCIÓN DEL MODELO
┌─────────────────────────────────────┐
│  1. Crear arquitectura (capas)      │
│  2. Compilar (optimizer, loss)      │
│  3. Resumen del modelo              │
└─────────────────────────────────────┘
            │
            ▼
FASE 4: ENTRENAMIENTO
┌─────────────────────────────────────┐
│  Epoch 0:  loss=1.38, acc=0.38      │
│  Epoch 10: loss=0.62, acc=0.63      │
│  Epoch 20: loss=0.34, acc=0.81      │
│  Epoch 30: loss=0.18, acc=0.94      │
│  Epoch 50: loss=0.11, acc=0.98      │
│  → Modelo entrenado                 │
└─────────────────────────────────────┘
            │
            ▼
FASE 5: EVALUACIÓN
┌─────────────────────────────────────┐
│  Validation Loss: 0.15              │
│  Validation Accuracy: 0.95          │
│  → Modelo funciona bien             │
└─────────────────────────────────────┘
            │
            ▼
FASE 6: PERSISTENCIA
┌─────────────────────────────────────┐
│  Guardar en IndexedDB:              │
│  - indexeddb://nupsi-emotional-model│
│  - Tamaño: ~50-100 KB               │
│  → Modelo disponible offline        │
└─────────────────────────────────────┘
            │
            ▼
FASE 7: PREDICCIÓN
┌─────────────────────────────────────┐
│  Nuevos datos → Predicción          │
│  Día 11: POSITIVO (89%)             │
│  Día 12: NEUTRAL (72%)              │
│  ...                                │
└─────────────────────────────────────┘
```

---

## 🔐 SEGURIDAD Y PRIVACIDAD

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPAS DE SEGURIDAD                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🔒 CAPA 1: AUTENTICACIÓN                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Firebase Authentication                            │    │
│  │  - JWT Tokens                                       │    │
│  │  - Expiración automática                            │    │
│  │  - Refresh tokens                                   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  🔒 CAPA 2: AUTORIZACIÓN                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Auth Guards (Angular)                              │    │
│  │  - Protección de rutas                              │    │
│  │  - Verificación de token                            │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  🔒 CAPA 3: FIRESTORE RULES                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │  match /usuarios/{userId} {                         │    │
│  │    allow read, write: if                            │    │
│  │      request.auth != null &&                        │    │
│  │      request.auth.uid == userId;                    │    │
│  │  }                                                  │    │
│  │  → Solo tu puedes ver TUS datos                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  🔒 CAPA 4: PRIVACIDAD ML                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │  - Modelos entrenan localmente (navegador)          │    │
│  │  - Datos NO se envían a servidores                  │    │
│  │  - Almacenamiento local (IndexedDB)                 │    │
│  │  - NO hay tracking externo                          │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  🔒 CAPA 5: ÉTICA EN IA                                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │  - Bloqueo de diagnósticos médicos                  │    │
│  │  - Redirección a profesionales de salud             │    │
│  │  - System Persona con límites éticos                │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📈 MÉTRICAS Y MONITOREO

```
┌─────────────────────────────────────────────────────────────┐
│                   DASHBOARD DE MÉTRICAS                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📊 MÉTRICAS DE MODELO ML                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Modelo Emocional:                                  │    │
│  │  - Accuracy: 95%     ████████████████░░░           │    │
│  │  - Loss: 0.11        ██░░░░░░░░░░░░░░░            │    │
│  │  - Confianza Promedio: 87%                          │    │
│  │  - Datos de entrenamiento: 30 días                  │    │
│  │  - Última actualización: Hace 3 días                │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  📊 MÉTRICAS DE RASA BOT                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Total mensajes: 1000                               │    │
│  │  - Manejados por Rasa: 850 (85%)                    │    │
│  │  - Fallback a Gemini: 120 (12%)                     │    │
│  │  - Gemini directo: 30 (3%)                          │    │
│  │                                                      │    │
│  │  Latencia promedio:                                 │    │
│  │  - Rasa: 80ms      ██░░░░░░░░░░░░░░░              │    │
│  │  - Gemini: 1.2s    ████████████████████           │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  📊 MÉTRICAS DE USUARIO                                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Usuarios activos: 150                              │    │
│  │  Formularios completados hoy: 45                    │    │
│  │  Insights generados: 45                             │    │
│  │  Sesiones de chat: 78                               │    │
│  │  Satisfacción promedio: 4.6/5 ★★★★★               │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 DEPLOYMENT Y ESCALABILIDAD

```
ENTORNO DE DESARROLLO
┌─────────────────────────────────────────────────────────┐
│  Local Machine                                           │
│  ├─ Frontend: ionic serve (localhost:8100)              │
│  ├─ Rasa: rasa run (localhost:5005)                     │
│  ├─ Actions: rasa run actions (localhost:5055)          │
│  └─ Firebase: Emulators (opcional)                      │
└─────────────────────────────────────────────────────────┘

ENTORNO DE PRODUCCIÓN
┌─────────────────────────────────────────────────────────┐
│  FRONTEND                                                │
│  ├─ Build: ionic build --prod                           │
│  ├─ Deploy: Firebase Hosting / Netlify / Vercel         │
│  └─ URL: https://nupsi.app                              │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  RASA BOT                                                │
│  ├─ Containerización: Docker                             │
│  ├─ Orquestación: Docker Compose / Kubernetes           │
│  ├─ Deploy: AWS EC2 / GCP Compute / Heroku              │
│  └─ URL: https://api.nupsi.app/rasa                     │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  FIREBASE                                                │
│  ├─ Plan: Spark (Free) / Blaze (Pay as you go)         │
│  ├─ Regiones: us-central1, southamerica-east1           │
│  └─ Backup: Automático diario                           │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  APPS MÓVILES                                            │
│  ├─ Build: capacitor build android/ios                  │
│  ├─ Android: Play Store                                 │
│  └─ iOS: App Store                                      │
└─────────────────────────────────────────────────────────┘

ESCALABILIDAD
┌─────────────────────────────────────────────────────────┐
│  Horizontal Scaling                                      │
│  ├─ Load Balancer (nginx)                               │
│  ├─ Multiple Rasa instances                             │
│  └─ Auto-scaling based on CPU/Memory                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🎓 DOCUMENTACIÓN DISPONIBLE

```
📚 GUÍAS COMPLETAS

├─ 📘 GUIA_COMPLETA_NUPSI.md
│  └─ Análisis completo del proyecto
│     ├─ Explicación para niños
│     ├─ Nivel básico
│     ├─ Nivel intermedio
│     └─ Nivel técnico avanzado
│
├─ 📗 RASA_BOT_EXPLICACION_COMPLETA.md
│  └─ Deep dive en Rasa
│     ├─ ¿Qué es un chatbot?
│     ├─ Componentes de Rasa
│     ├─ NLU Pipeline (DIETClassifier)
│     ├─ Políticas de diálogo
│     ├─ Integración con Gemini
│     └─ Training y deployment
│
├─ 📙 MODELOS_ML_EXPLICACION_COMPLETA.md
│  └─ Machine Learning detallado
│     ├─ Conceptos fundamentales
│     ├─ TensorFlow.js
│     ├─ Arquitectura de modelos
│     ├─ Feature engineering
│     ├─ Entrenamiento y optimización
│     └─ Deployment en navegador
│
├─ 📕 MODELOS_ML_README.md
│  └─ Resumen de implementación ML
│     ├─ 3 funcionalidades principales
│     ├─ Estructura de datos Firestore
│     ├─ Algoritmos implementados
│     └─ Testing y validación
│
└─ 📓 TENSORFLOW_ML_README.md
   └─ TensorFlow.js específico
      ├─ Arquitectura de redes neuronales
      ├─ Features y normalización
      ├─ Proceso de entrenamiento
      ├─ Métricas de evaluación
      └─ Ventajas vs heurística
```

---

## ✨ RESUMEN FINAL

### El Proyecto NuPsi es:

```
┌─────────────────────────────────────────────────────────────┐
│  🌟 Una aplicación MÓVIL (iOS + Android)                    │
│  🤖 Con un CHATBOT inteligente (Rasa + Gemini)              │
│  🧠 Que usa MACHINE LEARNING real (TensorFlow.js)           │
│  📊 Para dar CONSEJOS PERSONALIZADOS de bienestar           │
│  🔒 Respetando tu PRIVACIDAD (datos locales)                │
│  🎯 Con enfoque en NUTRICIÓN, EJERCICIO y EMOCIONES         │
└─────────────────────────────────────────────────────────────┘

        TECNOLOGÍAS CLAVE
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│ Angular  │  Ionic   │   Rasa   │  Gemini  │TensorFlow│
│   17+    │   7+     │   3.6+   │  2.5     │   .js    │
└──────────┴──────────┴──────────┴──────────┴──────────┘

        FLUJO SIMPLIFICADO
┌────────────────────────────────────────────────────────┐
│  Usuario → Frontend → Firebase (datos)                 │
│         ↓                                               │
│  Usuario → Frontend → Rasa Bot → Gemini (si necesario) │
│         ↓                                               │
│  Usuario → Frontend → TensorFlow.js → Insights         │
└────────────────────────────────────────────────────────┘

        BENEFICIOS PRINCIPALES
✅ Personalización total (aprende de ti)
✅ Privacidad (datos en tu dispositivo)
✅ Offline (funciona sin internet para ML)
✅ Rápido (procesamiento local)
✅ Gratis (sin costos de servidor para ML)
✅ Ético (no da diagnósticos médicos)
```

---

## 📞 CONTACTO Y CONTRIBUCIÓN

```
👥 EQUIPO NUPSI

Javiera Concha
├─ Rol: Frontend & Database
├─ GitHub: @JawiniSKP
└─ Email: [contacto]

Jisella Vergara
├─ Rol: DevOps & QA
├─ GitHub: [usuario]
└─ Email: [contacto]

Camilo Zamora
├─ Rol: Rasa Bot & AI
├─ GitHub: @Camiiloo
└─ Email: [contacto]

🌐 REPOSITORIO
├─ URL: https://github.com/JawiniSKP/NuPsi
├─ Licencia: MIT
└─ Documentación: /docs

🚀 ROADMAP FUTURO
├─ Transfer Learning (modelos pre-entrenados)
├─ LSTM para series temporales
├─ Predicción de estados futuros
├─ Sistema de gamificación completo
├─ Exportación de reportes PDF
└─ Integración con wearables
```

---

**Fecha de creación:** Noviembre 2025  
**Versión:** 1.0  
**Autor:** Documentación Técnica - Proyecto NuPsi

---

