# 🤖 Explicación Detallada del Rasa-Bot
## Del Nivel Más Simple al Más Técnico

---

## 📖 Tabla de Contenidos

1. [Nivel Principiante: ¿Qué es un Chatbot?](#nivel-1-principiante)
2. [Nivel Intermedio: Componentes de Rasa](#nivel-2-intermedio)
3. [Nivel Avanzado: Arquitectura Técnica](#nivel-3-avanzado)
4. [Nivel Experto: Implementación y Código](#nivel-4-experto)

---

# Nivel 1: Principiante

## ¿Qué es un Chatbot?

Un **chatbot** es como un **asistente virtual** que puede hablar contigo a través de texto.

### Analogía de la Vida Real:

Imagina que vas a un gimnasio y hablas con un entrenador:

```
👤 Tú: "Hola, quiero bajar de peso"
🏋️ Entrenador: "¡Perfecto! Te recomiendo combinar cardio con dieta balanceada"
👤 Tú: "¿Cuántas veces a la semana?"
🏋️ Entrenador: "3-4 veces está bien para empezar"
```

El chatbot hace **exactamente lo mismo**, pero es un programa de computadora.

### ¿Por qué Rasa?

Existen muchas herramientas para crear chatbots:
- **Dialogflow** (Google)
- **Lex** (Amazon)
- **Rasa** (Open Source)

**NuPsi usa Rasa** porque:
- ✅ Es gratis y de código abierto
- ✅ Funciona en español
- ✅ Permite control total
- ✅ Los datos quedan en tu servidor (privacidad)

---

## Conceptos Básicos Como si Tuvieras 5 Años

### 1. Intent (Intención)

**¿Qué es?** Lo que el usuario **quiere hacer**.

**Analogía:**
Cuando le dices a tu mamá:
- "Tengo hambre" → Intent: quiere_comer
- "Tengo frío" → Intent: quiere_calentarse
- "Quiero jugar" → Intent: quiere_jugar

En el bot:
- "Quiero bajar de peso" → Intent: ask_weight_loss
- "Hola" → Intent: greet
- "Gracias" → Intent: thanks

### 2. Entity (Entidad)

**¿Qué es?** Información **específica** dentro de la frase.

**Analogía:**
"Quiero pizza con **piña** y **jamón**"
- Entidades: piña, jamón

En el bot:
"Quiero ejercicios para **pecho** y **espalda**"
- Entity: muscle_group = pecho
- Entity: muscle_group = espalda

### 3. Slot (Ranura/Memoria)

**¿Qué es?** La **memoria** del bot.

**Analogía:**
```
Mamá: "¿Cómo te llamas?"
Niño: "Juan"
[Mamá recuerda: nombre = Juan]

Mamá (más tarde): "Juan, ven a comer"
[Usó la memoria del nombre]
```

En el bot:
```
Bot: "¿Cuál es tu peso?"
Usuario: "70 kg"
[Slot: weight_kg = 70]

Bot: "¿Cuál es tu altura?"
Usuario: "1.75 m"
[Slot: height_m = 1.75]

Bot: "Con 70 kg y 1.75 m, tu IMC es 22.9"
[Usó los slots para calcular]
```

### 4. Response (Respuesta)

**¿Qué es?** Lo que el bot **dice**.

Simple: Una respuesta predefinida
```yaml
utter_greet:
  - text: "¡Hola! ¿En qué te ayudo?"
```

### 5. Action (Acción)

**¿Qué es?** Algo que el bot **hace** (más allá de solo hablar).

**Analogía:**
- Respuesta: Decir "tu IMC es 22"
- Acción: Calcular el IMC primero, luego decirlo

---

# Nivel 2: Intermedio

## Arquitectura de Rasa

Rasa tiene **dos partes principales**:

```
┌─────────────────────────────────────┐
│         RASA FRAMEWORK              │
├─────────────────────────────────────┤
│  1. RASA NLU                        │
│     (Natural Language Understanding)│
│     ↓                               │
│     Entiende lo que el usuario dice │
│                                     │
│  2. RASA CORE                       │
│     (Dialogue Management)           │
│     ↓                               │
│     Decide qué responder            │
└─────────────────────────────────────┘
```

### Parte 1: Rasa NLU (Entender)

**Objetivo:** Convertir texto en **intención + entidades**

```
Input:  "Quiero ejercicios para pecho"
         ↓
       [NLU]
         ↓
Output: Intent: ask_muscle_group
        Entity: muscle_group = pecho
        Confidence: 0.89
```

#### Pipeline del NLU (Como una Fábrica):

```
Texto del usuario
      ↓
[ 1. WhitespaceTokenizer ]  → Separa palabras
      ↓
[ 2. RegexFeaturizer ]      → Detecta patrones (emails, números)
      ↓
[ 3. CountVectorsFeaturizer ] → Cuenta palabras importantes
      ↓
[ 4. DIETClassifier ]       → Clasifica la intención
      ↓
[ 5. FallbackClassifier ]   → Detecta baja confianza
      ↓
Intent + Entities + Confidence
```

**Ejemplo Paso a Paso:**

```
Input: "Quiero bajar de peso rápido"

Paso 1: WhitespaceTokenizer
["Quiero", "bajar", "de", "peso", "rápido"]

Paso 2: RegexFeaturizer
(No hay patrones especiales)

Paso 3: CountVectorsFeaturizer
{
  "bajar": 1,
  "peso": 1,
  "rápido": 1
}

Paso 4: DIETClassifier
Comparando con ejemplos entrenados...
ask_weight_loss: 0.87 (87% confianza) ✅
ask_exercise: 0.08
ask_diet: 0.05

Paso 5: FallbackClassifier
0.87 > 0.55 (threshold) → OK, no hay fallback

Output:
Intent: ask_weight_loss
Confidence: 0.87
```

### Parte 2: Rasa Core (Decidir)

**Objetivo:** Decidir qué hacer basado en el contexto

```
Intent + Contexto
      ↓
    [CORE]
      ↓
Acción a ejecutar
```

#### Componentes del Core:

**1. Policies (Políticas):**

Son las **estrategias** que el bot usa para decidir:

```yaml
policies:
  - RulePolicy          # Maneja reglas fijas
  - MemoizationPolicy   # Recuerda conversaciones previas
  - TEDPolicy           # Aprende patrones de conversación
```

**Analogía:**

Imagina que eres un mesero en un restaurante:

- **RulePolicy**: "Siempre que alguien dice 'la cuenta', traes la cuenta"
- **MemoizationPolicy**: "Recuerdas que esta mesa ya pidió entrantes"
- **TEDPolicy**: "Aprendes que después del plato principal, suelen pedir postre"

**2. Rules (Reglas):**

Comportamientos que **siempre** pasan:

```yaml
- rule: Saludo
  steps:
    - intent: greet
    - action: utter_greet
```

```
Siempre que usuario diga "hola" → Bot responde "¡Hola!"
```

**3. Stories (Historias):**

Ejemplos de conversaciones:

```yaml
- story: Plan de peso
  steps:
    - intent: greet
    - action: utter_greet
    - intent: ask_weight_loss
    - action: utter_ask_weight_loss
    - intent: affirm
    - action: action_propose_meal_plan
```

**Diferencia entre Rules y Stories:**

| Rules | Stories |
|-------|---------|
| Siempre iguales | Ejemplos de conversación |
| No aprenden | El modelo aprende de ellos |
| "Si X entonces Y" | "Normalmente después de X viene Y" |

**Ejemplo:**

```yaml
# RULE: Siempre que el usuario diga adiós
- rule: Despedida
  steps:
    - intent: goodbye
    - action: utter_goodbye

# STORY: A veces después de agradecer, se van
- story: Usuario agradece y se va
  steps:
    - intent: thanks
    - action: utter_thanks
    - intent: goodbye
    - action: utter_goodbye
```

---

## Flujo de una Conversación Completa

```
1. Usuario escribe mensaje
         ↓
2. NLU procesa el mensaje
   - Tokeniza
   - Extrae features
   - Clasifica intent
   - Extrae entities
         ↓
3. Core decide la acción
   - Consulta reglas
   - Consulta historias
   - Usa el contexto (slots)
         ↓
4. Ejecuta la acción
   - Si es simple: Envía respuesta
   - Si es compleja: Ejecuta código Python
         ↓
5. Actualiza el estado
   - Guarda slots
   - Actualiza historial
         ↓
6. Envía respuesta al usuario
```

### Ejemplo Real:

```
👤 Usuario: "hola"

[NLU]
Input: "hola"
Tokenizer: ["hola"]
DIETClassifier: 
  - greet: 0.95 ✅
  - goodbye: 0.03
  - thanks: 0.02
Output: Intent=greet, Confidence=0.95

[CORE]
Intent: greet
Consulta rules.yml → Encuentra "rule: Saludo"
Decide: Ejecutar utter_greet

[ACTION]
Respuesta: "¡Hola! Soy tu asistente. ¿En qué te ayudo?"

🤖 Bot: "¡Hola! Soy tu asistente. ¿En qué te ayudo?"
```

```
👤 Usuario: "quiero bajar de peso"

[NLU]
Input: "quiero bajar de peso"
Tokenizer: ["quiero", "bajar", "de", "peso"]
DIETClassifier:
  - ask_weight_loss: 0.88 ✅
  - ask_exercise: 0.07
Output: Intent=ask_weight_loss, Confidence=0.88

[CORE]
Intent: ask_weight_loss
Consulta domain.yml → Encuentra utter_ask_weight_loss
Decide: Ejecutar utter_ask_weight_loss

[ACTION]
Respuesta: "Déficit calórico + ejercicio + sueño. ¿Quieres un menú?"

🤖 Bot: "Déficit calórico + ejercicio + sueño. ¿Quieres un menú?"
```

---

# Nivel 3: Avanzado

## Arquitectura Técnica del NLU

### Pipeline Detallado

#### 1. WhitespaceTokenizer

**Función:** Separar el texto en palabras (tokens)

```python
Input:  "Quiero bajar de peso"
Output: ["Quiero", "bajar", "de", "peso"]
```

**Configuración:**
```yaml
- name: WhitespaceTokenizer
```

**¿Por qué es importante?**
- Es el primer paso del procesamiento
- Sin tokenización, el resto no funciona
- En español, funciona bien porque usamos espacios

#### 2. RegexFeaturizer

**Función:** Detectar patrones con expresiones regulares

```python
# Detecta emails
Input: "mi email es user@example.com"
Pattern: \b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b
Feature: has_email = True

# Detecta números
Input: "peso 70 kg"
Pattern: \d+
Feature: has_number = True
```

**Configuración:**
```yaml
- name: RegexFeaturizer
```

#### 3. LexicalSyntacticFeaturizer

**Función:** Extraer características gramaticales

```python
Input: "Quiero bajar de peso"

Features extraídas:
- "Quiero" → Verbo, primera persona
- "bajar" → Verbo infinitivo
- "de"    → Preposición
- "peso"  → Sustantivo
```

**Configuración:**
```yaml
- name: LexicalSyntacticFeaturizer
```

#### 4. CountVectorsFeaturizer

**Función:** Contar frecuencia de palabras (Bag of Words)

```python
Input: "Quiero bajar de peso"

Vocabulario del modelo (aprendido del entrenamiento):
{
  "quiero": 245,
  "bajar": 89,
  "peso": 156,
  "grasa": 87,
  ...
}

Vector generado:
[0, 0, 1, 0, 1, 0, 0, 1, 0, ...]
      ↑      ↑      ↑
   quiero  bajar  peso
```

**Configuración:**
```yaml
# Primera instancia: bag of words normal
- name: CountVectorsFeaturizer

# Segunda instancia: n-grams de caracteres
- name: CountVectorsFeaturizer
  analyzer: "char_wb"
  min_ngram: 1
  max_ngram: 4
```

**Nota:** Se usan dos instancias para capturar diferentes patrones en el texto.

**¿Qué son n-grams?**

```
Input: "bajar"

1-grams: ["b", "a", "j", "a", "r"]
2-grams: ["ba", "aj", "ja", "ar"]
3-grams: ["baj", "aja", "jar"]
4-grams: ["baja", "ajar"]
```

**Beneficio:** Detecta similitud incluso con errores de escritura
```
"bajar" vs "vajar" → Comparten muchos n-grams
```

#### 5. DIETClassifier

**Función:** Clasificar intent y extraer entities (el cerebro)

**DIET = Dual Intent and Entity Transformer**

```python
Input: Features del paso anterior

Arquitectura interna:
┌──────────────────────────────┐
│  Transformer Encoder         │
│  (Similar a BERT pero ligero)│
├──────────────────────────────┤
│  Intent Classification Head  │
│  ↓                           │
│  Softmax sobre N intents     │
├──────────────────────────────┤
│  Entity Recognition Head     │
│  ↓                           │
│  CRF (Conditional Random F.) │
└──────────────────────────────┘

Output:
- Intent: ask_weight_loss (0.88)
- Entities: []
```

**Configuración:**
```yaml
- name: DIETClassifier
  epochs: 100              # Número de iteraciones de entrenamiento
  constrain_similarities: true  # Mejora la generalización
```

**Proceso de Entrenamiento:**

```
Epoch 1/100
  - Loss: 2.45
  - Intent Accuracy: 0.35
  
Epoch 25/100
  - Loss: 1.12
  - Intent Accuracy: 0.72
  
Epoch 50/100
  - Loss: 0.56
  - Intent Accuracy: 0.87
  
Epoch 100/100
  - Loss: 0.23
  - Intent Accuracy: 0.95 ✅
```

#### 6. EntitySynonymMapper

**Función:** Normalizar sinónimos de entities

```python
Definido en nlu.yml:
- synonym: proteínas
  examples: |
    - proteinas
    - proteína
    - protein
    - protes

Usuario dice: "quiero protes"
Entity extraída: "protes"
EntitySynonymMapper: "protes" → "proteínas"
Resultado final: entity = "proteínas"
```

#### 7. FallbackClassifier

**Función:** Detectar cuando el modelo no está seguro

```python
Intent clasificado: ask_weight_loss
Confidence: 0.45

FallbackClassifier:
  threshold: 0.55
  
  if confidence < threshold:
    return nlu_fallback
  
Resultado: Intent = nlu_fallback
```

**Configuración:**
```yaml
- name: FallbackClassifier
  threshold: 0.55               # Mínimo de confianza aceptable
  ambiguity_threshold: 0.05      # Diferencia mínima entre top 2
```

**Ambigüedad:**
```python
Top intents:
1. ask_weight_loss: 0.51
2. ask_exercise: 0.49

Diferencia: 0.51 - 0.49 = 0.02 < 0.05

Resultado: nlu_fallback (están muy empatados)
```

---

## Arquitectura Técnica del Core

### Policies Explicadas

#### 1. RulePolicy

**Función:** Ejecutar reglas definidas en rules.yml

```python
# Algoritmo simplificado
def predict_action(conversation_state):
    for rule in rules:
        if rule.matches(conversation_state):
            return rule.action
    return None
```

**Ejemplo:**
```yaml
- rule: Saludo
  steps:
    - intent: greet
    - action: utter_greet
```

```python
Estado de la conversación:
  last_intent: greet
  
RulePolicy busca reglas que empiecen con:
  - intent: greet
  
Encuentra: "rule: Saludo"
Retorna: utter_greet
```

**Configuración:**
```yaml
- name: RulePolicy
  core_fallback_threshold: 0.4
  fallback_action_name: "action_fallback_to_gemini"
```

#### 2. MemoizationPolicy

**Función:** Recordar conversaciones exactas del entrenamiento

```python
# Base de datos de memoria
conversation_memory = {
  "greet -> ask_capabilities -> thanks": "utter_thanks",
  "greet -> ask_diet -> affirm": "action_propose_meal_plan",
  ...
}

# Predicción
def predict(current_path):
    if current_path in conversation_memory:
        return conversation_memory[current_path]
    return None
```

**Ejemplo:**

Training story:
```yaml
- story: path feliz
  steps:
    - intent: greet
    - action: utter_greet
    - intent: ask_capabilities
    - action: utter_ask_capabilities
```

Conversación nueva:
```
1. User: greet
2. Bot: utter_greet
3. User: ask_capabilities
4. MemoizationPolicy: "He visto este path antes!"
   → Predice: utter_ask_capabilities
```

#### 3. TEDPolicy

**Función:** Aprender patrones de conversación con ML

**TED = Transformer Embedding Dialogue**

```python
Arquitectura:
┌────────────────────────────┐
│  Input: Conversation State │
│  - Historial de intents    │
│  - Historial de actions    │
│  - Slots activos           │
├────────────────────────────┤
│  Transformer Layers        │
│  (Self-attention)          │
├────────────────────────────┤
│  Embedding Layer           │
├────────────────────────────┤
│  Prediction Head           │
│  ↓                         │
│  Softmax sobre acciones    │
└────────────────────────────┘
```

**Configuración:**
```yaml
- name: TEDPolicy
  max_history: 5       # Cuántos turnos atrás considerar
  epochs: 100          # Iteraciones de entrenamiento
  constrain_similarities: true
```

**max_history Explicado:**

```
Conversación:
1. greet
2. utter_greet
3. ask_diet
4. utter_ask_diet
5. affirm
6. action_propose_meal_plan
7. ask_exercise  ← Actual

max_history: 5

TEDPolicy ve:
[ask_diet, utter_ask_diet, affirm, action_propose_meal_plan, ask_exercise]
         ↑───────────────────── últimos 5 ──────────────────────────↑
```

**¿Cómo aprende?**

```python
# Durante entrenamiento
for story in stories:
    for step in story:
        current_state = get_state(step)
        next_action = step.action
        
        # Predice
        predicted = model.predict(current_state)
        
        # Calcula error
        loss = cross_entropy(predicted, next_action)
        
        # Actualiza pesos
        model.backpropagate(loss)
```

---

## Integración con Gemini

### ¿Por qué Gemini?

Rasa es excelente para **conversaciones estructuradas**, pero:
- No puede inventar respuestas nuevas
- No tiene conocimiento general
- Necesita entrenamiento para cada caso

**Gemini** es un **LLM (Large Language Model)** que:
- Tiene conocimiento general
- Puede generar respuestas creativas
- Entiende contexto complejo

### Arquitectura Híbrida: Rasa + Gemini

```
┌─────────────────────────────────────┐
│         USUARIO                     │
└───────────────┬─────────────────────┘
                │ Mensaje
                ↓
┌─────────────────────────────────────┐
│         RASA NLU                    │
│  Clasifica intent + confidence      │
└───────────────┬─────────────────────┘
                │
        ┌───────┴───────┐
        │               │
   Conf > 0.55     Conf < 0.55
        │               │
        ↓               ↓
┌───────────────┐  ┌──────────────┐
│  RASA CORE    │  │   GEMINI     │
│  Respuesta    │  │   Responde   │
│  estructurada │  │   creativamente│
└───────────────┘  └──────────────┘
```

### Implementación Técnica

```python
# actions.py

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
        
        # 2. Configurar Gemini con contexto
        SYSTEM_PERSONA = """
        Eres un asistente experto en NUTRICIÓN, EJERCICIO y BIENESTAR.
        Responde SOLO sobre estos temas.
        NO des diagnósticos médicos.
        """
        
        # 3. Crear prompt
        prompt = f"{SYSTEM_PERSONA}\n\nUsuario: {user_message}"
        
        # 4. Llamar a Gemini
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        try:
            response = await model.generate_content_async(prompt)
            text = response.text.strip()
            
            # 5. Enviar respuesta al usuario
            dispatcher.utter_message(text=text)
            
        except Exception as e:
            dispatcher.utter_message(
                text="Ocurrió un error al procesar tu mensaje."
            )
        
        return []
```

### Flujo de Fallback:

```
👤 Usuario: "¿Cuál es la diferencia entre proteína de suero y caseína?"

[RASA NLU]
Input: "¿Cuál es la diferencia entre proteína de suero y caseína?"
DIETClassifier:
  - ask_specific_food: 0.42
  - ask_diet_general: 0.35
  - out_of_scope: 0.23
Confianza máxima: 0.42 < 0.55 (threshold)

[FALLBACK CLASSIFIER]
Resultado: nlu_fallback

[RASA CORE]
Intent: nlu_fallback
RulePolicy encuentra: "rule: Fallback a Gemini"
Acción: action_fallback_to_gemini

[GEMINI]
Prompt:
"Eres un asistente experto en NUTRICIÓN...
Usuario: ¿Cuál es la diferencia entre proteína de suero y caseína?"

Gemini genera:
"¡Gran pregunta! Ambas son proteínas de la leche, pero tienen diferencias:

🥛 Proteína de Suero (Whey):
- Absorción rápida (1-2 horas)
- Ideal post-entrenamiento
- Rica en BCAAs

🧀 Caseína:
- Absorción lenta (6-8 horas)
- Ideal antes de dormir
- Efecto saciante prolongado

Recomendación: Usa whey después de entrenar y caseína antes de dormir."

[RESPUESTA]
🤖 Bot: [Respuesta de Gemini]
```

---

# Nivel 4: Experto

## Implementación de Custom Actions

### Action para Calcular IMC

```python
# actions/actions.py

from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet

class ActionCalculateBmi(Action):
    """
    Acción personalizada para calcular el IMC del usuario.
    
    Requiere slots:
    - weight_kg: Peso en kilogramos (float)
    - height_m: Altura en metros (float)
    
    Retorna:
    - Mensaje con el IMC calculado e interpretación
    - Limpia los slots después del cálculo
    """
    
    def name(self) -> Text:
        return "action_calculate_bmi"
    
    def run(
        self, 
        dispatcher: CollectingDispatcher, 
        tracker: Tracker, 
        domain: Dict[Text, Any]
    ) -> List[Dict[Text, Any]]:
        
        try:
            # 1. Obtener valores de los slots
            weight = float(tracker.get_slot("weight_kg"))
            height = float(tracker.get_slot("height_m"))
            
            # 2. Validar datos
            if height <= 0:
                raise ValueError("Altura debe ser mayor a 0")
            
            if weight <= 0:
                raise ValueError("Peso debe ser mayor a 0")
            
            # 3. Calcular IMC
            bmi = round(weight / (height ** 2), 2)
            
            # 4. Interpretar resultado
            if bmi < 18.5:
                category = "bajo peso"
                recommendation = (
                    "Estás por debajo del rango saludable. "
                    "Te recomiendo aumentar tu ingesta calórica con "
                    "alimentos nutritivos y hacer ejercicio de fuerza."
                )
            elif 18.5 <= bmi < 25:
                category = "peso normal"
                recommendation = (
                    "¡Excelente! Estás en un rango saludable. "
                    "Mantén tus hábitos actuales."
                )
            elif 25 <= bmi < 30:
                category = "sobrepeso"
                recommendation = (
                    "Tienes un ligero sobrepeso. "
                    "Un déficit calórico moderado y ejercicio regular "
                    "pueden ayudarte a alcanzar un peso saludable."
                )
            else:
                category = "obesidad"
                recommendation = (
                    "Te recomiendo consultar con un nutricionista "
                    "para crear un plan personalizado de alimentación "
                    "y ejercicio."
                )
            
            # 5. Crear mensaje de respuesta
            message = (
                f"📊 Tu IMC es **{bmi}** ({category}).\n\n"
                f"{recommendation}"
            )
            
            # 6. Enviar respuesta
            dispatcher.utter_message(text=message)
            
            # 7. Limpiar slots
            return [
                SlotSet("weight_kg", None),
                SlotSet("height_m", None)
            ]
            
        except (ValueError, TypeError) as e:
            # Manejo de errores
            dispatcher.utter_message(
                text="Necesito peso (kg) y altura (m) válidos para calcular tu IMC. "
                     "Por ejemplo: peso 70 y altura 1.75"
            )
            return []
```

### Action con Integración a API Externa

```python
import requests
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher

class ActionGetNutritionInfo(Action):
    """
    Obtiene información nutricional de alimentos usando API externa.
    """
    
    def name(self) -> Text:
        return "action_get_nutrition_info"
    
    async def run(
        self, 
        dispatcher: CollectingDispatcher, 
        tracker: Tracker, 
        domain: Dict[Text, Any]
    ) -> List[Dict[Text, Any]]:
        
        # 1. Obtener el alimento desde el mensaje o entity
        food = tracker.get_slot("food_name")
        
        if not food:
            # Intentar extraer del mensaje
            entities = tracker.latest_message.get("entities", [])
            for entity in entities:
                if entity.get("entity") == "food":
                    food = entity.get("value")
                    break
        
        if not food:
            dispatcher.utter_message(
                text="¿Qué alimento te interesa? Por ejemplo: manzana, pollo, arroz"
            )
            return []
        
        # 2. Llamar a API de nutrición (ejemplo: USDA FoodData Central)
        API_KEY = "tu_api_key_aqui"
        url = f"https://api.nal.usda.gov/fdc/v1/foods/search"
        
        params = {
            "api_key": API_KEY,
            "query": food,
            "pageSize": 1
        }
        
        try:
            response = requests.get(url, params=params, timeout=5)
            data = response.json()
            
            if data.get("foods"):
                food_data = data["foods"][0]
                
                # Extraer nutrientes
                nutrients = {}
                for nutrient in food_data.get("foodNutrients", []):
                    name = nutrient.get("nutrientName")
                    value = nutrient.get("value", 0)
                    unit = nutrient.get("unitName", "")
                    nutrients[name] = f"{value} {unit}"
                
                # Crear mensaje
                message = f"📊 Información nutricional de {food}:\n\n"
                
                important_nutrients = [
                    "Energy", "Protein", "Total lipid (fat)", 
                    "Carbohydrate, by difference"
                ]
                
                for nutrient in important_nutrients:
                    if nutrient in nutrients:
                        message += f"• {nutrient}: {nutrients[nutrient]}\n"
                
                dispatcher.utter_message(text=message)
            else:
                dispatcher.utter_message(
                    text=f"No encontré información para '{food}'. "
                         "¿Puedes ser más específico?"
                )
        
        except Exception as e:
            print(f"Error al consultar API: {e}")
            dispatcher.utter_message(
                text="Ocurrió un error al buscar la información. "
                     "Intenta de nuevo más tarde."
            )
        
        return []
```

---

## Entrenamiento del Modelo

### Comando de Entrenamiento:

```bash
rasa train
```

**¿Qué pasa internamente?**

```
1. Cargar configuración (config.yml)
2. Cargar dominio (domain.yml)
3. Cargar datos de entrenamiento (data/*.yml)

4. Entrenar NLU:
   a. Crear pipeline según config.yml
   b. Procesar ejemplos de nlu.yml
   c. Entrenar DIETClassifier
      - Epoch 1/100...
      - Epoch 100/100 ✅
   d. Guardar modelo NLU

5. Entrenar Core:
   a. Cargar policies
   b. Procesar stories.yml y rules.yml
   c. Entrenar TEDPolicy
      - Epoch 1/100...
      - Epoch 100/100 ✅
   d. Guardar modelo Core

6. Crear modelo combinado:
   models/20251124-123456-canary-learning.tar.gz
```

### Métricas de Evaluación:

```bash
rasa test
```

**Output:**

```
NLU Evaluation Results:
┌──────────────────┬───────────┬───────────┬──────────┐
│ Intent           │ Precision │ Recall    │ F1-Score │
├──────────────────┼───────────┼───────────┼──────────┤
│ greet            │ 0.98      │ 0.95      │ 0.96     │
│ ask_weight_loss  │ 0.89      │ 0.92      │ 0.90     │
│ ask_diet_general │ 0.87      │ 0.85      │ 0.86     │
│ ...              │ ...       │ ...       │ ...      │
└──────────────────┴───────────┴───────────┴──────────┘

Overall Accuracy: 0.91

Core Evaluation Results:
Story Success Rate: 94%
```

**Interpretación:**

- **Precision**: De las veces que predijo X, ¿cuántas eran correctas?
- **Recall**: De todas las veces que debía predecir X, ¿cuántas encontró?
- **F1-Score**: Promedio armónico de precision y recall

---

## Optimización y Debugging

### 1. Logging y Debugging

```python
# Activar logs detallados
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

class ActionDebugExample(Action):
    def run(self, dispatcher, tracker, domain):
        # Log del estado
        logger.debug(f"Current slots: {tracker.current_slot_values()}")
        logger.debug(f"Latest intent: {tracker.latest_message['intent']}")
        logger.debug(f"Conversation history: {tracker.events}")
        
        # Tu lógica aquí
        ...
```

### 2. Interactive Learning

```bash
rasa interactive
```

Permite **corregir** al bot en tiempo real:

```
Bot: ¿En qué te ayudo?
You: quiero bajar de peso
NLU: ask_weight_loss (0.88)
→ ¿Es correcto? (Y/n): Y

Bot: Déficit calórico + ejercicio...
→ ¿Es la acción correcta? (Y/n): Y

You: dame un plan
NLU: ask_meal_planning (0.72)
→ ¿Es correcto? (Y/n): n
→ ¿Cuál debería ser?: ask_workout_plan

[El sistema aprende de tu corrección]
```

### 3. Mejora de Confianza

**Si el bot no entiende bien:**

```yaml
# Añadir más ejemplos en nlu.yml
- intent: ask_weight_loss
  examples: |
    # Ejemplos existentes
    - quiero bajar de peso
    - cómo adelgazar
    
    # Nuevos ejemplos con variaciones
    - necesito perder kilos
    - ayúdame a perder grasa corporal
    - cómo hago para estar más delgado
    - tips para reducir peso
    - estrategias de pérdida de peso
```

**Regla de oro:** Mínimo **10-15 ejemplos** por intent

---

## Arquitectura de Deployment

```
┌─────────────────────────────────────┐
│         APP MÓVIL (Ionic)           │
│                                     │
│  Usuario chatea →                   │
└───────────────┬─────────────────────┘
                │ HTTP/WebSocket
                ↓
┌─────────────────────────────────────┐
│      SERVIDOR RASA                  │
│                                     │
│  ┌──────────────────────────────┐   │
│  │  RASA Server (puerto 5005)   │   │
│  │  - Recibe mensajes           │   │
│  │  - Ejecuta NLU + Core        │   │
│  │  - Retorna respuestas        │   │
│  └──────────────────────────────┘   │
│                                     │
│  ┌──────────────────────────────┐   │
│  │  Action Server (puerto 5055) │   │
│  │  - Ejecuta custom actions    │   │
│  │  - Llama a Gemini            │   │
│  │  - Consulta APIs externas    │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
                │
                ↓
┌─────────────────────────────────────┐
│      SERVICIOS EXTERNOS             │
│  - Google Gemini API                │
│  - Firebase                         │
│  - APIs de nutrición                │
└─────────────────────────────────────┘
```

### Comandos de Ejecución:

```bash
# Terminal 1: Servidor Rasa
rasa run --enable-api --cors "*"

# Terminal 2: Action Server
rasa run actions

# Terminal 3: App móvil
ionic serve
```

---

## Resumen Técnico

### Stack Tecnológico:

- **Framework**: Rasa 3.1
- **Lenguaje**: Python 3.8+
- **NLU**: DIETClassifier + Transformer
- **Políticas**: RulePolicy + MemoizationPolicy + TEDPolicy
- **IA Avanzada**: Google Gemini (gemini-2.5-flash)
- **Servidor**: Rasa Server + Action Server
- **Base de datos**: Firebase Firestore

### Flujo de Datos Completo:

```
Usuario → App Móvil → HTTP → Rasa Server → NLU → Core → Action Server 
→ (Opcionalmente) Gemini → Response → Core → Rasa Server → HTTP 
→ App Móvil → Usuario
```

### Ventajas de esta Arquitectura:

✅ **Híbrida**: Combina reglas fijas con IA flexible
✅ **Escalable**: Fácil añadir nuevos intents/actions
✅ **Privacidad**: Control total de los datos
✅ **Multilingüe**: Funciona en español
✅ **Open Source**: Sin costos de licencia

---

**¡Ahora eres un experto en el Rasa-Bot de NuPsi!** 🎉

