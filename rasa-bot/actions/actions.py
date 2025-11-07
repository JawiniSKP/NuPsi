# actions/actions.py
from typing import Any, Text, Dict, List

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
from google import genai
import os


class ActionProvideRecipe(Action):
    def name(self) -> Text:
        return "action_provide_recipe"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Aquí iría la lógica para buscar y proporcionar una receta
        # Podrías usar APIs de recetas o una base de datos interna.
        # Por ahora, un ejemplo simple:
        dispatcher.utter_message(text="Claro, ¿qué tipo de receta buscas? Por ejemplo, una ensalada o algo con pollo.")
        # Podrías setear un slot para la preferencia de receta aquí
        return []

class ActionCalculateBMI(Action):
    def name(self) -> Text:
        return "action_calculate_bmi"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Si el bot ha recolectado altura y peso (a través de slots y forms)
        # altura = tracker.get_slot("altura")
        # peso = tracker.get_slot("peso")

        # if altura and peso:
        #     bmi = peso / (altura ** 2)
        #     dispatcher.utter_message(text=f"Tu IMC es {bmi:.2f}.")
        # else:
        dispatcher.utter_message(text="Para calcular tu IMC, necesitaría tu altura en metros y tu peso en kilogramos.")
        return []

# Puedes añadir más acciones aquí para:

# actions/actions.py

from typing import Any, Text, Dict, List

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet

import google.generativeai as genai
import os
from dotenv import load_dotenv # Importar load_dotenv

# Cargar las variables de entorno al iniciar el servidor de acciones
load_dotenv()

# Configurar la API de Gemini una vez al inicio
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel('gemini-pro') # O 'gemini-1.5-pro-latest' si tienes acceso
else:
    print("ADVERTENCIA: GEMINI_API_KEY no encontrada en el archivo .env. Las acciones de Gemini no funcionarán.")
    gemini_model = None


class ActionFallbackToGemini(Action):
    def name(self) -> Text:
        return "action_fallback_to_gemini"

    async def run(
        self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]
    ) -> List[Dict[Text, Any]]:

        user_message = tracker.latest_message['text']
        print(f"DEBUG: Mensaje de usuario para Gemini fallback: '{user_message}'")

        if not gemini_model:
            dispatcher.utter_message(text="Lo siento, el asistente de IA avanzado no está configurado.")
            return []

        # Mejorar el prompt para guiar a Gemini como un asistente de bienestar
        # y manejar el caso de que la pregunta sea irrelevante para bienestar.
        prompt = (
            f"Eres un asistente de bienestar especializado en nutrición, salud física y cambios corporales. "
            f"El usuario ha preguntado: '{user_message}'. "
            f"Responde de manera útil, informativa y amigable, siempre manteniéndote en el rol de asistente de bienestar. "
            f"Si la pregunta está claramente fuera de tu dominio (ej. política, clima, programación), "
            f"debes reconocer que no puedes ayudar con eso y redirigir cortésmente al usuario a temas de bienestar. "
            f"Siempre intenta proporcionar algún valor relacionado con el bienestar si es posible."
        )

        try:
            # Puedes añadir context de la conversación previa si lo deseas.
            # Por ahora, solo enviamos el prompt actual.
            response = await gemini_model.generate_content_async(prompt)
            gemini_text = response.text

            dispatcher.utter_message(text=gemini_text)
            print(f"DEBUG: Respuesta de Gemini: '{gemini_text}'")

        except Exception as e:
            print(f"ERROR: Fallo al llamar a Gemini: {e}")
            dispatcher.utter_message(text="Lo siento, no pude contactar a mi cerebro avanzado en este momento. Por favor, intenta de nuevo.")

        return []
# - Consultar una base de datos de alimentos
# - Dar un plan de entrenamiento personalizado (requiere más slots y lógica)
# - Gestionar el seguimiento de progreso, etc.