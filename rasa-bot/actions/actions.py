# actions/actions.py

from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet, EventType # Importa EventType para la lógica de fallback

import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

# --- Acciones para manejar el modo Gemini ---

class ActionToggleGeminiMode(Action):
    def name(self) -> Text:
        return "action_toggle_gemini_mode"

    async def run(
        self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]
    ) -> List[Dict[Text, Any]]:
        # La respuesta es manejada por utter_activate_gemini_mode en el dominio
        return [SlotSet("gemini_active", True)]

class ActionStopGeminiMode(Action):
    def name(self) -> Text:
        return "action_stop_gemini_mode"

    async def run(
        self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]
    ) -> List[Dict[Text, Any]]:
        # La respuesta es manejada por utter_deactivate_gemini_mode en el dominio
        return [SlotSet("gemini_active", False)]

# --- Acción para llamar a Gemini directamente ---

class ActionCallGeminiChat(Action):
    def name(self) -> Text:
        return "action_call_gemini_chat"

    async def run(
        self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]
    ) -> List[Dict[Text, Any]]:
        gemini_api_key = os.getenv("GEMINI_API_KEY")

        if not gemini_api_key:
            dispatcher.utter_message(text="Lo siento, no puedo conectarme a Gemini. La clave API no está configurada.")
            return []

        genai.configure(api_key=gemini_api_key)
        model = genai.GenerativeModel('gemini-pro')
        
        user_message = tracker.latest_message['text']
        
        # Opcional: Construir historial de conversación para Gemini
        # Esto es un ejemplo, podrías querer guardar y cargar el historial de otra manera
        history = []
        for event in tracker.events_after_latest_restart():
            if event.get("event") == "user":
                history.append({"role": "user", "content": event.get("text")})
            elif event.get("event") == "bot":
                history.append({"role": "model", "content": event.get("text")})

        try:
            # Puedes decidir si quieres iniciar un nuevo chat o continuar uno existente
            # Para una pregunta directa, un nuevo chat puede ser suficiente si no necesitas contexto
            chat_session = model.start_chat(history=history) # Pasa el historial
            response = await chat_session.send_message_async(user_message)
            dispatcher.utter_message(text=response.text)
        except Exception as e:
            dispatcher.utter_message(text=f"Lo siento, ocurrió un error al comunicarme con Gemini: {e}")

        return []

# --- Acción de Fallback a Gemini ---

class ActionFallbackToGemini(Action):
    def name(self) -> Text:
        return "action_fallback_to_gemini"

    async def run(
        self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]
    ) -> List[Dict[Text, Any]]:
        gemini_api_key = os.getenv("GEMINI_API_KEY")

        if not gemini_api_key:
            dispatcher.utter_message(text="Lo siento, no puedo conectarme a Gemini para el fallback. La clave API no está configurada.")
            return []

        genai.configure(api_key=gemini_api_key)
        model = genai.GenerativeModel('gemini-pro')
        
        user_message = tracker.latest_message['text']
        
        # Es buena idea pasar el historial para el fallback también
        history = []
        for event in tracker.events_after_latest_restart():
            if event.get("event") == "user":
                history.append({"role": "user", "content": event.get("text")})
            elif event.get("event") == "bot":
                history.append({"role": "model", "content": event.get("text")})

        try:
            chat_session = model.start_chat(history=history)
            response = await chat_session.send_message_async(user_message)
            dispatcher.utter_message(text=f"Parece que no entendí eso. Pero Gemini dice: {response.text}")
        except Exception as e:
            dispatcher.utter_message(text=f"Lo siento, ocurrió un error en el fallback con Gemini: {e}")

        return []

# --- Tus otras acciones personalizadas (mantenerlas si las usas) ---
class ActionAnswerSpecificFood(Action):
    def name(self) -> Text:
        return "action_answer_specific_food"
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        # Implementa tu lógica para responder sobre alimentos específicos
        dispatcher.utter_message(text="Implementa lógica para alimentos específicos.")
        return []

class ActionProposeMealPlan(Action):
    def name(self) -> Text:
        return "action_propose_meal_plan"
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        # Implementa tu lógica para proponer un plan de comidas
        dispatcher.utter_message(text="Implementa lógica para plan de comidas.")
        return []

class ActionProposeWorkout(Action):
    def name(self) -> Text:
        return "action_propose_workout"
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        # Implementa tu lógica para proponer un entrenamiento
        dispatcher.utter_message(text="Implementa lógica para entrenamiento.")
        return []

class ActionTrackProgressTip(Action):
    def name(self) -> Text:
        return "action_track_progress_tip"
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        # Implementa tu lógica para dar consejos de seguimiento de progreso
        dispatcher.utter_message(text="Implementa lógica para seguimiento de progreso.")
        return []

class ActionCalculateBmi(Action):
    def name(self) -> Text:
        return "action_calculate_bmi"
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        # Implementa tu lógica para calcular el IMC
        dispatcher.utter_message(text="Implementa lógica para calcular IMC.")
        return []

class ActionProvideRecipe(Action):
    def name(self) -> Text:
        return "action_provide_recipe"
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        # Implementa tu lógica para proporcionar recetas
        dispatcher.utter_message(text="Implementa lógica para recetas.")
        return []