# 📚 Documentación Completa del Proyecto NuPsi

## 🎯 Introducción

Este conjunto de documentos proporciona un análisis exhaustivo y recursivo del proyecto **NuPsi**, explicado desde lo más básico hasta lo más técnico, como si fueras un niño aprendiendo paso a paso.

---

## 📖 Guías Disponibles

### 1. 📘 [ANALISIS_COMPLETO_NUPSI.md](./ANALISIS_COMPLETO_NUPSI.md)

**Propósito:** Visión general completa del proyecto NuPsi

**Contenido:**
- ¿Qué es NuPsi y para qué sirve?
- Estructura del proyecto completo
- Componentes principales (App móvil, Chatbot, ML, Firebase)
- Flujo de datos completo del sistema
- Cómo funcionan todas las piezas juntas

**Ideal para:** Entender el proyecto en su totalidad antes de profundizar en componentes específicos

**Nivel:** Principiante a Intermedio

---

### 2. 🤖 [RASA_BOT_EXPLICACION_DETALLADA.md](./RASA_BOT_EXPLICACION_DETALLADA.md)

**Propósito:** Explicación completa y detallada del chatbot con Rasa

**Contenido organizado en 4 niveles:**

#### 📗 Nivel 1: Principiante
- ¿Qué es un chatbot?
- Conceptos básicos: Intent, Entity, Slot, Response, Action
- Analogías simples para entender cada concepto
- Por qué usar Rasa

#### 📙 Nivel 2: Intermedio
- Arquitectura de Rasa (NLU + Core)
- Pipeline del NLU explicado paso a paso
- Políticas de conversación (Rules, Stories)
- Flujo completo de una conversación
- Integración con Google Gemini

#### 📕 Nivel 3: Avanzado
- Pipeline del NLU en detalle técnico
- Funcionamiento interno de DIETClassifier
- TEDPolicy y Transformer
- Arquitectura híbrida Rasa + Gemini
- Protección contra consultas médicas

#### 📔 Nivel 4: Experto
- Implementación de Custom Actions
- Código Python completo con explicaciones
- Entrenamiento del modelo
- Optimización y debugging
- Arquitectura de deployment
- Métricas de evaluación

**Ideal para:** Desarrolladores que quieren entender o modificar el chatbot

**Nivel:** Todos los niveles (del más básico al más técnico)

---

### 3. 🧠 [MODELOS_ML_EXPLICACION_DETALLADA.md](./MODELOS_ML_EXPLICACION_DETALLADA.md)

**Propósito:** Explicación completa de los modelos de Machine Learning

**Contenido organizado en 4 niveles:**

#### 📗 Nivel 1: Principiante
- ¿Qué es Machine Learning?
- ¿Qué es clasificación?
- Los 3 sistemas ML de NuPsi explicados simplemente
- Cómo funciona el ML con analogías

#### 📙 Nivel 2: Intermedio
- Conceptos fundamentales (Features, Labels, Training, Epochs)
- Redes neuronales explicadas con analogías
- Los 3 modelos en detalle:
  1. Clasificación Emocional
  2. Predicción de Score
  3. Análisis Integral
- ¿Qué son ReLU, Softmax, Dropout, Sigmoid?

#### 📕 Nivel 3: Avanzado
- TensorFlow.js y ML en el navegador
- Arquitectura detallada de las redes neuronales
- Proceso de entrenamiento técnico
- Predicción en tiempo real
- Cálculo de parámetros del modelo

#### 📔 Nivel 4: Experto
- Implementación completa en TypeScript
- Código fuente del TensorflowMLService
- Optimizaciones avanzadas:
  - Data Augmentation
  - Learning Rate Scheduling
  - Batch Normalization
  - Ensemble Methods
- Métricas de evaluación (Confusion Matrix, Precision, Recall, F1)
- Guardado y carga de modelos en IndexedDB

**Ideal para:** Desarrolladores de ML o data scientists que quieren entender los modelos

**Nivel:** Todos los niveles (del más básico al más técnico)

---

## 🎓 Cómo Usar Esta Documentación

### Para Principiantes Absolutos:

```
1. Lee ANALISIS_COMPLETO_NUPSI.md completo
   ↓
2. Lee RASA_BOT Nivel 1 + Nivel 2
   ↓
3. Lee MODELOS_ML Nivel 1 + Nivel 2
   ↓
4. ¡Ya entiendes el 80% del proyecto!
```

### Para Desarrolladores:

```
1. Lee ANALISIS_COMPLETO_NUPSI.md (overview)
   ↓
2. Lee RASA_BOT hasta Nivel 3
   ↓
3. Lee MODELOS_ML hasta Nivel 3
   ↓
4. Explora el código fuente con contexto
```

### Para Expertos:

```
1. Lee ANALISIS_COMPLETO_NUPSI.md (referencia rápida)
   ↓
2. Ve directo a RASA_BOT Nivel 4
   ↓
3. Ve directo a MODELOS_ML Nivel 4
   ↓
4. Consulta el código fuente para detalles de implementación
```

---

## 🗂️ Estructura de Archivos del Proyecto

```
NuPsi/
│
├── 📚 DOCUMENTACIÓN NUEVA (Este análisis)
│   ├── INDICE_DOCUMENTACION.md          ← Este archivo
│   ├── ANALISIS_COMPLETO_NUPSI.md       ← Overview general
│   ├── RASA_BOT_EXPLICACION_DETALLADA.md ← Chatbot detallado
│   └── MODELOS_ML_EXPLICACION_DETALLADA.md ← ML detallado
│
├── 📚 DOCUMENTACIÓN EXISTENTE
│   ├── README.md                        ← Documentación principal
│   ├── MODELOS_ML_README.md             ← Resumen de modelos ML
│   ├── TENSORFLOW_ML_README.md          ← TensorFlow.js
│   └── TENSORFLOW_ANDROID_DEPLOYMENT.md ← Deployment Android
│
├── 🤖 RASA-BOT/
│   ├── config.yml                       ← Configuración del NLU
│   ├── domain.yml                       ← Definición del dominio
│   ├── data/
│   │   ├── nlu.yml                      ← Ejemplos de entrenamiento
│   │   ├── rules.yml                    ← Reglas fijas
│   │   └── stories.yml                  ← Historias de conversación
│   └── actions/
│       └── actions.py                   ← Acciones personalizadas
│
├── 📱 SRC/ (App Móvil)
│   ├── app/
│   │   ├── services/
│   │   │   ├── ml-classification.service.ts  ← Coordinador ML
│   │   │   └── tensorflow-ml.service.ts      ← TensorFlow.js
│   │   └── pages/
│   │       ├── ml-daily-form/           ← Formulario diario
│   │       ├── aura-insights/           ← Insights emocionales
│   │       └── bienestar-integral/      ← Análisis integral
│   └── ...
│
└── ... (otros archivos del proyecto)
```

---

## 🔍 Conceptos Clave Explicados

### Chatbot (Rasa)

```
Usuario → NLU (Entiende) → Core (Decide) → Action (Ejecuta) → Respuesta
```

**Componentes principales:**
- **Intent**: Lo que el usuario quiere
- **Entity**: Datos específicos extraídos
- **Slot**: Memoria del bot
- **Action**: Código que se ejecuta
- **Policy**: Estrategia para decidir qué hacer

### Machine Learning

```
Datos históricos → Entrenamiento → Modelo → Predicción
```

**Modelos implementados:**
1. **Clasificación Emocional**: Positivo, Neutral, Negativo, Crítico
2. **Predicción de Score**: 0-100
3. **Análisis Integral**: 5 dimensiones del bienestar

**Tecnología:** TensorFlow.js (ML en el navegador)

---

## 🎯 Flujo de Uso del Sistema

### 1. Usuario usa la app
```
📱 App Móvil (Ionic/Angular)
```

### 2. Puede interactuar de dos formas:

#### A) Chatbot
```
Usuario escribe mensaje
    ↓
Rasa NLU clasifica intent
    ↓
Rasa Core decide acción
    ↓
Si no entiende → Gemini responde
    ↓
Usuario recibe respuesta
```

#### B) Formulario ML
```
Usuario completa formulario diario
    ↓
Datos se guardan en Firebase
    ↓
TensorFlow.js analiza los datos
    ↓
Genera insights y predicciones
    ↓
Usuario ve resultados
```

---

## 💡 Características Destacadas

### Privacidad Total
- ✅ Modelos ML entrenados localmente
- ✅ Datos guardados en el dispositivo
- ✅ No se envía información sensible a servidores

### Inteligencia Híbrida
- ✅ Rasa para conversaciones estructuradas
- ✅ Gemini para respuestas creativas
- ✅ ML personalizado por usuario

### Multimodal
- ✅ Chatbot conversacional
- ✅ Formularios estructurados
- ✅ Visualizaciones de datos
- ✅ Análisis predictivo

---

## 🚀 Tecnologías Utilizadas

### Frontend
- **Framework**: Ionic + Angular
- **Lenguaje**: TypeScript
- **UI**: Ionic Components
- **Móvil**: Capacitor

### Chatbot
- **Framework**: Rasa 3.1
- **Lenguaje**: Python 3.8+
- **NLU**: DIETClassifier
- **IA**: Google Gemini

### Machine Learning
- **Librería**: TensorFlow.js
- **Backend**: WebGL (GPU)
- **Storage**: IndexedDB
- **Modelos**: Redes Neuronales Densas

### Backend
- **Base de datos**: Firebase Firestore
- **Autenticación**: Firebase Auth
- **Storage**: Firebase Storage

---

## 📊 Estadísticas del Proyecto

### Modelos ML
- **Modelo Emocional**: 348 parámetros
- **Modelo Bienestar**: 1,025 parámetros
- **Precisión**: 90-95% (con datos suficientes)
- **Tamaño**: ~100-150 KB cada uno

### Rasa Bot
- **Intents**: 40+
- **Entities**: 5+
- **Actions**: 15+
- **Responses**: 30+
- **Stories**: 10+
- **Rules**: 8+

### App Móvil
- **Páginas**: 20+
- **Servicios**: 10+
- **Componentes**: 15+

---

## 🎨 Ejemplo Visual del Flujo

```
┌─────────────────────────────────────────┐
│          👤 USUARIO                     │
│  "Hola, quiero bajar de peso"          │
└───────────────┬─────────────────────────┘
                │
        ┌───────┴────────┐
        │                │
    🤖 CHATBOT      📝 FORMULARIO
        │                │
        ↓                ↓
  ┌──────────┐     ┌──────────┐
  │  Rasa    │     │ Firebase │
  │  +       │     │    +     │
  │ Gemini   │     │ TensorFlow│
  └──────────┘     └──────────┘
        │                │
        ↓                ↓
  ┌──────────────────────────┐
  │   💬 Conversación        │
  │   📊 Insights ML         │
  │   💡 Recomendaciones     │
  └──────────────────────────┘
                │
                ↓
      ┌─────────────────┐
      │  📱 Resultados  │
      │  en la App      │
      └─────────────────┘
```

---

## 🔧 Para Desarrolladores

### Comandos Útiles

```bash
# Chatbot Rasa
cd rasa-bot
rasa train              # Entrenar modelo
rasa run --enable-api   # Servidor Rasa
rasa run actions        # Action server

# App Móvil
npm install             # Instalar dependencias
ionic serve             # Servidor de desarrollo
ionic build             # Build producción
ionic capacitor build android  # Build Android
```

### Archivos Clave para Modificar

**Para cambiar el chatbot:**
- `rasa-bot/data/nlu.yml` → Agregar ejemplos
- `rasa-bot/domain.yml` → Agregar intents/responses
- `rasa-bot/actions/actions.py` → Código personalizado

**Para cambiar los modelos ML:**
- `src/app/services/tensorflow-ml.service.ts` → Lógica de ML
- `src/app/services/ml-classification.service.ts` → Coordinación

**Para cambiar la UI:**
- `src/app/pages/*` → Páginas de la app
- `src/theme/variables.scss` → Estilos globales

---

## 📚 Recursos Adicionales

### Documentación Oficial
- [Rasa Docs](https://rasa.com/docs/)
- [TensorFlow.js Docs](https://www.tensorflow.org/js)
- [Ionic Docs](https://ionicframework.com/docs)
- [Firebase Docs](https://firebase.google.com/docs)

### Tutoriales Recomendados
- Rasa Masterclass (YouTube)
- TensorFlow.js Crash Course
- Ionic Angular Guide

---

## 🤝 Contribuciones

Este proyecto fue desarrollado por:
- **Javiera Concha**: Frontend y Firebase
- **Jisella Vergara**: DevOps y testing
- **Camilo Zamora**: Rasa bot y ML

---

## 📝 Notas Finales

Esta documentación está diseñada para ser:
- ✅ **Progresiva**: Del nivel más simple al más técnico
- ✅ **Con analogías**: Conceptos complejos explicados simplemente
- ✅ **Práctica**: Con ejemplos de código reales
- ✅ **Completa**: Cubre todo el proyecto

**¿Necesitas ayuda?**
1. Empieza con el nivel principiante
2. Avanza a tu ritmo
3. Consulta los ejemplos de código
4. Experimenta con el proyecto

---

## 🎓 Conclusión

**NuPsi** es un proyecto complejo que combina:
- 🤖 **Chatbot inteligente** (Rasa + Gemini)
- 🧠 **Machine Learning** (TensorFlow.js)
- 📱 **App móvil** (Ionic/Angular)
- 🔥 **Backend en la nube** (Firebase)

Todo diseñado para **ayudar a las personas** a mejorar su bienestar de manera **personalizada, científica y privada**.

---

**¡Feliz aprendizaje!** 🚀📚

