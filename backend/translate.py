import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(
    api_key=os.environ["GEMINI_API_KEY"]
)


def translate_text_arr(text_arr, target):
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash"
    )

    translated = []

    for text in text_arr:
        response = model.generate_content(
            f"Translate the following text to {target}. "
            f"Return only the translated text.\n\n{text}"
        )

        translated.append(response.text)

    return translated