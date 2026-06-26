import os
from google import genai
from dotenv import load_dotenv

# Cargar la clave secreta desde el archivo .env
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("Error: No se encontró la GEMINI_API_KEY en el archivo .env")
    exit()

# Inicializar el nuevo cliente de Gemini
client = genai.Client(api_key=api_key)

# Iniciar el chat con el modelo
chat = client.chats.create(model="gemini-1.5-flash")

print("🤖 Gemini Terminal conectado. (Escribe 'salir' para terminar)")
print("-" * 50)

while True:
    usuario = input("\nTú: ")
    if usuario.lower() in ['salir', 'exit', 'quit']:
        print("¡Nos vemos!")
        break
    
    if usuario.strip() == "":
        continue

    try:
        respuesta = chat.send_message(usuario)
        print(f"\nGemini: {respuesta.text}")
    except Exception as e:
        print(f"\nError: {e}")