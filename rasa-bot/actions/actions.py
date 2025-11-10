# rasa-bot/actions/actions.py

from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet, EventType # <--- IMPORTACIÓN CORREGIDA

import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

# --- Acción para llamar a Gemini directamente ---

class ActionCallGeminiChat(Action):
    def name(self) -> Text:
        return "action_call_gemini_chat"

    async def run(
        self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]
    ) -> List[EventType]:
        gemini_api_key = os.getenv("GEMINI_API_KEY")

        if not gemini_api_key:
            dispatcher.utter_message(text="Lo siento, no puedo conectarme a Gemini. La clave API no está configurada.")
            return []

        genai.configure(api_key=gemini_api_key)
        model = genai.GenerativeModel('gemini-pro-latest')
        
        user_message = tracker.latest_message['text']
        
        # Construir historial de conversación para Gemini en el formato CORRECTO
        history = []
        for event in tracker.events_after_latest_restart():
            if event.get("event") == "user" and event.get("text"):
                history.append({"role": "user", "parts": [event.get("text")]})
            elif event.get("event") == "bot" and event.get("text"):
                # Ignorar respuestas de error para no confundir a Gemini
                if "Lo siento, ocurrió un error" not in event.get("text"):
                    history.append({"role": "model", "parts": [event.get("text")]})

        try:
            chat_session = model.start_chat(history=history)
            response = await chat_session.send_message_async(user_message)
            dispatcher.utter_message(text=response.text)
        except Exception as e:
            print(f"Error al llamar a la API de Gemini: {e}")
            dispatcher.utter_message(text=f"Lo siento, ocurrió un error al comunicarme con Gemini.")

        return []

# --- Acción de Fallback a Gemini ---

class ActionFallbackToGemini(Action):
    def name(self) -> Text:
        return "action_fallback_to_gemini"

    async def run(
        self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]
    ) -> List[EventType]:
        gemini_api_key = os.getenv("GEMINI_API_KEY")

        if not gemini_api_key:
            dispatcher.utter_message(text="Lo siento, no puedo conectarme a Gemini. La clave API no está configurada.")
            return []

        genai.configure(api_key=gemini_api_key)
        model = genai.GenerativeModel('gemini-pro-latest')
        
        user_message = tracker.latest_message['text']
        
        try:
            # Para un fallback, es más simple enviar solo el último mensaje sin historial
            response = model.generate_content(user_message)
            dispatcher.utter_message(text=response.text)
        except Exception as e:
            print(f"Error en el fallback de Gemini: {e}")
            dispatcher.utter_message(text=f"Lo siento, ocurrió un error en el fallback con Gemini.")

        return []


# --- Acciones para manejar el modo Gemini ---

class ActionToggleGeminiMode(Action):
    def name(self) -> Text: return "action_toggle_gemini_mode"
    async def run(self, d: CollectingDispatcher, t: Tracker, dom: Dict[Text, Any]) -> List[EventType]:
        return [SlotSet("gemini_active", True)]

class ActionStopGeminiMode(Action):
    def name(self) -> Text: return "action_stop_gemini_mode"
    async def run(self, d: CollectingDispatcher, t: Tracker, dom: Dict[Text, Any]) -> List[EventType]:
        return [SlotSet("gemini_active", False)]

# --- Tus otras acciones personalizadas (mantenerlas si las usas) ---
class ActionAnswerSpecificFood(Action):
    def name(self) -> Text: return "action_answer_specific_food"
    def run(self, d: CollectingDispatcher, t: Tracker, dom: Dict[Text, Any]) -> List[EventType]:
        d.utter_message(text="Implementa lógica para alimentos específicos.")
        return []

class ActionProposeMealPlan(Action):
    def name(self) -> Text: return "action_propose_meal_plan"
    def run(self, d: CollectingDispatcher, t: Tracker, dom: Dict[Text, Any]) -> List[EventType]:
        d.utter_message(text="Implementa lógica para plan de comidas.")
        return []

class ActionProposeWorkout(Action):
    def name(self) -> Text: return "action_propose_workout"
    def run(self, d: CollectingDispatcher, t: Tracker, dom: Dict[Text, Any]) -> List[EventType]:
        d.utter_message(text="Implementa lógica para entrenamiento.")
        return []

class ActionTrackProgressTip(Action):
    def name(self) -> Text: return "action_track_progress_tip"
    def run(self, d: CollectingDispatcher, t: Tracker, dom: Dict[Text, Any]) -> List[EventType]:
        d.utter_message(text="Implementa lógica para seguimiento de progreso.")
        return []

class ActionCalculateBmi(Action):
    def name(self) -> Text: return "action_calculate_bmi"
    def run(self, d: CollectingDispatcher, t: Tracker, dom: Dict[Text, Any]) -> List[EventType]:
        d.utter_message(text="Implementa lógica para calcular IMC.")
        return []

class ActionProvideRecipe(Action):
    def name(self) -> Text: return "action_provide_recipe"
    def run(self, d: CollectingDispatcher, t: Tracker, dom: Dict[Text, Any]) -> List[EventType]:
        d.utter_message(text="Implementa lógica para recetas.")
        return []