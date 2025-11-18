# NuPsi

NuPsi es una aplicación multiplataforma para bienestar y acompañamiento, que integra un frontend móvil con Ionic/Angular y un backend conversacional basado en Rasa y Gemini. El proyecto está diseñado para ser modular, escalable y fácil de desplegar tanto localmente como en la nube.

## Requisitos previos

- Node.js >= 16
- npm o yarn
- Python >= 3.8
- Docker (opcional, para despliegue)
- Ionic CLI

## Instalación y ejecución rápida

1. Clona el repositorio:
   ```bash
   git clone https://github.com/JawiniSKP/NuPsi.git
   cd NuPsi
   ```
2. Instala dependencias del frontend:
   ```bash
   npm install
   # o
   yarn install
   ```
3. Instala dependencias del bot (Rasa):
   ```bash
   cd rasa-bot
   python -m venv .venv
   .venv\Scripts\activate  # En Windows
   pip install -r requirements.txt
   rasa train
   cd ..
   ```
4. Ejecuta la app y el bot:
   - Ionic: `ionic serve`
   - Rasa: `rasa run --enable-api --cors "*"`
   - Acciones: `rasa run actions`

## Licencia

Este proyecto se distribuye bajo la licencia MIT. Consulta el archivo LICENSE para más detalles.

# Estructura del Proyecto NuPsi

La organización del proyecto NuPsi es la siguiente:
```
📦 NuPsi
├── android/                # Proyecto Android nativo (Gradle, configuración, fuentes)
│   └── app/
│       └── src/
│           ├── main/      # Archivos principales de la app Android (AndroidManifest, assets, java, res)
│           ├── test/      # Pruebas unitarias
│           └── androidTest/ # Pruebas instrumentadas
├── ios/                    # Proyecto iOS nativo (Swift, configuración, recursos)
│   └── App/
├── rasa-bot/               # Backend conversacional con Rasa (Python)
│   ├── actions/            # Acciones personalizadas del bot
│   ├── data/               # Datos de entrenamiento (nlu, reglas, historias)
│   ├── models/             # Modelos entrenados de Rasa
│   ├── tests/              # Pruebas de historias
│   ├── config.yml          # Configuración principal de Rasa
│   ├── credentials.yml     # Credenciales de canales
│   ├── domain.yml          # Definición de intents, entidades y respuestas
│   ├── endpoints.yml       # Endpoints de servicios
│   └── requirements.txt    # Dependencias Python
├── src/                    # Frontend Ionic/Angular
│   ├── app/
│   │   ├── components/     # Componentes reutilizables (ej: menú)
│   │   ├── guards/         # Guardas de rutas y lógica de acceso
│   │   ├── pages/          # Páginas principales de la app (chat, login, perfil, etc.)
│   │   └── services/       # Servicios de negocio y comunicación
│   ├── assets/             # Recursos estáticos (iconos, imágenes)
│   ├── environments/       # Configuración de entornos (dev/prod)
│   └── theme/              # Variables y estilos globales
├── docker/                 # Archivos y configuración para contenedores Docker
├── angular.json            # Configuración Angular
├── package.json            # Dependencias y scripts Node.js
├── README.md               # Documentación principal
└── ...otros archivos de configuración (karma, firebase, tsconfig, etc.)
```

### Descripción de carpetas y archivos principales

- **android/** e **ios/**: Contienen los proyectos nativos para cada plataforma móvil, con sus configuraciones, fuentes y recursos.
- **rasa-bot/**: Incluye todo lo necesario para el chatbot, desde datos de entrenamiento hasta acciones personalizadas y modelos entrenados.
- **src/**: Es el núcleo del frontend, con la estructura modular de Angular/Ionic, páginas, componentes, servicios y recursos.
- **docker/**: Facilita la ejecución y despliegue en contenedores.
- **Archivos raíz**: Configuración de Angular, Node.js, Firebase, TypeScript y documentación.

---

## Aporte Individual

### Javiera Concha

**Rol principal:** Desarrolladora frontend y backend (Ionic/Angular) y gestión de la base de datos.

**Principales contribuciones:**
- Elaboración y desarrollo del frontend con Ionic/Angular (diseño y lógica en `src/`).
- Desarrollo del backend relacionado con la aplicación y configuración de la base de datos.
- Realizó los diseños de UI/UX y la implementación del estilo visual.
- Configuración general del proyecto (archivos de entorno, `environments/`, integración con Firebase/servicios relacionados).
- Implementó y mantuvo la mayor parte del código en `src/` (excepto la parte de diseño/funcionalidad específica del chat-bot manejada por Rasa).

**Commits destacados:**
| Fecha       | Commit ID      | Descripción         |
|------------ |---------------|---------------------|
| 2025-08-25  | 64dfd7d       | Creación inicial del proyecto NuPsi. |
| 2025-11-25  | 4516d26       | Correcciones completas del sistema firebase.json. |

**Evidencias / notas:** código y recursos en `src/`, archivos de configuración y `firebase.json` / `firestore.rules`.  
Repositorio: [NuPsi en GitHub](https://github.com/JawiniSKP/NuPsi)

---

### Jisella Vergara

**Rol principal:** Integración, DevOps y pruebas de calidad.

**Principales contribuciones:**
- Integración de Docker y definición de contenedores para despliegue local y CI (`Dockerfile.*`, `docker/`).
- Levantamiento de servidores y orquestación para que la app y servicios (incluyendo HuggingFace) corran en sus terminales.
- Entrenamiento y soporte del bot Rasa; integración parcial con Gemini.
- Realizó pruebas de calidad y usabilidad; gestionó pruebas con la comunidad (Gym Nazar La Calera).
- Gestión de tareas del proyecto en Trello y coordinación de entregas.

**Commits destacados:**
| Fecha       | Commit ID | Descripción                |
|------------ |---------- |---------------------------|
| 2025-11-25  | 6f21666   | Arreglos en la nube y despliegue. |

**Evidencias / notas:** `Dockerfile.rasa`, `Dockerfile.actions`, carpeta `docker/`, registros de pruebas y resultados de usabilidad.  
Repositorio: [NuPsi en GitHub](https://github.com/JawiniSKP/NuPsi)

---

### Camilo Zamora

**Rol principal:** Desarrollo del backend conversacional (Rasa) e integración de IA.

**Principales contribuciones:**
- Desarrollo del backend de Rasa (mayor parte del contenido de `rasa-bot/`).
- Integración de Rasa con la aplicación Ionic (conexión entre `src/` y `rasa-bot`).
- Configuración e implementación de integraciones con Gemini para la solución de IA.
- Entrenamiento del modelo conversacional y ajuste de prompts, respuestas y flujo de diálogo.
- Desarrollo y estilizado de las interfaces relacionadas al chat; trabajo en `src/pages/` y `src/pages/chat/` para la integración del bot.

**Commits destacados:**
| Fecha       | Commit ID      | Descripción         |
|------------ |----------------|---------------------|
| 2025-10     | (varios)       | Arreglos e integración del bot Rasa. |
| 2025-11-25  | (varios)       | Integración de IA Google Gemini con el bot conversacional. |
| 2025-11-25  | e194b5b        | Actualización del chatbot con corrección de entorno y script. |

**Evidencias / notas:** Revisa `rasa-bot/` (acciones, `data/`, `models/`) y los archivos en `src/app/pages/chat` para ver la integración.  
Repositorio: [NuPsi en GitHub](https://github.com/JawiniSKP/NuPsi)
