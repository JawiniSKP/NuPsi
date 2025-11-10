# ============================================================
# actions/actions.py
# Bot de Nutrición, Cambios Físicos y Bienestar
# Integración: Rasa + Google Gemini
# ============================================================
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet, EventType
import os, asyncio
from dotenv import load_dotenv
import google.generativeai as genai
# ============================================================
# 🔹 Cargar variables de entorno
# ============================================================
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# ============================================================
# 🔹 Configuración de Gemini
# ============================================================
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("⚠️  ADVERTENCIA: GEMINI_API_KEY no encontrada en .env")

# ============================================================
# 🔹 Persona del asistente (contexto para Gemini)
# ============================================================
SYSTEM_PERSONA = (
    "Eres un asistente experto en NUTRICIÓN, CAMBIOS FÍSICOS, APOYO EMOCIONAL, "
    "RUTINAS DE EJERCICIO, RECETAS, CONSEJOS DE HÁBITOS y BIENESTAR. "
    "Responde SOLO sobre estos temas. "
    "Si el usuario pide algo fuera de este alcance (por ejemplo política, trámites, vuelos, temas médicos o financieros), "
    "indica amablemente que está fuera de tu ámbito y redirígelo al bienestar/nutrición/entrenamiento. "
    "Responde SIEMPRE en español, de manera empática, con pasos prácticos y tono motivador. "
    "Evita lenguaje técnico innecesario y ofrece soluciones aplicables."
)

# ============================================================
# 🔹 Función asíncrona para llamar a Gemini
# ============================================================
async def _call_gemini_async(model, prompt: str, history=None, timeout=18):
    async def _inner():
        if history:
            chat = model.start_chat(history=history)
            resp = await chat.send_message_async(prompt)
        else:
            resp = await model.generate_content_async(prompt)
        return resp.text.strip() if getattr(resp, "text", None) else "No obtuve respuesta útil."
    return await asyncio.wait_for(_inner(), timeout=timeout)

# ============================================================
# 🔹 Acción: chat directo con Gemini
# ============================================================
class ActionCallGeminiChat(Action):
    def name(self) -> Text:
        return "action_call_gemini_chat"

    async def run(
        self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]
    ) -> List[EventType]:
        if not GEMINI_API_KEY:
            dispatcher.utter_message(text="No puedo conectarme al modo avanzado (falta la clave API).")
            return []

        model = genai.GenerativeModel("gemini-2.5-flash")

        user_message = tracker.latest_message.get("text", "")
        history = []

        # Construir historial de conversación
        for ev in tracker.events_after_latest_restart():
            if ev.get("event") == "user" and ev.get("text"):
                history.append({"role": "user", "parts": [ev.get("text")]})
            elif ev.get("event") == "bot" and ev.get("text"):
                if "error" not in ev.get("text", "").lower():
                    history.append({"role": "model", "parts": [ev.get("text")]})

        prompt = f"{SYSTEM_PERSONA}\n\nUsuario: {user_message}"

        try:
            text = await _call_gemini_async(model, prompt, history=history, timeout=18)
            dispatcher.utter_message(text=text)
        except asyncio.TimeoutError:
            dispatcher.utter_message(text="El modo avanzado tardó demasiado. ¿Intentamos de nuevo?")
        except Exception as e:
            print(f"Error Gemini Chat: {e}")
            dispatcher.utter_message(text="Ocurrió un error al comunicarme con el modo avanzado.")
        return []

# ============================================================
# 🔹 Acción: fallback automático → Gemini
# ============================================================
class ActionFallbackToGemini(Action):
    def name(self) -> Text:
        return "action_fallback_to_gemini"

    async def run(
        self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]
    ) -> List[EventType]:
        if not GEMINI_API_KEY:
            dispatcher.utter_message(text="No puedo conectarme al modo avanzado (falta la clave API).")
            return []

        model = genai.GenerativeModel("gemini-2.5-flash")
        user_message = tracker.latest_message.get("text", "")
        prompt = f"{SYSTEM_PERSONA}\n\nUsuario: {user_message}"

        try:
            text = await _call_gemini_async(model, prompt, history=None, timeout=30)
            dispatcher.utter_message(text=text)
        except asyncio.TimeoutError:
            dispatcher.utter_message(text="No recibí respuesta a tiempo del modo avanzado.")
        except Exception as e:
            print(f"Error Gemini Fallback: {e}")
            dispatcher.utter_message(text="Error en el fallback con el modo avanzado.")
        return []

# ============================================================
# 🔹 Acciones para activar/desactivar modo Gemini
# ============================================================
class ActionToggleGeminiMode(Action):
    def name(self) -> Text: return "action_toggle_gemini_mode"
    async def run(self, d, t, dom): return [SlotSet("gemini_active", True)]

class ActionStopGeminiMode(Action):
    def name(self) -> Text: return "action_stop_gemini_mode"
    async def run(self, d, t, dom): return [SlotSet("gemini_active", False)]

# ============================================================
# 🔹 Acciones del dominio nutricional
# ============================================================

# 1️⃣ Calcular IMC
class ActionCalculateBmi(Action):
    def name(self) -> Text: return "action_calculate_bmi"

    def run(self, d, t, dom):
        try:
            w = float(t.get_slot("weight_kg"))
            h = float(t.get_slot("height_m"))
            if h <= 0: raise ValueError
            bmi = round(w / (h * h), 2)

            msg = f"Tu IMC estimado es **{bmi}**. "
            if bmi < 18.5:
                msg += "Estás por debajo del rango saludable. Revisa tu alimentación y entrenamiento."
            elif 18.5 <= bmi < 25:
                msg += "Estás en un rango saludable 🎯. ¡Sigue así!"
            elif 25 <= bmi < 30:
                msg += "Tienes un ligero sobrepeso. Podríamos ajustar tu plan alimenticio."
            else:
                msg += "Tienes obesidad. Es recomendable planificar un cambio de hábitos sostenido."

            d.utter_message(text=msg)
        except Exception:
            d.utter_message(text="Necesito peso (kg) y estatura (m) válidos para calcular tu IMC.")
        return []

# 2️⃣ Respuesta genérica sobre alimento específico
class ActionAnswerSpecificFood(Action):
    def name(self) -> Text: return "action_answer_specific_food"

    def run(self, d, t, dom):
        food = t.latest_message.get("text", "")
        d.utter_message(text=f"El alimento '{food}' puede tener múltiples beneficios. "
                             f"¿Quieres que te detalle calorías, proteínas o propiedades?")
        return []

# 3️⃣ Plan de comidas
class ActionProposeMealPlan(Action):
    def name(self) -> Text: return "action_propose_meal_plan"

    def run(self, d, t, dom):
        plan = (
            "Plan semanal ejemplo:\n"
            "- 🥣 Desayuno: Avena con leche y frutas\n"
            "- 🍗 Almuerzo: Pollo + arroz integral + ensalada\n"
            "- 🍎 Snack: Yogur + frutos secos\n"
            "- 🥩 Cena: Pescado + verduras al vapor\n"
            "- 💧 Agua: 2–2.5 L/día"
        )
        d.utter_message(text=plan)
        return []

# 4️⃣ Rutina de entrenamiento
class ActionProposeWorkout(Action):
    def name(self) -> Text: return "action_propose_workout"

    def run(self, d, t, dom):
        routine = (
            "Rutina base 3 días:\n"
            "🏋️ Día 1: Piernas y glúteos\n"
            "🏋️ Día 2: Espalda y brazos\n"
            "🏋️ Día 3: Core + cardio 20 min\n"
            "¿Quieres que te la personalice según tu objetivo?"
        )
        d.utter_message(text=routine)
        return []

# 5️⃣ Tip para seguimiento de progreso
class ActionTrackProgressTip(Action):
    def name(self) -> Text: return "action_track_progress_tip"

    def run(self, d, t, dom):
        tip = (
            "📈 Registra tus medidas cada 2 semanas, toma fotos con la misma luz, "
            "y prioriza cómo te sientes más que el número en la balanza."
        )
        d.utter_message(text=tip)
        return []

# 6️⃣ Receta
class ActionProvideRecipe(Action):
    def name(self) -> Text: return "action_provide_recipe"

    def run(self, d, t, dom):
        recipe = (
            "🥗 Receta saludable: Ensalada de quinoa con pollo\n"
            "Ingredientes: quinoa, pechuga, espinaca, tomate, aceite de oliva.\n"
            "Rápida, alta en proteína y baja en grasa. Ideal post entrenamiento."
        )
        d.utter_message(text=recipe)
        return []
