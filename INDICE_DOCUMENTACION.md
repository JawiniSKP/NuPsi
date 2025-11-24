# 📚 ÍNDICE DE DOCUMENTACIÓN - PROYECTO NUPSI

Este documento sirve como guía de navegación para toda la documentación técnica del proyecto NuPsi.

---

## 🎯 ¿Por Dónde Empezar?

### Si eres NUEVO en el proyecto:
1. Empieza con **[GUIA_COMPLETA_NUPSI.md](./GUIA_COMPLETA_NUPSI.md)** - Sección 1 y 2
2. Mira los diagramas visuales en **[RESUMEN_VISUAL_NUPSI.md](./RESUMEN_VISUAL_NUPSI.md)**
3. Lee el README principal: **[README.md](./README.md)**

### Si quieres entender el CHATBOT:
1. Lee **[RASA_BOT_EXPLICACION_COMPLETA.md](./RASA_BOT_EXPLICACION_COMPLETA.md)** - Secciones 1-3
2. Luego profundiza en las secciones 4-7 para detalles técnicos

### Si quieres entender MACHINE LEARNING:
1. Lee **[MODELOS_ML_EXPLICACION_COMPLETA.md](./MODELOS_ML_EXPLICACION_COMPLETA.md)** - Secciones 1-3
2. Revisa **[TENSORFLOW_ML_README.md](./TENSORFLOW_ML_README.md)** para implementación
3. Consulta **[MODELOS_ML_README.md](./MODELOS_ML_README.md)** para el resumen

### Si eres DESARROLLADOR experimentado:
1. **[RESUMEN_VISUAL_NUPSI.md](./RESUMEN_VISUAL_NUPSI.md)** - Para arquitectura completa
2. **[GUIA_COMPLETA_NUPSI.md](./GUIA_COMPLETA_NUPSI.md)** - Sección 4 (componentes técnicos)
3. Documentos específicos según tu área de interés

---

## 📖 Catálogo Completo de Documentos

### 📘 Documentación Principal

#### [GUIA_COMPLETA_NUPSI.md](./GUIA_COMPLETA_NUPSI.md)
**Análisis Recursivo Completo - De Principiante a Experto**

**Contenido:**
- ✅ ¿Qué es NuPsi? - Explicación para niños
- ✅ ¿Cómo funciona NuPsi? - Nivel Básico
- ✅ Arquitectura del Proyecto - Nivel Intermedio
- ✅ Componentes Técnicos - Nivel Avanzado
- ✅ Flujo de Datos Completo
- ✅ Tecnologías Utilizadas

**Ideal para:** Todos los niveles, empezando por principiantes

**Extensión:** ~38,500 caracteres

---

#### [RESUMEN_VISUAL_NUPSI.md](./RESUMEN_VISUAL_NUPSI.md)
**Diagramas y Esquemas de Arquitectura**

**Contenido:**
- ✅ Visión general del sistema (diagrama ASCII)
- ✅ Arquitectura detallada por capas
- ✅ Flujos de datos completos
- ✅ Arquitectura de modelos ML
- ✅ Proceso de entrenamiento
- ✅ Seguridad y privacidad
- ✅ Deployment y escalabilidad
- ✅ Índice de toda la documentación

**Ideal para:** Arquitectos de software, desarrolladores visuales

**Extensión:** ~38,000 caracteres

---

### 📗 Documentación del Rasa Bot

#### [RASA_BOT_EXPLICACION_COMPLETA.md](./RASA_BOT_EXPLICACION_COMPLETA.md)
**Del Nivel Más Básico al Más Técnico**

**Contenido:**
- ✅ ¿Qué es un Chatbot? - Para Niños
- ✅ ¿Por qué Rasa? - Nivel Básico
- ✅ Componentes de Rasa - Nivel Intermedio
- ✅ NLU Pipeline - Nivel Avanzado
  - WhitespaceTokenizer
  - RegexFeaturizer
  - LexicalSyntacticFeaturizer
  - CountVectorsFeaturizer
  - **DIETClassifier** (modelo principal)
  - EntitySynonymMapper
  - FallbackClassifier
- ✅ Políticas de Diálogo - Nivel Experto
  - RulePolicy
  - MemoizationPolicy
  - TEDPolicy
- ✅ Integración con Gemini - Arquitectura Híbrida
- ✅ Training y Deployment

**Ideal para:** Desarrolladores de chatbots, científicos de datos NLP

**Extensión:** ~35,800 caracteres

**Archivos relacionados:**
- `rasa-bot/config.yml` - Configuración del pipeline
- `rasa-bot/domain.yml` - Vocabulario del bot
- `rasa-bot/data/nlu.yml` - Datos de entrenamiento
- `rasa-bot/data/rules.yml` - Reglas de diálogo
- `rasa-bot/data/stories.yml` - Historias de conversación
- `rasa-bot/actions/actions.py` - Acciones personalizadas

---

### 📙 Documentación de Machine Learning

#### [MODELOS_ML_EXPLICACION_COMPLETA.md](./MODELOS_ML_EXPLICACION_COMPLETA.md)
**Del Concepto Básico a la Implementación Técnica**

**Contenido:**
- ✅ ¿Qué es Machine Learning? - Para Niños
- ✅ ¿Por qué ML en NuPsi? - Nivel Básico
- ✅ Arquitectura de los Modelos - Nivel Intermedio
  - Modelo de Clasificación Emocional
  - Modelo de Predicción de Bienestar
- ✅ TensorFlow.js - Nivel Avanzado
  - Tensores y operaciones
  - Capas densas
  - Proceso de entrenamiento
  - Persistencia en IndexedDB
- ✅ Feature Engineering - Nivel Experto
  - 10 features normalizadas
  - Ratio de emociones
  - Métricas de sueño, hidratación, ejercicio
- ✅ Entrenamiento y Optimización
  - Hiperparámetros
  - Optimizadores (Adam)
  - Métricas (Loss, Accuracy, MAE)
- ✅ Deployment en el Navegador
  - Gestión de memoria
  - Aceleración WebGL
  - Re-entrenamiento automático

**Ideal para:** Científicos de datos, ingenieros de ML

**Extensión:** ~38,500 caracteres

**Archivos relacionados:**
- `src/app/services/ml-classification.service.ts` - Orquestador ML
- `src/app/services/tensorflow-ml.service.ts` - Implementación TensorFlow.js

---

#### [MODELOS_ML_README.md](./MODELOS_ML_README.md)
**Resumen de Implementación ML**

**Contenido:**
- ✅ Funcionalidades implementadas (3 principales)
  - Formulario Diario ML
  - Insights IA Aura
  - Bienestar Integral
- ✅ Estructura de datos en Firebase
- ✅ Diseño y UI/UX
- ✅ Integración en Home
- ✅ Servicios implementados
- ✅ Algoritmos ML implementados
- ✅ Testing y validación

**Ideal para:** Product managers, desarrolladores frontend

**Extensión:** ~12,000 caracteres

---

#### [TENSORFLOW_ML_README.md](./TENSORFLOW_ML_README.md)
**Machine Learning Real con TensorFlow.js**

**Contenido:**
- ✅ Modelos implementados
  - Clasificación Emocional (Red Neuronal Densa)
  - Predicción de Score de Bienestar (Regresión)
- ✅ Flujo de trabajo ML
  - Recolección de datos
  - Entrenamiento automático
  - Predicción en tiempo real
- ✅ Feature Engineering
- ✅ Persistencia de modelos
- ✅ Métricas y evaluación
- ✅ Ventajas del ML Real vs Heurística

**Ideal para:** Ingenieros de ML, científicos de datos

**Extensión:** ~13,000 caracteres

---

### 📕 Otros Documentos

#### [README.md](./README.md)
**Documentación Principal del Proyecto**

**Contenido:**
- ✅ Descripción del proyecto
- ✅ Requisitos previos
- ✅ Instalación y ejecución
- ✅ Estructura del proyecto
- ✅ Aportes individuales del equipo

**Ideal para:** Nuevos colaboradores, instalación rápida

---

#### [TENSORFLOW_ANDROID_DEPLOYMENT.md](./TENSORFLOW_ANDROID_DEPLOYMENT.md)
**Deployment de TensorFlow en Android**

**Contenido:**
- ✅ Configuración de Android
- ✅ Deployment de modelos TensorFlow Lite
- ✅ Optimización para móviles

**Ideal para:** Desarrolladores Android

---

## 🗺️ Mapa de Navegación por Tema

### 🎯 Por Nivel de Experiencia

#### PRINCIPIANTE (Sin experiencia técnica)
```
1. README.md (Intro)
2. GUIA_COMPLETA_NUPSI.md - Sección 1-2
3. RESUMEN_VISUAL_NUPSI.md - Visión general
4. RASA_BOT_EXPLICACION_COMPLETA.md - Sección 1-2
5. MODELOS_ML_EXPLICACION_COMPLETA.md - Sección 1-2
```

#### INTERMEDIO (Conocimientos básicos de programación)
```
1. GUIA_COMPLETA_NUPSI.md - Sección 3
2. RESUMEN_VISUAL_NUPSI.md - Arquitectura
3. RASA_BOT_EXPLICACION_COMPLETA.md - Sección 3-4
4. MODELOS_ML_EXPLICACION_COMPLETA.md - Sección 3-4
5. MODELOS_ML_README.md
```

#### AVANZADO (Desarrollador experimentado)
```
1. RESUMEN_VISUAL_NUPSI.md (Vista completa)
2. GUIA_COMPLETA_NUPSI.md - Sección 4-5
3. RASA_BOT_EXPLICACION_COMPLETA.md - Sección 5-6
4. MODELOS_ML_EXPLICACION_COMPLETA.md - Sección 5-6
5. TENSORFLOW_ML_README.md
```

#### EXPERTO (Especialista en ML/NLP)
```
1. RESUMEN_VISUAL_NUPSI.md (Arquitectura)
2. GUIA_COMPLETA_NUPSI.md - Sección 6
3. RASA_BOT_EXPLICACION_COMPLETA.md - Sección 7
4. MODELOS_ML_EXPLICACION_COMPLETA.md - Sección 7
5. Código fuente directo
```

---

### 🛠️ Por Tecnología

#### 🤖 RASA BOT
```
📗 RASA_BOT_EXPLICACION_COMPLETA.md (Principal)
   ├─ Sección 3: Componentes de Rasa
   ├─ Sección 4: NLU Pipeline (DIETClassifier)
   ├─ Sección 5: Políticas de Diálogo
   ├─ Sección 6: Integración Gemini
   └─ Sección 7: Training y Deployment

📘 GUIA_COMPLETA_NUPSI.md
   └─ Sección 4.2: Rasa Bot (Backend Conversacional)

📊 RESUMEN_VISUAL_NUPSI.md
   └─ Sección 2: Arquitectura de Backend

Archivos de código:
   ├─ rasa-bot/config.yml
   ├─ rasa-bot/domain.yml
   ├─ rasa-bot/data/*.yml
   └─ rasa-bot/actions/actions.py
```

#### 🧠 MACHINE LEARNING
```
📙 MODELOS_ML_EXPLICACION_COMPLETA.md (Principal)
   ├─ Sección 3: Arquitectura de Modelos
   ├─ Sección 4: TensorFlow.js
   ├─ Sección 5: Feature Engineering
   ├─ Sección 6: Entrenamiento
   └─ Sección 7: Deployment

📓 TENSORFLOW_ML_README.md
   └─ Implementación técnica

📕 MODELOS_ML_README.md
   └─ Resumen de funcionalidades

📘 GUIA_COMPLETA_NUPSI.md
   └─ Sección 4.1: Frontend (TensorFlow.js)

Archivos de código:
   ├─ src/app/services/ml-classification.service.ts
   └─ src/app/services/tensorflow-ml.service.ts
```

#### 📱 FRONTEND (Ionic/Angular)
```
📘 GUIA_COMPLETA_NUPSI.md
   ├─ Sección 4.1: Frontend Stack
   └─ Sección 5: Flujo de Datos

📊 RESUMEN_VISUAL_NUPSI.md
   └─ Sección 1: Capa de Presentación

Archivos de código:
   ├─ src/app/pages/
   ├─ src/app/services/
   └─ src/app/components/
```

#### 🔥 FIREBASE
```
📘 GUIA_COMPLETA_NUPSI.md
   └─ Sección 3.3: Base de Datos Firebase

📊 RESUMEN_VISUAL_NUPSI.md
   └─ Sección 2: Capa de Backend

📕 MODELOS_ML_README.md
   └─ Estructura de Datos en Firebase

Archivos de código:
   ├─ firebase.json
   └─ firestore.rules
```

---

## 📊 Matriz de Contenido

| Documento | Nivel | Rasa Bot | ML | Frontend | Arquitectura | Deployment |
|-----------|-------|----------|----|-----------|--------------|-----------
| GUIA_COMPLETA_NUPSI.md | Todos | ✅ | ✅ | ✅ | ✅✅✅ | ✅ |
| RESUMEN_VISUAL_NUPSI.md | Medio-Alto | ✅ | ✅ | ✅ | ✅✅✅ | ✅✅ |
| RASA_BOT_EXPLICACION_COMPLETA.md | Todos | ✅✅✅ | ❌ | ❌ | ✅ | ✅✅ |
| MODELOS_ML_EXPLICACION_COMPLETA.md | Todos | ❌ | ✅✅✅ | ❌ | ✅ | ✅✅ |
| MODELOS_ML_README.md | Básico-Medio | ❌ | ✅✅ | ✅ | ❌ | ❌ |
| TENSORFLOW_ML_README.md | Medio-Alto | ❌ | ✅✅✅ | ❌ | ❌ | ✅ |
| README.md | Básico | ✅ | ❌ | ✅ | ✅ | ✅ |

Leyenda:
- ✅✅✅ = Cobertura completa y detallada
- ✅✅ = Cobertura significativa
- ✅ = Mención o cobertura básica
- ❌ = No cubre este tema

---

## 🎯 Casos de Uso

### Caso 1: "Quiero entender TODO el proyecto"
**Ruta recomendada:**
1. README.md (10 min)
2. GUIA_COMPLETA_NUPSI.md completo (60 min)
3. RESUMEN_VISUAL_NUPSI.md (30 min)
4. RASA_BOT_EXPLICACION_COMPLETA.md (45 min)
5. MODELOS_ML_EXPLICACION_COMPLETA.md (45 min)

**Total:** ~3 horas

---

### Caso 2: "Solo quiero implementar un chatbot similar"
**Ruta recomendada:**
1. RASA_BOT_EXPLICACION_COMPLETA.md completo (45 min)
2. GUIA_COMPLETA_NUPSI.md - Sección 4.2 (15 min)
3. Código: `rasa-bot/` (práctica)

**Total:** ~1 hora + práctica

---

### Caso 3: "Solo quiero implementar ML en el navegador"
**Ruta recomendada:**
1. MODELOS_ML_EXPLICACION_COMPLETA.md - Secciones 1-4 (30 min)
2. TENSORFLOW_ML_README.md (15 min)
3. Código: `tensorflow-ml.service.ts` (práctica)

**Total:** ~45 min + práctica

---

### Caso 4: "Soy PM y necesito presentar el proyecto"
**Ruta recomendada:**
1. README.md (5 min)
2. RESUMEN_VISUAL_NUPSI.md (20 min)
3. MODELOS_ML_README.md (10 min)
4. GUIA_COMPLETA_NUPSI.md - Sección 1-2 (15 min)

**Total:** ~50 min

---

### Caso 5: "Necesito hacer deployment"
**Ruta recomendada:**
1. README.md - Instalación (10 min)
2. RASA_BOT_EXPLICACION_COMPLETA.md - Sección 7 (15 min)
3. RESUMEN_VISUAL_NUPSI.md - Deployment (10 min)
4. TENSORFLOW_ANDROID_DEPLOYMENT.md (si es Android) (20 min)

**Total:** ~35-55 min

---

## 📈 Estadísticas de Documentación

```
Total de documentos principales: 7
Total de caracteres: ~175,000
Total de palabras: ~22,000
Tiempo de lectura estimado (completo): ~5-6 horas

Distribución por tema:
├─ Arquitectura General: 25%
├─ Rasa Bot: 30%
├─ Machine Learning: 30%
├─ Frontend/Deployment: 10%
└─ Misc: 5%

Niveles cubiertos:
├─ Principiante: ✅✅✅
├─ Intermedio: ✅✅✅
├─ Avanzado: ✅✅✅
└─ Experto: ✅✅✅
```

---

## 🔍 Búsqueda Rápida

### ¿Buscas información sobre...?

**DIETClassifier**
→ RASA_BOT_EXPLICACION_COMPLETA.md - Sección 4.6

**Gemini Integration**
→ RASA_BOT_EXPLICACION_COMPLETA.md - Sección 6
→ GUIA_COMPLETA_NUPSI.md - Sección 4.2.3

**TensorFlow.js**
→ MODELOS_ML_EXPLICACION_COMPLETA.md - Sección 4
→ TENSORFLOW_ML_README.md

**Feature Engineering**
→ MODELOS_ML_EXPLICACION_COMPLETA.md - Sección 5

**Firebase Firestore**
→ GUIA_COMPLETA_NUPSI.md - Sección 3.3
→ MODELOS_ML_README.md - Estructura de Datos

**Políticas de Rasa**
→ RASA_BOT_EXPLICACION_COMPLETA.md - Sección 5

**Entrenamiento de Modelos**
→ MODELOS_ML_EXPLICACION_COMPLETA.md - Sección 6
→ RASA_BOT_EXPLICACION_COMPLETA.md - Sección 7.1

**Deployment**
→ RESUMEN_VISUAL_NUPSI.md - Sección 9
→ RASA_BOT_EXPLICACION_COMPLETA.md - Sección 7.2

---

## 📝 Notas

- Todos los documentos están en **español**
- Los diagramas usan **ASCII art** para máxima compatibilidad
- El código de ejemplo está en **TypeScript** y **Python**
- La documentación sigue el principio de **explicación recursiva** (de simple a complejo)

---

## 📞 Contacto

Para preguntas sobre la documentación:
- **Repositorio:** https://github.com/JawiniSKP/NuPsi
- **Issues:** https://github.com/JawiniSKP/NuPsi/issues

---

**Última actualización:** Noviembre 2025  
**Versión:** 1.0  
**Mantenido por:** Equipo NuPsi

---

## ✨ ¡Empieza Tu Viaje de Aprendizaje!

```
         PRINCIPIANTE                 INTERMEDIO                 AVANZADO
              │                           │                          │
              ▼                           ▼                          ▼
    ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
    │   README.md     │       │  GUIA_COMPLETA  │       │ RESUMEN_VISUAL  │
    │   Sección 1-2   │  →    │   Sección 3     │  →    │   Completo      │
    └─────────────────┘       └─────────────────┘       └─────────────────┘
              │                           │                          │
              ▼                           ▼                          ▼
    ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
    │   Docs básicos  │       │  Docs técnicos  │       │  Código fuente  │
    │   de cada área  │       │   detallados    │       │   + práctica    │
    └─────────────────┘       └─────────────────┘       └─────────────────┘
```

**¡Bienvenido al proyecto NuPsi! 🚀**

