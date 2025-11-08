#!/usr/bin/env bash
# run_rasa_all.sh  —  Lanzador para Rasa + Actions + Test (Git Bash / Windows)

set -e

PROJECT_DIR="$HOME/Desktop/NuPsi/rasa-bot"
VENV_ACTIVATE="$PROJECT_DIR/.venv/Scripts/activate"
ACTIONS_PORT=5055
RASA_PORT=5005

echo "📁 Proyecto: $PROJECT_DIR"
cd "$PROJECT_DIR" || { echo "❌ No pude entrar a $PROJECT_DIR"; exit 1; }

# --- Función: esperar puerto arriba ---
wait_port() {
  local port="$1"
  local name="$2"
  echo "⏳ Esperando a que $name escuche en puerto $port ..."
  for i in {1..60}; do
    if (netstat -ano | grep -E "LISTENING|ESTABLISHED" | grep -q ":$port"); then
      echo "✅ $name está arriba en $port"
      return 0
    fi
    sleep 1
  done
  echo "⚠️  No detecté $name en $port tras 60s (puede igual estar levantando)."
}

# --- Ventana 1: Actions (5055) ---
echo "🚀 Abriendo ventana para Actions (puerto $ACTIONS_PORT)..."
start "Rasa Actions" bash -lc "
  cd \"$PROJECT_DIR\" &&
  source \"$VENV_ACTIVATE\" &&
  echo '🔧 VENV activado (Actions)' &&
  rasa run actions --port $ACTIONS_PORT --debug
"

# --- Ventana 2: Rasa server (5005) ---
echo "🚀 Abriendo ventana para Rasa Server (puerto $RASA_PORT)..."
start "Rasa Server" bash -lc "
  cd \"$PROJECT_DIR\" &&
  source \"$VENV_ACTIVATE\" &&
  echo '🔧 VENV activado (Rasa)' &&
  rasa run --enable-api --cors \"*\"
"

# --- Esperar a que ambos puertos estén arriba ---
wait_port "$ACTIONS_PORT" "Actions"
wait_port "$RASA_PORT" "Rasa Server"

# --- Test REST (webhook REST) ---
echo "🧪 Enviando mensaje de prueba al webhook REST..."
cat > body.json <<'JSON'
{ "sender": "test", "message": "como planificar mis comidas" }
JSON

curl -s -X POST "http://localhost:$RASA_PORT/webhooks/rest/webhook" \
  -H "Content-Type: application/json" \
  --data-binary @body.json | tee test_response.json

echo
echo "📄 Respuesta guardada en: $PROJECT_DIR/test_response.json"
echo "✅ Listo. Deja abiertas las dos ventanas (Actions y Rasa)."
