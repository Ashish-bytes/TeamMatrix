from google import genai
import os

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def translate_text_arr(text_arr, target):
    prompt = f"""
Translate the following JSON from English to {target}.

IMPORTANT:
- Return ONLY valid JSON.
- Do not add markdown.
- Do not add ```json.
- Keep every JSON key exactly unchanged.
- Translate only the values.
- Preserve the JSON structure exactly.

JSON:
{text_arr}
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )

    return response.text