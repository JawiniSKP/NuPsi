import google.generativeai as genai
import os
from dotenv import load_dotenv

# Carga la API Key desde tu archivo .env
load_dotenv()
gemini_api_key = os.getenv("GEMINI_API_KEY")

if not gemini_api_key:
    print("Error: No se encontró la variable de entorno GEMINI_API_KEY en el archivo .env")
else:
    try:
        genai.configure(api_key=gemini_api_key)
        
        print("Buscando modelos disponibles para 'generateContent'...\n")
        
        model_found = False
        for m in genai.list_models():
          if 'generateContent' in m.supported_generation_methods:
            print(f"-> {m.name}")
            model_found = True

        if not model_found:
            print("No se encontró ningún modelo compatible. Revisa tu API Key y los permisos en tu proyecto de Google Cloud.")

    except Exception as e:
        print(f"Ocurrió un error al conectar con la API de Google: {e}")