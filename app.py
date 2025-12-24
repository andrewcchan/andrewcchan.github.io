import os
import json
import requests
from flask import Flask, send_from_directory, request, jsonify, session

app = Flask(__name__, static_folder=None)
app.secret_key = os.urandom(24)

# In-memory session storage for game history and API keys
# Structure: { session_id: { 'history': [], 'api_key': str } }
game_sessions = {}

DEFAULT_MODEL = "meta-llama/Meta-Llama-3-8B-Instruct"

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    # Prevent directory traversal and access to sensitive files
    if '..' in path or path.endswith('.py') or path.startswith('.'):
         return "Access Denied", 403
    return send_from_directory('.', path)

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_input = data.get('message', '').strip()
    session_id = data.get('session_id')

    if not session_id:
        return jsonify({'error': 'Session ID required'}), 400

    if session_id not in game_sessions:
        game_sessions[session_id] = {
            'history': [],
            'api_key': None
        }

    game_state = game_sessions[session_id]

    # Handle commands
    if user_input.lower().startswith('apikey '):
        parts = user_input.split(' ', 1)
        if len(parts) > 1:
            game_state['api_key'] = parts[1].strip()
            return jsonify({'response': 'API Key set successfully.'})
        else:
            return jsonify({'response': 'Usage: apikey <your_hugging_face_key>'})

    # Handle help/start if history is empty
    if not game_state['history'] and not user_input:
        welcome_msg = (
            "WELCOME TO THE TEXT ADVENTURE GAME.\n"
            "This game uses AI to generate the story.\n"
            "To play, you need a Hugging Face API Key.\n"
            "Enter 'apikey <your_key>' to start.\n"
            "Then, type any command to begin your adventure."
        )
        return jsonify({'response': welcome_msg})

    if not game_state['api_key']:
        return jsonify({'response': 'API Key missing. Please set it using: apikey <your_key>'})

    # Add user input to history
    game_state['history'].append({"role": "user", "content": user_input})

    # Call Hugging Face API
    try:
        response_text = call_hf_api(game_state['history'], game_state['api_key'])
        game_state['history'].append({"role": "assistant", "content": response_text})
        return jsonify({'response': response_text})
    except Exception as e:
        return jsonify({'response': f"Error: {str(e)}"}), 500

def call_hf_api(history, api_key):
    api_url = f"https://router.huggingface.co/models/{DEFAULT_MODEL}"
    headers = {"Authorization": f"Bearer {api_key}"}

    # Construct the prompt from history
    # Llama 3 format: <|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n...<|eot_id|>...

    prompt = "<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n"
    prompt += "You are a dungeon master for a text adventure game. Describe the room and outcomes of actions briefly and vividly. Do not break character.<|eot_id|>"

    for msg in history:
        role = msg['role']
        content = msg['content']
        prompt += f"<|start_header_id|>{role}<|end_header_id|>\n\n{content}<|eot_id|>"

    prompt += "<|start_header_id|>assistant<|end_header_id|>\n\n"

    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 256,
            "temperature": 0.7,
            "top_p": 0.9,
            "stop": ["<|eot_id|>"]
        }
    }

    response = requests.post(api_url, headers=headers, json=payload)

    if response.status_code != 200:
        raise Exception(f"API Error {response.status_code}: {response.text}")

    result = response.json()

    if isinstance(result, list) and len(result) > 0:
        generated_text = result[0].get('generated_text', '')
        # Extract only the new part if the API returns the full prompt
        if generated_text.startswith(prompt):
            generated_text = generated_text[len(prompt):]
        return generated_text.strip()
    elif isinstance(result, dict) and 'error' in result:
         raise Exception(result['error'])
    else:
        return "The spirits are silent..."

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
