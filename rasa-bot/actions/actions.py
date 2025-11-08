# actions/actions.py
from typing import Any, Text, Dict, List, Optional
import os
import math
import logging
from dotenv import load_dotenv

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet

# --------- LOGGING ----------
logger = logging.getLogger(__name__)

# --------- ENV (Gemini) ----------
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

try:
    import google.generativeai as genai
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        GEMINI_MODEL = genai.GenerativeModel("gemini-1.5-pro")
    else:
        GEMINI_MODEL = None
        logger.warning("GEMINI_API_KEY no encontrado. Fallback a Gemini desactivado.")
except Exception as e:
    GEMINI_MODEL = None
    logger.exception("No se pudo importar/configurar google.generativeai: %s", e)

# ========= Helpers =========
def _to_float(x: Optional[Text]) -> Optional[float]:
    if x is None:
        return None
    try:
        # admite coma decimal
        return float(str(x).replace(",", ".").strip())
    except Exception:
        return None

def _bmi_category(bmi: float) -> Text:
    # OMS
    if bmi < 18.5:
        return "bajo peso"
    if bmi < 25:
        return "normal"
    if bmi < 30:
        return "sobrepeso"
    return "obesidad"

# ========= Acciones =========
class ActionProvideRecipe(Action):
    def name(self) -> Text:
        return "action_provide_recipe"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        recipe_type = tracker.get_slot("recipe_type")
        if not recipe_type:
            dispatcher.utter_message(
                text="¿Qué tipo de receta te gustaría? (ej.: ensalada, pollo, avena, vegetariana)"
            )
            return []

        # Demo estática. Aquí podrías llamar a una API/DB.
        ideas = {
            "ensalada": "Ensalada de garbanzos: garbanzos cocidos, pepino, tomate, cebolla morada, aceite de oliva y limón.",
            "pollo": "Bowl de pollo: pechuga a la plancha, arroz integral, brócoli al vapor y salsa de yogur con limón.",
            "avena": "Overnight oats: avena + leche o bebida vegetal, yogur, chía y fruta. Refrigera 8h.",
            "vegetariana": "Salteado de tofu con verduras y fideos de arroz, salsa de soja baja en sodio y jengibre."
        }
        suggestion = ideas.get(recipe_type.lower(), f"Para {recipe_type}: proteína + verdura + carbo integral + grasa saludable. ¿Algún ingrediente que quieras incluir?")
        dispatcher.utter_message(text=suggestion)
        return []

class ActionCalculateBMI(Action):
    def name(self) -> Text:
        return "action_calculate_bmi"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        weight = _to_float(tracker.get_slot("weight_kg"))
        height = _to_float(tracker.get_slot("height_m"))

        if weight is None or height is None or height <= 0:
            dispatcher.utter_message(
                text="Para calcular tu IMC necesito tus **kilogramos** (`weight_kg`) y **altura en metros** (`height_m`). Ej.: 72 y 1.73."
            )
            return []

        bmi = weight / (height ** 2)
        cat = _bmi_category(bmi)
        dispatcher.utter_message(
            text=f"Tu IMC es **{bmi:.2f}** ({cat}). Recuerda: es una métrica general; conviene mirar % de grasa, perímetros y rendimiento."
        )
        return []

class ActionAnswerSpecificFood(Action):
    def name(self) -> Text:
        return "action_answer_specific_food"

    def run(self, dispatcher, tracker, domain):
        macro = tracker.get_slot("macronutrient")
        text = "Dime el alimento y si te interesan calorías, macros o beneficios."
        if macro:
            text = f"Sobre **{macro}**: equilibra en cada comida. ¿Qué alimento específico quieres analizar?"
        dispatcher.utter_message(text=text)
        return []

class ActionProposeMealPlan(Action):
    def name(self) -> Text:
        return "action_propose_meal_plan"

    def run(self, dispatcher, tracker, domain):
        goal = tracker.get_slot("user_goal") or "general"
        level = tracker.get_slot("activity_level") or "moderada"
        restr = tracker.get_slot("dietary_restrictions") or "ninguna"

        plan = (
            f"Plan base (objetivo: **{goal}**, actividad: **{level}**, restricciones: **{restr}**):\n"
            "- Desayuno: avena + yogur/alternativa + fruta\n"
            "- Comida: proteína magra + 2 porciones de verdura + carbo integral\n"
            "- Cena: proteína + ensalada + grasas saludables\n"
            "- Snacks: fruta, frutos secos, hummus+zanahoria\n"
            "¿Quieres que lo convierta en menú **semanal** con cantidades aprox.?"
        )
        dispatcher.utter_message(text=plan)
        return []

class ActionProposeWorkout(Action):
    def name(self) -> Text:
        return "action_propose_workout"

    def run(self, dispatcher, tracker, domain):
        group = tracker.get_slot("muscle_group") or "cuerpo completo"
        routine = (
            f"Rutina sugerida para **{group}**:\n"
            "- 3–4 ejercicios, 3 series x 8–12 repeticiones, 1–2 RIR.\n"
            "- Añade movilidad y core. Progresión semanal suave."
        )
        dispatcher.utter_message(text=routine)
        return []

class ActionTrackProgressTip(Action):
    def name(self) -> Text:
        return "action_track_progress_tip"

    def run(self, dispatcher, tracker, domain):
        tip = "Registra peso 1–2/semana, medidas cada 2–4 semanas y fotos con mismas condiciones (luz/ángulo)."
        dispatcher.utter_message(text=tip)
        return []

class ActionFallbackToGemini(Action):
    """Fallback semántico con Gemini si el NLU no está seguro."""
    def name(self) -> Text:
        return "action_fallback_to_gemini"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        user_message = tracker.latest_message.get("text", "")
        logger.info("Fallback → Gemini. Texto: %s", user_message)

        if GEMINI_MODEL is None:
            dispatcher.utter_message(text="No entendí bien y mi motor avanzado no está disponible ahora. ¿Puedes reformular?")
            return []

        prompt = (
            "Eres un asistente de bienestar especializado en nutrición, ejercicio y hábitos. "
            "Responde de forma clara, empática y accionable. Si la pregunta está fuera del dominio, "
            "explícalo brevemente y redirígela a un ángulo de bienestar si es razonable.\n\n"
            f"Usuario: {user_message}\n"
            "Respuesta:"
        )

        try:
            resp = GEMINI_MODEL.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "max_output_tokens": 400,
                },
                safety_settings=[  # seguro por defecto
                    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                    {"category": "HARM_CATEGORY_SEXUAL", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                    {"category": "HARM_CATEGORY_DANGEROUS", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                ],
            )
            answer = (resp.text or "").strip()
            if not answer:
                dispatcher.utter_message(text="No estoy seguro esta vez. ¿Puedes darme un poco más de contexto?")
            else:
                dispatcher.utter_message(text=answer)
        except Exception as e:
            logger.exception("Error llamando a Gemini: %s", e)
            dispatcher.utter_message(text="Tu consulta es válida, pero tuve un problema técnico al responderla. ¿La reformulamos brevemente?")
        return []
