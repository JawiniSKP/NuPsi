# 🤖 RASA BOT - EXPLICACIÓN COMPLETA
## Del Nivel Más Básico al Más Técnico

---

## 📖 ÍNDICE

1. [¿Qué es un Chatbot? - Para Niños](#1-qué-es-un-chatbot---para-niños)
2. [¿Por qué Rasa? - Nivel Básico](#2-por-qué-rasa---nivel-básico)
3. [Componentes de Rasa - Nivel Intermedio](#3-componentes-de-rasa---nivel-intermedio)
4. [NLU Pipeline - Nivel Avanzado](#4-nlu-pipeline---nivel-avanzado)
5. [Políticas de Diálogo - Nivel Experto](#5-políticas-de-diálogo---nivel-experto)
6. [Integración con Gemini - Arquitectura Híbrida](#6-integración-con-gemini---arquitectura-híbrida)
7. [Training y Deployment](#7-training-y-deployment)

---

## 1. ¿Qué es un Chatbot? - Para Niños

### 🎈 Imagina un Robot que Habla

Un chatbot es como un **robot muy inteligente** que vive en tu computadora o teléfono y puede:

1. **Leer lo que escribes** ✍️
   - "Hola, ¿cómo estás?"
   
2. **Entender qué quieres decir** 🧠
   - "Ah, me está saludando"
   
3. **Pensar en una respuesta** 💭
   - "Debería saludar de vuelta"
   
4. **Responderte** 💬
   - "¡Hola! Estoy muy bien, ¿en qué te puedo ayudar?"

### 🎯 ¿Qué hace diferente a NuPsi Bot?

**Chatbots simples** (como los de las páginas web):
- Solo pueden responder preguntas que ya saben
- Si les dices algo nuevo, se confunden
- No aprenden de ti

**NuPsi Bot con Rasa**:
- Entiende lo que quieres decir aunque lo digas de diferentes formas
- Si no sabe algo, llama a un "experto" (Gemini)
- Puede tener conversaciones largas
- Recuerda lo que hablaron antes

### 🔄 Ejemplo Simple

```
TÚ: "Hola"
BOT: [Lee] → [Entiende: "es un saludo"] → [Decide: "voy a saludar"] 
     → "¡Hola! Soy tu asistente de bienestar"

TÚ: "Quiero bajar de peso"
BOT: [Lee] → [Entiende: "quiere perder peso"] → [Decide: "dar consejo de dieta"]
     → "Para perder peso necesitas un déficit calórico..."

TÚ: "¿Cuántos átomos hay en el universo?"
BOT: [Lee] → [Entiende: "pregunta compleja fuera de mi tema"] 
     → [Decide: "mejor le pregunto a Gemini"]
     → [Gemini responde]
```

---

## 2. ¿Por qué Rasa? - Nivel Básico

### 🤔 Opciones de Chatbots

Cuando quieres hacer un chatbot, tienes varias opciones:

#### **Opción 1: Chatbot Simple con If/Else**

```python
if mensaje == "hola":
    respuesta = "¡Hola!"
elif mensaje == "adiós":
    respuesta = "Hasta luego"
else:
    respuesta = "No entiendo"
```

**Problemas:**
- ❌ Solo entiende palabras exactas
- ❌ "hola" ≠ "Hola" ≠ "holi" ≠ "buenos días"
- ❌ No puede tener conversaciones
- ❌ Necesitas escribir miles de reglas

#### **Opción 2: Solo usar ChatGPT/Gemini**

```python
def chatbot(mensaje):
    respuesta = gemini.ask(mensaje)
    return respuesta
```

**Problemas:**
- ❌ Muy lento (esperar respuesta de internet)
- ❌ Caro (cada mensaje cuesta dinero)
- ❌ Puede responder cosas fuera del tema
- ❌ Inconsistente (respuestas diferentes cada vez)
- ❌ No tienes control del flujo

#### **Opción 3: Rasa (Lo que usa NuPsi) ✅**

```
Rasa Bot + Gemini (cuando es necesario)
```

**Ventajas:**
- ✅ Entiende variaciones de lenguaje
- ✅ Conversaciones naturales
- ✅ Rápido (procesamiento local)
- ✅ Control total del flujo
- ✅ Usa Gemini solo cuando lo necesita
- ✅ Gratis (excepto llamadas a Gemini)
- ✅ Privacidad (datos en tu servidor)

### 🎯 ¿Cómo lo Hace Rasa?

Rasa tiene **2 cerebros**:

#### **Cerebro 1: NLU (Natural Language Understanding)**
- **Trabajo:** Entender qué quiere el usuario
- **Como:** Machine Learning (redes neuronales)
- **Output:** "Intent" (intención) + "Entities" (datos importantes)

```
Usuario: "Quiero ejercicios para pecho"
NLU: 
  - Intent: ask_muscle_group (95% confianza)
  - Entity: muscle_group = "pecho"
```

#### **Cerebro 2: Core (Dialogue Management)**
- **Trabajo:** Decidir qué responder
- **Como:** Reglas + Machine Learning
- **Output:** Acción a ejecutar

```
Intent detectado: ask_muscle_group
Entity: muscle_group = "pecho"
→ Política decide: action_propose_workout
→ Ejecuta acción: Genera rutina de pecho
```

---

## 3. Componentes de Rasa - Nivel Intermedio

### 📁 Estructura de Archivos

```
rasa-bot/
├── config.yml          # ⚙️ Configuración de ML
├── domain.yml          # 📚 Vocabulario del bot
├── endpoints.yml       # 🔌 Conexiones externas
├── credentials.yml     # 🔑 APIs de canales
│
├── data/               # 📊 Datos de entrenamiento
│   ├── nlu.yml         # Ejemplos de frases
│   ├── rules.yml       # Reglas fijas
│   └── stories.yml     # Conversaciones ejemplo
│
├── actions/            # 🎬 Código personalizado
│   ├── __init__.py
│   └── actions.py      # Acciones en Python
│
├── models/             # 🧠 Modelos entrenados
│   └── 20241125-120000.tar.gz
│
└── tests/              # 🧪 Tests de conversaciones
    └── test_stories.yml
```

### 📄 config.yml - La Configuración del Cerebro

Este archivo define **cómo aprende** el bot.

```yaml
language: es  # Idioma español

# PIPELINE NLU: Cómo procesa el lenguaje
pipeline:
  # 1. Divide texto en palabras
  - name: WhitespaceTokenizer
  
  # 2. Detecta patrones (emails, números, URLs)
  - name: RegexFeaturizer
  
  # 3. Extrae características gramaticales
  - name: LexicalSyntacticFeaturizer
  
  # 4. Convierte palabras en números (Bag of Words)
  - name: CountVectorsFeaturizer
  
  # 5. Convierte caracteres en números (n-gramas)
  - name: CountVectorsFeaturizer
    analyzer: "char_wb"
    min_ngram: 1
    max_ngram: 4
  
  # 6. CLASIFICADOR PRINCIPAL (Red Neuronal)
  - name: DIETClassifier
    epochs: 100  # Cuántas veces aprende
    constrain_similarities: true
  
  # 7. Mapea sinónimos
  - name: EntitySynonymMapper
  
  # 8. Detecta cuando NO está seguro
  - name: FallbackClassifier
    threshold: 0.55  # Si confianza < 55% → fallback

# POLÍTICAS: Cómo decide qué hacer
policies:
  # Política 1: Reglas estrictas
  - name: RulePolicy
    core_fallback_threshold: 0.4
    fallback_action_name: "action_fallback_to_gemini"
  
  # Política 2: Memoria de conversaciones exactas
  - name: MemoizationPolicy
  
  # Política 3: ML para generalizar
  - name: TEDPolicy
    max_history: 5  # Recuerda últimos 5 mensajes
    epochs: 100
```

### 📚 domain.yml - El Vocabulario

Define **qué puede entender** y **qué puede decir** el bot.

```yaml
# INTENTS: Lo que el usuario puede querer
intents:
  - greet                    # Saludo
  - goodbye                  # Despedida
  - ask_diet_general         # Consulta de dieta
  - ask_specific_food        # Pregunta sobre alimento
  - express_sadness          # Expresión emocional
  - nlu_fallback            # No entendió (baja confianza)
  - ask_gemini              # Pregunta directa a IA

# ENTITIES: Datos importantes a extraer
entities:
  - macronutrient   # Ej: "proteínas", "carbohidratos"
  - muscle_group    # Ej: "pecho", "piernas"
  - goal           # Ej: "perder grasa"
  - region         # Ej: "Santiago"

# SLOTS: Memoria del bot (variables)
slots:
  macronutrient:
    type: text
    influence_conversation: true
    mappings:
      - type: from_entity
        entity: macronutrient
  
  user_region:
    type: text
    influence_conversation: true
    mappings:
      - type: from_entity
        entity: region
      - type: custom  # Puede ser seteado por código

  latitude:
    type: float
    influence_conversation: false
    mappings:
      - type: custom

# RESPONSES: Respuestas predefinidas
responses:
  utter_greet:
    - text: "¡Hola! Soy tu asistente de nutrición y bienestar."
  
  utter_ask_diet_general:
    - text: "Una dieta saludable se basa en verduras, frutas, proteínas..."

# ACTIONS: Acciones personalizadas
actions:
  - action_answer_specific_food
  - action_propose_meal_plan
  - action_fallback_to_gemini
  - action_call_gemini_chat
  - action_search_nearby_professional

# FORMS: Formularios multi-paso
forms:
  nutrition_profile_form:
    required_slots:
      - user_goal
      - dietary_restrictions
      - activity_level
```

### 📊 data/nlu.yml - Ejemplos de Entrenamiento

Aquí le enseñas al bot **cómo habla la gente**.

```yaml
nlu:
  # Intent 1: Saludos
  - intent: greet
    examples: |
      - hola
      - buenos días
      - buenas tardes
      - hey
      - holi
      - qué tal
      - saludos
      - muy buenos días
      # Con 5-10 ejemplos, el modelo aprende variaciones

  # Intent 2: Consulta de dieta
  - intent: ask_diet_general
    examples: |
      - qué es una dieta saludable
      - cómo comer sano
      - consejos de alimentación
      - qué debo comer
      - ayúdame con mi dieta
      - quiero comer mejor
      - mejora mi alimentación
      - tips de nutrición

  # Intent 3: Alimento específico con entidad
  - intent: ask_specific_food
    examples: |
      - cuántas calorías tiene el [pollo](macronutrient)
      - propiedades del [arroz](macronutrient)
      - beneficios de las [proteínas](macronutrient)
      - info sobre [carbohidratos](macronutrient)
      - qué vitaminas tiene la [manzana](macronutrient)
      # [texto](entidad) marca qué es qué

  # Intent 4: Ejercicios por grupo muscular
  - intent: ask_muscle_group
    examples: |
      - ejercicios para [pecho](muscle_group)
      - rutina de [piernas](muscle_group)
      - cómo entrenar [espalda](muscle_group)
      - entreno de [brazos](muscle_group)
      - quiero trabajar [abdomen](muscle_group)
```

**¿Cómo aprende con estos ejemplos?**

1. **Lee todos los ejemplos** de cada intent
2. **Encuentra patrones comunes**
   - "ejercicios para X", "rutina de X", "entrenar X" → ask_muscle_group
3. **Crea un modelo matemático** (red neuronal)
4. **Cuando llega un mensaje nuevo:**
   - "Dame ejercicios para glúteos"
   - Reconoce el patrón similar
   - Clasifica: ask_muscle_group
   - Extrae: muscle_group = "glúteos"

### 📏 data/rules.yml - Reglas Fijas

Para **flujos determinísticos** que siempre deben funcionar igual.

```yaml
rules:
  # Regla 1: Siempre saluda cuando dice "hola"
  - rule: Saludo por defecto
    steps:
      - intent: greet
      - action: utter_greet

  # Regla 2: Siempre despide cuando dice "adiós"
  - rule: Despedida amable
    steps:
      - intent: goodbye
      - action: utter_goodbye

  # Regla 3: Si no entiende → Gemini
  - rule: Fallback con Gemini
    steps:
      - intent: nlu_fallback
      - action: action_fallback_to_gemini

  # Regla 4: Pregunta directa → Gemini
  - rule: Pregunta directa a Gemini
    steps:
      - intent: ask_gemini
      - action: action_call_gemini_chat

  # Regla 5: Consulta médica → Bloqueo ético
  - rule: Bloqueo Médico
    steps:
      - intent: ask_medical_diagnosis
      - action: action_handle_medical_query
```

**Reglas vs Stories:**
- **Reglas:** SIEMPRE se ejecutan (flujos fijos)
- **Stories:** Son ejemplos para que el ML aprenda (generalización)

### 📖 data/stories.yml - Conversaciones Ejemplo

Ejemplos de **conversaciones completas** para que TEDPolicy aprenda.

```yaml
stories:
  # Historia 1: Flujo completo feliz
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

  # Historia 2: Usuario consulta alimento
  - story: consulta alimento con macronutriente
    steps:
      - intent: ask_specific_food
        entities:
          - macronutrient: proteínas
      - slot_was_set:
          - macronutrient: "proteínas"
      - action: action_answer_specific_food

  # Historia 3: Usuario triste pide apoyo
  - story: user feels sad
    steps:
      - intent: greet
      - action: utter_greet
      - intent: express_sadness
      - action: utter_express_sadness
      - intent: ask_emotional_support
      - action: utter_ask_emotional_support
      - intent: thanks
      - action: utter_thanks
```

**¿Cómo aprende con stories?**

TEDPolicy (Transformer Embedding Dialogue):
1. Lee todas las historias
2. Aprende **patrones de conversación**
3. Generaliza a nuevas situaciones

**Ejemplo:**
```
Historia aprendida:
  greet → utter_greet → ask_capabilities → utter_ask_capabilities

Nueva conversación:
  greet → utter_greet → ask_diet_general → ???

TEDPolicy piensa:
  "Después de greet → utter_greet, viene una pregunta"
  "ask_diet_general es similar a ask_capabilities (ambas son preguntas)"
  "Debería responder con utter_ask_diet_general"
```

---

## 4. NLU Pipeline - Nivel Avanzado

### 🔬 ¿Cómo Procesa el Texto?

Cuando escribes **"Quiero ejercicios para pecho"**, pasa por estos pasos:

#### **Paso 1: WhitespaceTokenizer**

```
Input: "Quiero ejercicios para pecho"
Output: ["Quiero", "ejercicios", "para", "pecho"]
```

Divide el texto en **tokens** (palabras individuales).

#### **Paso 2: RegexFeaturizer**

```
Detecta:
- Emails: user@example.com
- URLs: www.example.com
- Números: 123, 45.6
- Fechas: 25/11/2024
```

Crea **features binarias**:
```
has_number: 0
has_email: 0
has_url: 0
```

#### **Paso 3: LexicalSyntacticFeaturizer**

Extrae características **gramaticales** (POS tags):

```
"Quiero"    → VERB (verbo)
"ejercicios" → NOUN (sustantivo)
"para"      → ADP (preposición)
"pecho"     → NOUN (sustantivo)
```

Matriz de features:
```
[is_verb, is_noun, is_adj, is_adv, ...]
```

#### **Paso 4: CountVectorsFeaturizer (Palabras)**

Crea un **Bag of Words** (bolsa de palabras):

```
Vocabulario aprendido:
{
  "quiero": 1,
  "ejercicios": 2,
  "para": 3,
  "pecho": 4,
  "piernas": 5,
  "rutina": 6,
  ...
}

Vector para "Quiero ejercicios para pecho":
[0, 1, 1, 1, 1, 0, 0, 0, ...]
 ^  ^  ^  ^  ^
 |  |  |  |  |
 |  |  |  |  pecho
 |  |  |  para
 |  |  ejercicios
 |  quiero
 padding
```

#### **Paso 5: CountVectorsFeaturizer (Caracteres)**

Crea n-gramas de **caracteres**:

```
"pecho" con min_ngram=1, max_ngram=4:
1-grams: ["p", "e", "c", "h", "o"]
2-grams: ["pe", "ec", "ch", "ho"]
3-grams: ["pec", "ech", "cho"]
4-grams: ["pech", "echo"]

Vector de caracteres:
[0, 0, 1, 0, 1, 0, 1, ...]
```

**¿Por qué esto?**
Captura similitudes **fonéticas** y **ortográficas**:
- "pecho" ≈ "peto" (comparten "pe")
- "pecho" ≈ "hecho" (comparten "echo")

Útil para:
- Errores de tipeo: "pecoh" → reconoce como "pecho"
- Variaciones: "gym" vs "gimnasio"

#### **Paso 6: DIETClassifier**

**DIET** = Dual Intent Entity Transformer

Es una **red neuronal profunda** que hace 2 cosas:

1. **Clasificación de Intents**
2. **Extracción de Entidades**

**Arquitectura simplificada:**

```
Input Features:
  - Word vectors: [1024 dim]
  - Char vectors: [512 dim]
  - POS tags: [64 dim]
  → Concatenados: [1600 dim]

↓

Transformer Encoder (Capas de Atención):
  Layer 1: Self-Attention + FFN
  Layer 2: Self-Attention + FFN
  Layer 3: Self-Attention + FFN
  → Embeddings contextuales: [1024 dim]

↓ Split ↓

Intent Classification Head:        Entity Extraction Head:
  Dense(512, relu)                   Dense(512, relu)
  Dropout(0.2)                       Dropout(0.2)
  Dense(num_intents, softmax)        Dense(num_entities, softmax)
  
  Output: Probabilidades             Output: Tags BIO
  {                                  [
    "ask_muscle_group": 0.95,          "O",  # Quiero
    "ask_exercise_general": 0.03,      "O",  # ejercicios
    "greet": 0.01,                     "O",  # para
    ...                                 "B-muscle_group"  # pecho
  }                                  ]
```

**Self-Attention (la magia):**

Permite que cada palabra "mire" a las demás:

```
"Quiero ejercicios para pecho"

Atención de "pecho":
  - Mira "ejercicios" (alta atención) → contexto: es sobre ejercicio
  - Mira "para" (media atención) → contexto: es el objeto de "para"
  - Mira "Quiero" (baja atención) → contexto: es lo que se busca

Conclusión: "pecho" en este contexto es muscle_group
```

#### **Paso 7: EntitySynonymMapper**

Mapea **sinónimos** a un valor canónico:

```yaml
# En nlu.yml
- synonym: proteínas
  examples: |
    - proteina
    - protein
    - prote

- synonym: pectorales
  examples: |
    - pecho
    - chest
```

```
Input entity: "pecho"
Output entity: "pectorales" (valor canónico)
```

#### **Paso 8: FallbackClassifier**

Detecta cuando la **confianza es baja**:

```python
max_confidence = 0.42  # Intent más probable
threshold = 0.55

if max_confidence < threshold:
    intent = "nlu_fallback"
    confidence = max_confidence
```

También detecta **ambigüedad**:

```python
top_2_intents = [0.52, 0.48]  # Muy empatados
ambiguity_threshold = 0.05

if abs(top_2_intents[0] - top_2_intents[1]) < ambiguity_threshold:
    intent = "nlu_fallback"
```

### 📊 Output Final del NLU

```json
{
  "text": "Quiero ejercicios para pecho",
  "intent": {
    "name": "ask_muscle_group",
    "confidence": 0.9512
  },
  "entities": [
    {
      "entity": "muscle_group",
      "value": "pectorales",  // Después de EntitySynonymMapper
      "start": 24,
      "end": 29,
      "confidence": 0.98,
      "extractor": "DIETClassifier"
    }
  ],
  "intent_ranking": [
    {"name": "ask_muscle_group", "confidence": 0.9512},
    {"name": "ask_exercise_general", "confidence": 0.0312},
    {"name": "ask_workout_plan", "confidence": 0.0089},
    ...
  ]
}
```

---

## 5. Políticas de Diálogo - Nivel Experto

### 🧠 ¿Cómo Decide qué Hacer?

Después de que NLU entiende el mensaje, **Core** debe decidir la acción.

#### **Políticas Disponibles**

En NuPsi usamos 3 políticas:

```yaml
policies:
  - name: RulePolicy       # Reglas estrictas
  - name: MemoizationPolicy # Memoria exacta
  - name: TEDPolicy        # Machine Learning
```

Cada política **vota** sobre qué acción ejecutar:

```
Intent detectado: ask_muscle_group
Slot: muscle_group = "pectorales"

RulePolicy:     No encuentra regla → Confianza: 0.0
MemoizationPolicy: No encuentra historia exacta → Confianza: 0.0
TEDPolicy:      Encuentra patrón similar → Confianza: 0.89
                Acción: action_propose_workout

GANADOR: TEDPolicy → Ejecuta action_propose_workout
```

### 🎯 1. RulePolicy

Maneja **reglas determinísticas**.

**Ejemplo de regla:**

```yaml
- rule: Fallback con Gemini
  steps:
    - intent: nlu_fallback
    - action: action_fallback_to_gemini
```

**Funcionamiento:**

```python
class RulePolicy:
    def predict_action(self, tracker):
        current_intent = tracker.latest_message['intent']
        
        # Busca regla que coincida
        for rule in self.rules:
            if rule.matches(current_intent):
                return rule.action, confidence=1.0
        
        # No encuentra regla
        return None, confidence=0.0
```

**Características:**
- ✅ Confianza siempre 1.0 (cuando coincide)
- ✅ Predecible (mismo input → mismo output)
- ✅ Prioritario (si hay regla, se ejecuta)
- ❌ No generaliza (solo casos exactos)

### 🧠 2. MemoizationPolicy

Memoriza **conversaciones exactas** de las stories.

**Ejemplo:**

```yaml
- story: user asks about hydration
  steps:
    - intent: greet
    - action: utter_greet
    - intent: ask_hydration
    - action: utter_ask_hydration
```

**Funcionamiento:**

```python
class MemoizationPolicy:
    def __init__(self):
        self.memory = {}  # Diccionario de historias
    
    def train(self, stories):
        for story in stories:
            # Crea hash de la secuencia
            sequence = tuple(story.events)
            next_action = story.next_action
            self.memory[sequence] = next_action
    
    def predict_action(self, tracker):
        # Obtiene últimos N eventos
        recent_events = tuple(tracker.events[-5:])
        
        # Busca en memoria
        if recent_events in self.memory:
            action = self.memory[recent_events]
            return action, confidence=1.0
        
        return None, confidence=0.0
```

**Ejemplo de uso:**

```
Conversación actual:
  [greet, utter_greet, ask_hydration]

Memoria:
  (greet, utter_greet, ask_hydration) → utter_ask_hydration ✓

Coincidencia exacta → Confianza: 1.0
```

**Características:**
- ✅ Muy rápida (lookup en diccionario)
- ✅ Perfecta para flujos conocidos
- ❌ No generaliza (secuencia debe ser exacta)
- ❌ Frágil (un intent diferente rompe la secuencia)

### 🚀 3. TEDPolicy (Transformer Embedding Dialogue)

La política **más poderosa**. Usa **Machine Learning** para generalizar.

**Arquitectura:**

```
Input: Estado del diálogo
  - Intent actual
  - Intents anteriores (history)
  - Entities detectadas
  - Slots actuales
  - Acciones previas

↓

Transformer Encoder:
  - Self-Attention sobre historia
  - Captura contexto de conversación
  - Embeddings de 256 dim

↓

Dialogue Prediction Head:
  - Dense(128, relu)
  - Dropout(0.2)
  - Dense(num_actions, softmax)

↓

Output: Probabilidades de acciones
{
  "action_propose_workout": 0.89,
  "utter_ask_exercise_general": 0.07,
  "action_answer_specific_food": 0.02,
  ...
}
```

**¿Cómo aprende?**

```python
# Durante entrenamiento
for story in training_stories:
    for turn in story:
        # Estado actual
        state = encode_state(turn)
        # Acción correcta (ground truth)
        correct_action = turn.action
        
        # Predicción del modelo
        predicted_probs = model.predict(state)
        
        # Calcula error
        loss = cross_entropy(predicted_probs, correct_action)
        
        # Actualiza pesos
        model.backpropagate(loss)
```

**Ejemplo de generalización:**

```
Historia entrenada:
  greet → utter_greet → ask_diet_general → utter_ask_diet_general

Nueva conversación:
  greet → utter_greet → ask_hydration → ???

TEDPolicy razona:
  "Después de greet y utter_greet vino una pregunta (ask_X)"
  "La acción fue utter_ask_X (responder la pregunta)"
  "Ahora vino ask_hydration (otra pregunta)"
  "Debería responder con utter_ask_hydration"
  
Predicción: utter_ask_hydration (confianza: 0.87)
```

**max_history = 5:**

```python
# Solo considera últimos 5 turnos
history = tracker.events[-5:]
```

**¿Por qué?**
- ✅ Eficiencia (menos datos a procesar)
- ✅ Relevancia (turnos recientes más importantes)
- ❌ Conversaciones muy largas pierden contexto antiguo

### ⚖️ Ensemble de Políticas

Cuando hay **múltiples políticas**, se combinan:

```python
def predict_next_action(tracker):
    predictions = []
    
    # Cada política vota
    for policy in [RulePolicy, MemoizationPolicy, TEDPolicy]:
        action, confidence = policy.predict_action(tracker)
        predictions.append((action, confidence, policy))
    
    # Ordenar por confianza
    predictions.sort(key=lambda x: x[1], reverse=True)
    
    # Prioridad:
    # 1. RulePolicy (si confianza = 1.0)
    if predictions[0][2] == RulePolicy and predictions[0][1] == 1.0:
        return predictions[0][0]
    
    # 2. MemoizationPolicy (si confianza = 1.0)
    if predictions[0][2] == MemoizationPolicy and predictions[0][1] == 1.0:
        return predictions[0][0]
    
    # 3. TEDPolicy
    return predictions[0][0]
```

**Ejemplo real:**

```
Intent: ask_muscle_group
Slot: muscle_group = "pecho"

Votos:
  RulePolicy:         None (0.0) - No hay regla para esto
  MemoizationPolicy:  None (0.0) - No encuentra historia exacta
  TEDPolicy:          action_propose_workout (0.89) - Generalización

Ganador: action_propose_workout (TEDPolicy)
```

### 🆘 Fallback Policy

Si **todas las políticas** tienen confianza baja:

```python
max_confidence = max([p.confidence for p in predictions])

if max_confidence < core_fallback_threshold:  # 0.4
    return fallback_action_name  # action_fallback_to_gemini
```

---

## 6. Integración con Gemini - Arquitectura Híbrida

### 🔀 ¿Por qué Híbrido?

**Rasa solo:**
- ✅ Rápido, preciso para casos conocidos
- ❌ No maneja bien preguntas abiertas
- ❌ Requiere muchos datos de entrenamiento

**Gemini solo:**
- ✅ Maneja cualquier pregunta
- ✅ Conocimiento general
- ❌ Lento (latencia de red)
- ❌ Caro
- ❌ Inconsistente
- ❌ Sin control del flujo

**Rasa + Gemini (Híbrido):**
- ✅ Lo mejor de ambos mundos
- ✅ Rasa para flujos rápidos y conocidos
- ✅ Gemini para preguntas complejas
- ✅ Económico (usa Gemini solo cuando es necesario)

### 🔄 Flujo de Decisión

```
┌─────────────────────────┐
│   Usuario: Mensaje      │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│      RASA NLU           │
│   Clasifica intent      │
└───────────┬─────────────┘
            │
            ▼
      ¿Confianza?
            │
    ┌───────┴───────┐
    │               │
  ALTA            BAJA
(>0.55)         (<0.55)
    │               │
    ▼               ▼
┌───────────┐  ┌──────────────┐
│   RASA    │  │   GEMINI     │
│ Responde  │  │  Fallback    │
└───────────┘  └──────────────┘
```

### 🎯 Escenarios de Uso

#### **Escenario 1: Pregunta Simple → Rasa**

```
Usuario: "Hola"
  ↓
NLU: intent=greet (confianza: 0.99)
  ↓
RulePolicy: greet → utter_greet
  ↓
Respuesta: "¡Hola! Soy tu asistente de bienestar..."
```

**Ventajas:**
- ⚡ Respuesta instantánea (<100ms)
- 💰 Gratis (sin API call)
- ✅ Consistente

#### **Escenario 2: Pregunta Compleja → Gemini**

```
Usuario: "¿Es mejor la dieta keto o intermittent fasting para resistencia a la insulina?"
  ↓
NLU: Intents posibles:
  - ask_diet_general: 0.38
  - ask_weight_loss: 0.22
  - ask_medical_diagnosis: 0.18
  → Máximo: 0.38 < threshold 0.55
  ↓
FallbackClassifier: intent=nlu_fallback
  ↓
RulePolicy: nlu_fallback → action_fallback_to_gemini
  ↓
action_fallback_to_gemini:
  - Construye prompt con SYSTEM_PERSONA
  - Llama a Gemini API
  - Timeout: 30s
  ↓
Gemini responde con análisis detallado
  ↓
Usuario recibe respuesta completa
```

**Ventajas:**
- 🧠 Maneja complejidad
- 📚 Conocimiento actualizado
- 💬 Respuesta natural

#### **Escenario 3: Pregunta Directa → Gemini**

```
Usuario: "gemini, explícame el ciclo de Krebs"
  ↓
NLU: intent=ask_gemini (confianza: 0.95)
  ↓
RulePolicy: ask_gemini → action_call_gemini_chat
  ↓
action_call_gemini_chat:
  - Llama directamente a Gemini
  - Sin fallback
  ↓
Gemini responde
```

### 🛠️ Implementación en Python

```python
# actions/actions.py

import google.generativeai as genai
from rasa_sdk import Action
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet

# Configuración
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# Persona del sistema
SYSTEM_PERSONA = (
    "Eres un asistente experto en NUTRICIÓN, CAMBIOS FÍSICOS, "
    "APOYO EMOCIONAL y BIENESTAR. "
    "Responde SOLO sobre estos temas. "
    "**NUNCA des diagnósticos médicos.**"
    "Responde en español, de manera empática y motivadora."
)

# Acción: Fallback a Gemini
class ActionFallbackToGemini(Action):
    def name(self):
        return "action_fallback_to_gemini"
    
    async def run(self, dispatcher, tracker, domain):
        # Obtener mensaje del usuario
        user_message = tracker.latest_message.get("text", "")
        
        # Construir prompt
        prompt = f"{SYSTEM_PERSONA}\n\nUsuario: {user_message}"
        
        # Llamar a Gemini
        try:
            model = genai.GenerativeModel("gemini-2.5-flash")
            response = await model.generate_content_async(prompt)
            text = response.text.strip()
            
            # Enviar respuesta
            dispatcher.utter_message(text=text)
        
        except asyncio.TimeoutError:
            dispatcher.utter_message(
                text="El modo avanzado tardó demasiado. ¿Intentamos de nuevo?"
            )
        except Exception as e:
            print(f"Error Gemini: {e}")
            dispatcher.utter_message(
                text="Ocurrió un error. Por favor, intenta de nuevo."
            )
        
        return []

# Acción: Chat directo con Gemini
class ActionCallGeminiChat(Action):
    def name(self):
        return "action_call_gemini_chat"
    
    async def run(self, dispatcher, tracker, domain):
        user_message = tracker.latest_message.get("text", "")
        prompt = f"{SYSTEM_PERSONA}\n\nUsuario: {user_message}"
        
        try:
            model = genai.GenerativeModel("gemini-2.5-flash")
            response = await model.generate_content_async(prompt)
            dispatcher.utter_message(text=response.text)
        except Exception as e:
            print(f"Error Gemini Chat: {e}")
            dispatcher.utter_message(text="Error al comunicarme con el modo avanzado.")
        
        return []
```

### 📊 Métricas de Uso

En producción, puedes monitorear:

```python
# Después de cada predicción
metrics = {
    "timestamp": datetime.now(),
    "intent": tracker.latest_message['intent'],
    "confidence": tracker.latest_message['confidence'],
    "action": selected_action,
    "policy": winning_policy,
    "used_gemini": selected_action in [
        "action_fallback_to_gemini",
        "action_call_gemini_chat"
    ],
    "latency_ms": response_time
}

# Guardar en base de datos para análisis
save_metrics(metrics)
```

**Análisis típico:**
```
Total mensajes: 1000
  - Rasa solo: 850 (85%) - Promedio 80ms
  - Gemini fallback: 120 (12%) - Promedio 1.2s
  - Gemini directo: 30 (3%) - Promedio 1.5s

Ahorro vs. solo Gemini:
  - Latencia: 87% más rápido
  - Costo: 85% menos API calls
```

---

## 7. Training y Deployment

### 🏋️ Entrenamiento del Modelo

#### **Paso 1: Preparar Datos**

```bash
cd rasa-bot/

# Validar datos
rasa data validate

# Output esperado:
# ✓ Intents bien definidos
# ✓ Entities consistentes
# ✓ Stories válidas
# ✓ Rules sin conflictos
```

#### **Paso 2: Entrenar**

```bash
# Entrenamiento completo
rasa train

# Solo NLU
rasa train nlu

# Solo Core
rasa train core
```

**Lo que sucede internamente:**

```
[1] Carga config.yml
[2] Carga domain.yml
[3] Carga data/*.yml

[4] ENTRENA NLU:
    - WhitespaceTokenizer: Divide textos
    - CountVectorsFeaturizer: Crea vocabulario
    - DIETClassifier:
      * Prepara datos (X, y)
      * Inicializa red neuronal
      * Entrena 100 epochs
      * Valida en 20% de datos
      * Guarda pesos

[5] ENTRENA CORE:
    - RulePolicy: Compila reglas
    - MemoizationPolicy: Memoriza stories
    - TEDPolicy:
      * Convierte stories en ejemplos
      * Entrena Transformer
      * 100 epochs
      * Guarda pesos

[6] EMPAQUETA MODELO:
    - Crea .tar.gz con:
      * Configuración
      * Pesos de modelos
      * Vocabulario
      * Metadata
    - Guarda en models/

[7] Output:
    models/20241125-120000.tar.gz (50-100 MB)
```

#### **Paso 3: Evaluar**

```bash
# Evaluar NLU
rasa test nlu --nlu data/nlu.yml

# Output: results/intent_report.json
# Métricas:
#   - Precision por intent
#   - Recall por intent
#   - F1-score
#   - Confusion matrix
```

**Ejemplo de reporte:**

```json
{
  "greet": {
    "precision": 0.98,
    "recall": 1.00,
    "f1-score": 0.99,
    "support": 50
  },
  "ask_diet_general": {
    "precision": 0.89,
    "recall": 0.85,
    "f1-score": 0.87,
    "support": 45
  },
  "nlu_fallback": {
    "precision": 0.72,
    "recall": 0.78,
    "f1-score": 0.75,
    "support": 30
  }
}
```

```bash
# Evaluar Core
rasa test core --stories tests/test_stories.yml

# Output: results/failed_test_stories.yml
# Muestra conversaciones donde el bot falló
```

### 🚀 Deployment

#### **Opción 1: Local (Desarrollo)**

```bash
# Terminal 1: Servidor Rasa
rasa run --enable-api --cors "*" --port 5005

# Terminal 2: Action Server
rasa run actions --port 5055
```

**Configuración (endpoints.yml):**

```yaml
action_endpoint:
  url: "http://localhost:5055/webhook"
```

#### **Opción 2: Docker (Producción)**

**Dockerfile.rasa:**

```dockerfile
FROM rasa/rasa:3.6.0

# Copiar archivos
COPY . /app
WORKDIR /app

# Entrenar modelo
RUN rasa train

# Exponer puerto
EXPOSE 5005

# Comando
CMD ["run", "--enable-api", "--cors", "*"]
```

**Dockerfile.actions:**

```dockerfile
FROM python:3.9

# Instalar dependencias
COPY actions/requirements.txt /app/
RUN pip install -r /app/requirements.txt

# Copiar código
COPY actions /app/actions

# Exponer puerto
EXPOSE 5055

# Comando
CMD ["rasa", "run", "actions", "--port", "5055"]
```

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  rasa:
    build:
      context: .
      dockerfile: Dockerfile.rasa
    ports:
      - "5005:5005"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    depends_on:
      - actions

  actions:
    build:
      context: .
      dockerfile: Dockerfile.actions
    ports:
      - "5055:5055"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
```

**Ejecutar:**

```bash
# Construir imágenes
docker-compose build

# Iniciar servicios
docker-compose up

# Verificar
curl http://localhost:5005/
```

### 📈 Mejora Continua

#### **1. Conversational Testing**

```yaml
# tests/test_stories.yml
stories:
  - story: test happy path
    steps:
      - user: |
          hola
        intent: greet
      - action: utter_greet
      - user: |
          qué puedes hacer
        intent: ask_capabilities
      - action: utter_ask_capabilities
```

```bash
rasa test core --stories tests/test_stories.yml
```

#### **2. Monitoreo de Confianza**

```python
# En actions.py
class MonitorConfidence(Action):
    def run(self, dispatcher, tracker, domain):
        intent = tracker.latest_message['intent']
        confidence = intent['confidence']
        
        # Log si confianza baja
        if confidence < 0.70:
            log_low_confidence(
                text=tracker.latest_message['text'],
                intent=intent['name'],
                confidence=confidence
            )
```

#### **3. Análisis de Fallbacks**

```python
# Después de cada fallback a Gemini
if action == "action_fallback_to_gemini":
    # Guardar para revisar
    save_fallback_case(
        text=user_message,
        top_intents=tracker.latest_message['intent_ranking'][:3]
    )
    
# Periódicamente:
# - Revisar casos de fallback
# - Agregar nuevos intents si hay patrones
# - Agregar ejemplos a intents existentes
```

#### **4. Re-entrenamiento**

```bash
# Cada semana/mes:
# 1. Revisar logs de confianza baja
# 2. Agregar ejemplos a nlu.yml
# 3. Re-entrenar
rasa train

# 4. Evaluar mejora
rasa test nlu --nlu data/nlu.yml

# 5. Si mejora → Deploy
# 6. Si empeora → Rollback
```

---

## 🎓 RESUMEN COMPLETO

### Para Niños (5 años):
El bot es como un robot que lee lo que escribes y te responde. A veces sabe la respuesta solo, y a veces le pregunta a un amigo más inteligente (Gemini).

### Para Principiantes (Nivel Básico):
Rasa es un chatbot que entiende lenguaje natural. Usa Machine Learning para clasificar lo que quieres (intents) y extraer información importante (entities). Luego decide qué responder usando reglas y más ML.

### Para Intermedios (Nivel Medio):
Rasa tiene 2 componentes: NLU (entiende lenguaje) y Core (decide acciones). NLU usa DIETClassifier (red neuronal) para clasificación. Core usa 3 políticas (Rule, Memorization, TED) que votan sobre la siguiente acción. Se integra con Gemini para fallback en preguntas complejas.

### Para Avanzados (Nivel Técnico):
NuPsi usa Rasa 3.6+ con pipeline: WhitespaceTokenizer → RegexFeaturizer → LexicalSyntacticFeaturizer → CountVectorsFeaturizer (word + char n-grams) → DIETClassifier (Transformer encoder con dual heads) → EntitySynonymMapper → FallbackClassifier. Core usa ensemble de RulePolicy, MemoizationPolicy y TEDPolicy (Transformer con self-attention sobre dialogue history). Fallback híbrido a Gemini 2.5 Flash con system persona para preguntas out-of-domain o baja confianza (<0.55 threshold). Deployment con Docker compose (rasa + action server).

---

## 📚 RECURSOS ADICIONALES

- **Documentación Oficial Rasa:** https://rasa.com/docs
- **Tutorial Rasa:** https://rasa.com/docs/rasa/playground
- **Gemini API:** https://ai.google.dev/docs
- **Guía Completa NuPsi:** [GUIA_COMPLETA_NUPSI.md](./GUIA_COMPLETA_NUPSI.md)
- **Modelos ML:** [MODELOS_ML_EXPLICACION_COMPLETA.md](./MODELOS_ML_EXPLICACION_COMPLETA.md)

---

## 👨‍💻 AUTOR

**Documentación Técnica del Rasa Bot - NuPsi**
Fecha: Noviembre 2025

---

## 📄 LICENCIA

Este documento es parte del proyecto NuPsi bajo licencia MIT.
