# Proyecto de Aplicación Móvil de Bienestar con Rasa y Ionic/Angular

Este repositorio contiene el código fuente para una aplicación móvil de bienestar desarrollada con Ionic/Angular para el frontend y un chatbot de inteligencia artificial basado en Rasa para el backend conversacional.

## Estructura del Proyecto

El proyecto está organizado de la siguiente manera:

- `MOVIL/`: Directorio principal del proyecto.
  - `rasa-bot/`: Contiene todo el código del chatbot de Rasa (Python).
  - `src/`: Contiene el código fuente de la aplicación Ionic/Angular (TypeScript/HTML/CSS).
  - Otros archivos de configuración de Ionic/Angular.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalados los siguientes programas en tu sistema:

1.  **Git:** Para clonar el repositorio y gestionar el control de versiones.
    -   [Descargar Git](https://git-scm.com/downloads)
2.  **Node.js y npm (o Yarn):** Necesario para Ionic/Angular y `concurrently`.
    -   [Descargar Node.js](https://nodejs.org/es/download/) (npm se incluye con Node.js)
    -   Opcional: [Instalar Yarn](https://classic.yarnpkg.com/lang/en/docs/install/)
3.  **Ionic CLI:** La interfaz de línea de comandos de Ionic.
    ```bash
    npm install -g @ionic/cli
    ```
4.  **Python 3.8+ y pip:** Necesario para Rasa.
    -   [Descargar Python](https://www.python.org/downloads/)
    -   Asegúrate de que `pip` esté actualizado: `python -m pip install --upgrade pip`
5.  **Google Gemini API Key:** Necesitarás una clave de API para el chatbot.
    -   [Obtener una API Key de Google Gemini](https://aistudio.google.com/app/apikey)

## Configuración del Proyecto

Sigue estos pasos para configurar y ejecutar el proyecto completo.

### Paso 1: Clonar el Repositorio

Clona este repositorio a tu máquina local:

```bash
git clone <URL_DE_TU_REPOSITORIO>
cd MOVIL
```

### Paso 2: Configuración del Chatbot Rasa (Backend)

1.  **Navega al directorio de Rasa:**
    ```bash
    cd rasa-bot
    ```

2.  **Crear y Activar un Entorno Virtual de Python:**
    Es altamente recomendable usar entornos virtuales para aislar las dependencias de Python.
    ```bash
    python -m venv .venv
    # Para Linux/macOS:
    source .venv/bin/activate
    # Para Windows (PowerShell):
    .\.venv\Scripts\activate
    # Para Windows (CMD):
    .venv\Scripts\activate.bat
    ```

3.  **Instalar las Dependencias de Rasa:**
    ```bash
    pip install -r requirements.txt
    ```
    *(**Nota:** Si aún no has generado `requirements.txt`, hazlo primero: `pip freeze > requirements.txt` mientras el entorno virtual está activo y todas las librerías de Rasa y Gemini están instaladas.)*

4.  **Configurar la API Key de Google Gemini:**
    Crea un archivo llamado `.env` en la **raíz del directorio `rasa-bot`** (al mismo nivel que `config.yml`) y añade tu API Key:
    ```
    # rasa-bot/.env
    GEMINI_API_KEY=TU_API_KEY_DE_GEMINI_AQUI
    ```
    **¡Importante!** No subas este archivo `.env` a Git. Ya debería estar en el `.gitignore` de `rasa-bot`.

5.  **Entrenar el Modelo de Rasa:**
    Esto generará los modelos del chatbot basados en tus archivos de datos y configuración.
    ```bash
    rasa train
    ```

6.  **Volver al directorio principal `MOVIL`:**
    ```bash
    cd ..
    ```

### Paso 3: Configuración de la Aplicación Ionic/Angular (Frontend)

1.  **Navega al directorio de la aplicación (ya deberías estar en `MOVIL`):**
    ```bash
    # Si no estás en MOVIL:
    # cd MOVIL
    ```

2.  **Instalar las dependencias de Node.js:**
    ```bash
    npm install
    # o si usas yarn:
    # yarn install
    ```

3.  **Instalar `concurrently` (para iniciar ambos servidores con un solo comando):**
    ```bash
    npm install concurrently --save-dev
    # o si usas yarn:
    # yarn add concurrently --dev
    ```

4.  **Verificar o Configurar la URL del Bot Rasa:**
    Asegúrate de que la URL de tu bot Rasa esté configurada correctamente en el archivo de entorno de tu aplicación Ionic/Angular.
    Abre `src/environments/environment.ts` y verifica la línea `rasaUrl`:
    ```typescript
    // src/environments/environment.ts
    export const environment = {
      production: false,
      // ... otras configuraciones ...
      rasaUrl: 'http://localhost:5005' // Asegúrate de que apunte a donde Rasa se ejecutará
    };
    ```

### Paso 4: Ejecutar el Proyecto Completo

Para levantar el servidor de desarrollo de Ionic/Angular, el servidor de Rasa Core y el servidor de acciones de Rasa con un solo comando:

1.  **Asegúrate de estar en el directorio principal `MOVIL`**.
2.  **Asegúrate de que el entorno virtual de Rasa esté activo** (ver Paso 2, punto 2). Esto es crucial para que `rasa run...` funcione correctamente desde el script de `concurrently`.
3.  **Ejecuta el script `start:dev` (si lo tienes configurado en `package.json` de tu Ionic App):**

    ```bash
    npm run start:dev
    # o si usas yarn:
    # yarn start:dev
    ```
    *(**Nota:** Asegúrate de que el script `start:dev` en `package.json` de tu frontend esté configurado como te indiqué previamente, incluyendo los `cd rasa-bot` para los comandos de Rasa.)*

    Si no has configurado `start:dev` con `concurrently`, tendrás que abrir tres terminales separadas:

    *   **Terminal 1 (dentro de `rasa-bot`, con entorno virtual activo):**
        ```bash
        rasa run actions
        ```
    *   **Terminal 2 (dentro de `rasa-bot`, con entorno virtual activo):**
        ```bash
        rasa run --enable-api --cors "*"
        ```
    *   **Terminal 3 (dentro de `MOVIL` o `src`, sin entorno virtual Python activo):**
        ```bash
        ionic serve
        ```

¡Con estos pasos, tu aplicación de bienestar y el chatbot de Rasa deberían estar funcionando y listos para ser utilizados!
```
