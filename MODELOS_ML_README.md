# 🤖 Modelos de Clasificación ML - NuPsi

## 📋 Resumen de Implementación

Se han implementado exitosamente **3 modelos de clasificación de Machine Learning** integrados en el proyecto NuPsi para análisis de bienestar integral del usuario.

---

## 🎯 Funcionalidades Implementadas

### 1. **Formulario Diario ML** (`/ml-daily-form`)
📝 **Descripción:** Formulario multipaso para recolección de datos diarios del usuario

**Datos Recolectados:**
- **Estado Emocional:** Emociones múltiples, estado de ánimo general, nivel de estrés (1-10)
- **Calidad del Sueño:** Horas de sueño, calidad del sueño (1-10)
- **Hábitos Diarios:** Hidratación (vasos de agua), actividad física (tipo y duración)
- **Alimentación:** Número de comidas, calidad de alimentación (1-10)
- **Datos Físicos (Opcional):** Peso, estatura, IMC calculado automáticamente
- **Notas:** Observaciones adicionales del usuario

**Características:**
- Formulario de 5 pasos con barra de progreso
- Validación en tiempo real
- Cálculo automático de IMC
- Diseño responsivo con paleta de colores NuPsi
- Guardado automático en Firebase Firestore
- Generación automática de insights al guardar

---

### 2. **Insights IA Aura** (`/aura-insights`)
✨ **Descripción:** Visualización de insights emocionales generados por modelo de clasificación ML

**Análisis Mostrados:**
- **Clasificación Emocional:**
  - Categoría: Positivo, Neutral, Negativo, Crítico
  - Emoción dominante detectada
  - Tendencia: Mejorando, Estable, Empeorando
  - Nivel de confianza del modelo (0-100%)

- **Puntuación General:** Score de 0-100 con visualización circular

- **Patrones Detectados:**
  - Hidratación baja
  - Sueño insuficiente
  - Actividad física baja
  - Frecuencia de cada patrón

- **Recomendaciones IA:**
  - Clasificadas por área (emocional, física, hábitos, alimentación)
  - Priorizadas (alta, media, baja)
  - Personalizadas según los datos del usuario

**Modelo ML:**
- Análisis de últimos 7 días de datos
- Algoritmo de clasificación emocional
- Detección de patrones mediante análisis estadístico
- Generación automática de recomendaciones

---

### 3. **Bienestar Integral** (`/bienestar-integral`)
💪 **Descripción:** Modelo ML de clasificación de estado general de bienestar

**Análisis Mostrados:**
- **Clasificación General:**
  - Nivel: Óptimo, Bueno, Regular, Bajo, Crítico
  - Score total (0-100)
  - Nivel de confianza del modelo

- **5 Dimensiones del Bienestar:**
  - 💭 **Emocional:** Basado en estado anímico y emociones
  - 💪 **Física:** Actividad física + IMC
  - 🎯 **Hábitos:** Hidratación + sueño
  - 🥗 **Nutrición:** Calidad y frecuencia de comidas
  - 🤝 **Social:** Basado en estado emocional

- **Tendencias:**
  - Semanal: Últimos 7 días
  - Mensual: Últimos 30 días
  - Indicadores: Ascendente, Estable, Descendente

- **Alertas Automáticas:**
  - Emocional crítico
  - Hábitos mejorables
  - Actividad física baja

- **Sistema de Logros:**
  - 7 días de registro consecutivo
  - Meta de hidratación alcanzada
  - Actividad física consistente

**Modelo ML:**
- Análisis de últimos 30 días
- Clasificación multidimensional
- Cálculo ponderado de scores
- Detección automática de logros

---

## 🗄️ Estructura de Datos en Firebase

### Colecciones Creadas

```
usuarios/{userId}/
├── dailyMLInputs/          # Datos diarios del formulario
│   └── {docId}
│       ├── fecha
│       ├── emociones[]
│       ├── estadoAnimo
│       ├── nivelEstres
│       ├── calidadSueno
│       ├── horasSueno
│       ├── vasosAgua
│       ├── actividadFisica
│       ├── tipoActividad
│       ├── duracionActividad
│       ├── comidas
│       ├── calidadAlimentacion
│       ├── peso
│       ├── estatura
│       ├── imc
│       └── notas
│
├── auraInsights/           # Insights generados por IA
│   └── {docId}
│       ├── fecha
│       ├── clasificacionEmocional
│       │   ├── categoria
│       │   ├── confianza
│       │   ├── emocionDominante
│       │   └── tendencia
│       ├── patronesDetectados[]
│       ├── recomendaciones[]
│       └── scoreGeneral
│
└── bienestarIntegral/      # Análisis de bienestar
    └── {docId}
        ├── fecha
        ├── clasificacion
        │   ├── nivel
        │   ├── confianza
        │   └── scoreTotal
        ├── dimensiones
        │   ├── emocional
        │   ├── fisica
        │   ├── habitos
        │   ├── nutricion
        │   └── social
        ├── tendenciaSemanal
        ├── tendenciaMensual
        ├── alertas[]
        └── logros[]
```

---

## 🎨 Diseño y UI/UX

### Paleta de Colores Utilizada
- **Primary:** `#00C6B2` → `#00A8E8` (Gradiente turquesa)
- **Aura Insights:** `#667EEA` → `#764BA2` (Gradiente morado)
- **Bienestar:** `#F093FB` → `#F5576C` (Gradiente rosa)

### Componentes Reutilizados
- Menú inferior (MenuComponent)
- Headers con gradientes
- Tarjetas con bordes izquierdos coloridos
- Progress bars animadas
- Chips con categorías
- Iconos de Ionicons

### Características de Diseño
- ✅ Responsive (móvil first)
- ✅ Animaciones suaves
- ✅ Feedback visual
- ✅ Accesibilidad
- ✅ Consistencia con el diseño existente
- ✅ Optimizado para Capacitor

---

## 📍 Integración en Home

### Cambios Realizados en `home.page.html`

**Antes:** 2 botones
1. "Registro Completo del Día" → `/indicators`
2. "Ver Mis Estadísticas" → `/statistics`

**Después:** 3 botones ML
1. 🤖 **"Formulario Diario ML"** → `/ml-daily-form`
2. ✨ **"Insights IA Aura"** → `/aura-insights`
3. 💪 **"Bienestar Integral"** → `/bienestar-integral`

---

## 🔧 Servicios Implementados

### `ml-classification.service.ts`

**Métodos Principales:**

#### Formulario Diario
- `saveDailyMLInput(input)` - Guarda datos y genera insights automáticamente
- `getDailyMLInputs(userId, dias)` - Obtiene historial de datos

#### IA Aura
- `getLatestAuraInsight(userId)` - Obtiene último insight generado
- `generateAuraInsight(userId)` - Genera nuevo insight (privado, automático)
- `clasificarEstadoEmocional(datos)` - Algoritmo de clasificación ML
- `detectarPatrones(datos)` - Detección de patrones en datos
- `generarRecomendaciones(clasificacion, patrones)` - IA generativa

#### Bienestar Integral
- `getLatestBienestarIntegral(userId)` - Obtiene último análisis
- `generateBienestarIntegral(userId)` - Genera nuevo análisis (privado, automático)
- `calcularDimensiones(datos)` - Calcula 5 dimensiones del bienestar
- `clasificarBienestar(dimensiones)` - Clasificación ML del nivel
- `detectarLogros(datos)` - Sistema de gamificación

#### Utilidades
- `getEstadisticasGenerales(userId)` - Resumen completo
- `calcularRacha(datos)` - Días consecutivos de registro

---

## 🚀 Rutas Agregadas

```typescript
// app.routes.ts
{
  path: 'ml-daily-form',
  loadComponent: () => import('./pages/ml-daily-form/ml-daily-form.page').then(m => m.MlDailyFormPage),
  canActivate: [authGuard]
},
{
  path: 'aura-insights',
  loadComponent: () => import('./pages/aura-insights/aura-insights.page').then(m => m.AuraInsightsPage),
  canActivate: [authGuard]
},
{
  path: 'bienestar-integral',
  loadComponent: () => import('./pages/bienestar-integral/bienestar-integral.page').then(m => m.BienestarIntegralPage),
  canActivate: [authGuard]
}
```

---

## 📊 Algoritmos ML Implementados

### 1. Clasificación Emocional
```typescript
// Basado en ratio de emociones positivas vs negativas
ratioPositivo = emocionesPositivas / totalEmociones

Categorías:
- Positivo: ratio >= 0.7
- Neutral: 0.4 <= ratio < 0.7
- Negativo: 0.2 <= ratio < 0.4
- Crítico: ratio < 0.2
```

### 2. Score General de Bienestar
```typescript
// Ponderación de factores
score = (
  scoreEmocional * 0.30 +
  scoreHidratacion * 0.20 +
  scoreSueno * 0.20 +
  scoreActividad * 0.15 +
  scoreAlimentacion * 0.15
)
```

### 3. Clasificación de Nivel de Bienestar
```typescript
// Basado en score ponderado de 5 dimensiones
scoreTotal = (
  emocional * 0.25 +
  fisica * 0.25 +
  habitos * 0.20 +
  nutricion * 0.15 +
  social * 0.15
)

Niveles:
- Óptimo: score >= 80
- Bueno: 65 <= score < 80
- Regular: 50 <= score < 65
- Bajo: 35 <= score < 50
- Crítico: score < 35
```

---

## ✅ Testing y Validación

### Validaciones Implementadas
- ✅ Autenticación requerida en todas las rutas
- ✅ Validación de formularios en tiempo real
- ✅ Manejo de errores con mensajes al usuario
- ✅ Loading states en todas las operaciones async
- ✅ Validación de datos antes de guardar en Firebase

### Estados Manejados
- Loading inicial
- Sin datos (redirección al formulario)
- Datos parciales (menor confianza del modelo)
- Datos completos (análisis completo)
- Errores de red/Firebase

---

## 🔐 Seguridad

### Reglas de Firebase Requeridas

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /usuarios/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /dailyMLInputs/{docId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /auraInsights/{docId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /bienestarIntegral/{docId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## 📈 Mejoras Futuras Sugeridas

1. **Modelos ML Avanzados:**
   - Integración con TensorFlow.js
   - Predicción de estados futuros
   - Análisis de series temporales

2. **Visualizaciones:**
   - Gráficos de tendencias (Chart.js)
   - Comparativas semanales/mensuales
   - Radar chart de dimensiones

3. **Gamificación:**
   - Sistema de badges
   - Niveles de usuario
   - Retos semanales

4. **Exportación:**
   - PDF de reportes
   - Compartir insights
   - Exportar datos CSV

5. **Notificaciones:**
   - Recordatorios diarios
   - Alertas de tendencias negativas
   - Celebración de logros

---

## 🛠️ Dependencias Utilizadas

- **Angular:** Standalone Components
- **Ionic Framework:** v7+
- **Firebase Firestore:** Base de datos
- **RxJS:** Manejo de observables
- **TypeScript:** Tipado fuerte

---

## 📝 Notas Técnicas

1. **Timestamps:** Todos los datos usan `Timestamp` de Firebase
2. **Observables:** Los datos se suscriben y actualizan en tiempo real
3. **NgZone:** Usado para asegurar detección de cambios
4. **Standalone:** Todos los componentes son standalone (no requieren módulos)
5. **Lazy Loading:** Todas las páginas se cargan bajo demanda

---

## 👨‍💻 Autor

Implementación de Modelos ML para NuPsi
Fecha: Noviembre 2025

---

## 📄 Licencia

Este código es parte del proyecto NuPsi y sigue su licencia principal.
