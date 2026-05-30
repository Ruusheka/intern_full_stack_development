import os
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '.env'))

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Comprehensive keyword list for intelligent topic detection
ELECTRICAL_KEYWORDS = [
    # Core machines
    "transformer", "motor", "generator", "induction", "synchronous",
    "dc machine", "ac machine", "armature", "stator", "rotor",
    "winding", "commutator", "alternator", "excitation",
    # Electrical fundamentals
    "voltage", "current", "power", "resistance", "capacitance",
    "inductance", "impedance", "reactance", "ohm", "watt",
    "ampere", "volt", "joule", "coulomb", "farad", "henry",
    # Circuit concepts
    "circuit", "series", "parallel", "mesh", "node", "loop",
    "kirchhoff", "thevenin", "norton", "superposition",
    "ac circuit", "dc circuit", "rlc", "rc circuit", "rl circuit",
    # Electromagnetic
    "flux", "emf", "back emf", "torque", "slip", "speed",
    "eddy current", "hysteresis", "magnetic", "electromagnetic",
    "faraday", "lenz", "ampere law", "gauss", "maxwell",
    "permeability", "reluctance", "mmf", "magnetic circuit",
    "magnetic field", "field winding", "pole",
    # Losses and efficiency
    "core loss", "copper loss", "iron loss", "efficiency",
    "regulation", "power factor", "load", "no load", "full load",
    # Motor types and control
    "series motor", "shunt motor", "compound motor",
    "universal motor", "stepper motor", "servo motor",
    "speed control", "starter", "vfd", "drive",
    "single phase", "three phase", "phase", "frequency", "rpm",
    # Power systems
    "power system", "transmission", "distribution", "substation",
    "circuit breaker", "relay", "protection", "fault",
    "short circuit", "grounding", "earthing", "load flow",
    # Transformers
    "autotransformer", "tap changer", "buchholz",
    "instrument transformer", "ct", "pt",
    "turns ratio", "step up", "step down", "coupling",
    # Components
    "bulb", "led", "switch", "battery", "capacitor", "resistor",
    "diode", "transistor", "semiconductor", "thyristor", "scr",
    "igbt", "mosfet", "rectifier", "inverter", "converter",
    "motor","transformer","generator",
    # Measurements
    "ammeter", "voltmeter", "wattmeter", "multimeter",
    "oscilloscope", "galvanometer", "potentiometer", "bridge",
    # Energy and conversion
    "energy", "energy conversion", "electromechanical",
    "coil", "solenoid", "electromagnet", "relay",
    "phasor", "phasor diagram", "vector diagram",
    # General electrical terms
    "electrical", "electric", "electron", "charge",
    "conductor", "insulator", "wire", "cable",
    "ground", "neutral", "line", "terminal",
    "kva", "kw", "kvar", "mva",
]

REJECTION_MESSAGE = (
    "I am designed to answer only Electrical Machines related questions. "
    "Please ask a relevant question."
)

SYSTEM_PROMPT = (
    "You are an expert in Electrical Machines and Electrical Engineering. "
    "You must answer questions related to electrical machines, circuits, wiring, "
    "components (like bulbs, wires, batteries), physics, and all general electrical/electronics concepts. "
    "Consider ANY question about electricity, wiring, or components as valid and related. "
    "Maintain context from previous conversation messages and continue the discussion naturally. "
    "If a question is completely unrelated to anything electrical (e.g., cooking, sports), respond with: "
    "'I am designed to answer only Electrical Machines related questions. "
    "Please ask a relevant question.' "
    "Keep answers concise (4-7 lines) unless explicitly asked for detailed explanation. "
    "Format your response cleanly: use bullet points (•) for lists, "
    "separate paragraphs with line breaks, and use clear structure. "
    "Do NOT use markdown formatting like ** or # symbols."
)


def is_electrical_topic(question_text: str) -> bool:
    """
    Smart topic detection using keyword matching with partial/substring support.
    Handles single words, partial phrases, and indirect references.
    """
    text_lower = question_text.lower().strip()

    # Direct keyword match (substring check)
    if any(kw in text_lower for kw in ELECTRICAL_KEYWORDS):
        return True

    # Check if any individual word from the input matches a keyword
    words = text_lower.split()
    for word in words:
        clean_word = word.strip("?.,!;:'\"")
        if len(clean_word) < 2:
            continue
        for kw in ELECTRICAL_KEYWORDS:
            if clean_word in kw or kw in clean_word:
                return True

    return False


def generate_answer(question_text: str, conversation_history: list = None) -> str:
    """
    Sends the user's question to Gemini with conversation context.
    conversation_history: list of dicts with 'role' and 'text' keys.
    """
    if not GEMINI_API_KEY:
        return "System Error: Gemini API key is missing or invalid."

    # Backend guardrail: reject non-electrical questions
    if not is_electrical_topic(question_text):
        return REJECTION_MESSAGE

    try:
        # Build conversation context from history
        context_block = ""
        if conversation_history:
            context_block = "\n--- Previous Conversation ---\n"
            for msg in conversation_history:
                role_label = "User" if msg["role"] == "user" else "Assistant"
                context_block += f"{role_label}: {msg['text']}\n"
            context_block += "--- End of History ---\n\n"

        prompt = f"{SYSTEM_PROMPT}\n\n{context_block}User Question: {question_text}\nAnswer:"

        # Direct REST API call — works with all key formats (AIza... and AQ...)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}]
        }
        headers = {"Content-Type": "application/json"}

        resp = requests.post(url, json=payload, headers=headers, timeout=30)
        resp.raise_for_status()
        data = resp.json()

        # Extract the generated text from Gemini response
        answer = data["candidates"][0]["content"]["parts"][0]["text"].strip()

        # Clean up markdown artifacts from Gemini output
        answer = answer.replace("**", "")
        answer = answer.replace("##", "")
        answer = answer.replace("# ", "")
        answer = answer.replace("*", "•")

        return answer

    except requests.exceptions.HTTPError as e:
        return f"FULL ERROR: {str(e)}"
    except Exception as e:
        return f"An error occurred while communicating with the AI: {str(e)}"
