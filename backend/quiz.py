"""
TeamMatrix Quiz Generator

Uses Gemini when available.
Falls back to a local quiz when Gemini is unavailable
(for example, quota/rate-limit errors).
"""

import json
import os

import google.generativeai as genai
from dotenv import load_dotenv


# Load environment variables BEFORE reading GEMINI_API_KEY
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


# ============================================================
# LOCAL FALLBACK QUIZ
# ============================================================

def fallback_quiz(course, topic, subtopic, description):
    """
    Returns a local quiz so the application remains usable
    when Gemini cannot generate questions.
    """

    subtopic_lower = (subtopic or "").lower()

    # --------------------------------------------------------
    # Machine Learning / Data Science fallback questions
    # --------------------------------------------------------

    if any(
        word in subtopic_lower
        for word in [
            "python",
            "data science",
            "numpy",
            "pandas",
            "machine learning",
            "regression",
            "classification",
            "decision tree",
            "random forest",
            "knn",
            "support vector",
            "evaluation",
            "clustering",
            "pca",
            "gradient descent",
            "feature",
            "preprocessing",
        ]
    ):

        questions = [
            {
                "question": f"What is the main purpose of studying '{subtopic}'?",
                "options": [
                    "To understand concepts and apply them in practical problems",
                    "To replace all programming languages",
                    "To eliminate the need for data",
                    "To avoid testing a model",
                ],
                "answerIndex": 0,
                "reason": (
                    f"Learning {subtopic} is primarily about understanding "
                    "the underlying concepts and applying them correctly."
                ),
            },
            {
                "question": (
                    f"Which approach is generally most useful when learning "
                    f"{subtopic}?"
                ),
                "options": [
                    "Understand the concept and practice it with examples",
                    "Memorize every line of code without understanding it",
                    "Avoid working with examples",
                    "Only read definitions",
                ],
                "answerIndex": 0,
                "reason": (
                    "Conceptual understanding combined with practical "
                    "examples is the most effective way to build skill."
                ),
            },
            {
                "question": (
                    "Why is data preprocessing important in a machine "
                    "learning workflow?"
                ),
                "options": [
                    "It prepares data so models can work with it effectively",
                    "It guarantees 100% model accuracy",
                    "It removes the need for model evaluation",
                    "It makes every dataset identical",
                ],
                "answerIndex": 0,
                "reason": (
                    "Preprocessing can clean, transform, and prepare data "
                    "before it is supplied to a model."
                ),
            },
            {
                "question": (
                    "Which metric is commonly used to measure the "
                    "proportion of correct predictions?"
                ),
                "options": [
                    "Accuracy",
                    "Entropy",
                    "Variance",
                    "Learning rate",
                ],
                "answerIndex": 0,
                "reason": (
                    "Accuracy measures the proportion of predictions "
                    "that are correct."
                ),
            },
            {
                "question": (
                    "Why should a model be evaluated on data that was not "
                    "used for training?"
                ),
                "options": [
                    "To estimate how well it generalizes to unseen data",
                    "To guarantee the training score decreases",
                    "To make the training dataset larger",
                    "To remove all features",
                ],
                "answerIndex": 0,
                "reason": (
                    "Unseen evaluation data helps estimate how well the "
                    "model performs beyond the examples it trained on."
                ),
            },
        ]

        return {
            "questions": questions
        }

    # --------------------------------------------------------
    # Generic fallback for any other topic
    # --------------------------------------------------------

    return {
        "questions": [
            {
                "question": (
                    f"What is the best way to begin understanding "
                    f"{subtopic}?"
                ),
                "options": [
                    "Learn the fundamentals and practice them",
                    "Skip the fundamentals completely",
                    "Memorize answers without understanding",
                    "Avoid practical examples",
                ],
                "answerIndex": 0,
                "reason": (
                    "Strong fundamentals and deliberate practice create "
                    "a solid foundation for learning a new topic."
                ),
            },
            {
                "question": (
                    f"Why is practical application important when learning "
                    f"{subtopic}?"
                ),
                "options": [
                    "It helps connect theory to real problems",
                    "It eliminates the need to learn theory",
                    "It guarantees perfect results",
                    "It makes assessment unnecessary",
                ],
                "answerIndex": 0,
                "reason": (
                    "Practice helps reinforce concepts and shows how they "
                    "are used in real situations."
                ),
            },
            {
                "question": (
                    f"What should a learner do after completing a basic "
                    f"{subtopic} concept?"
                ),
                "options": [
                    "Practice it and check understanding",
                    "Immediately skip to unrelated material",
                    "Stop reviewing it permanently",
                    "Avoid solving problems",
                ],
                "answerIndex": 0,
                "reason": (
                    "Practice and self-checking help confirm that the "
                    "concept has actually been understood."
                ),
            },
        ]
    }


# ============================================================
# GEMINI QUIZ GENERATION
# ============================================================

def get_quiz(course, topic, subtopic, description):

    try:

        # ----------------------------------------------------
        # Check API key
        # ----------------------------------------------------

        if not GEMINI_API_KEY:
            print(
                "GEMINI_API_KEY not found. "
                "Using fallback quiz."
            )

            return fallback_quiz(
                course,
                topic,
                subtopic,
                description,
            )

        # ----------------------------------------------------
        # Gemini generation settings
        # ----------------------------------------------------

        generation_config = {
            "temperature": 1,
            "top_p": 0.95,
            "top_k": 64,
            "max_output_tokens": 20000,
            "response_mime_type": "application/json",
        }

        safety_settings = [
            {
                "category": "HARM_CATEGORY_HARASSMENT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
                "category": "HARM_CATEGORY_HATE_SPEECH",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
                "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE",
            },
        ]

        model = genai.GenerativeModel(
            model_name="gemini-3.6-flash",
            safety_settings=safety_settings,
            generation_config=generation_config,
            system_instruction=(
                "You are an AI agent who provides quizzes to test "
                "understanding of a user on a topic. "
                "The quiz must be based on the course, topic, "
                "subtopic, and description. "
                "Create multiple-choice questions. "
                "Include conceptual and reasoning-based questions. "
                "Return ONLY valid JSON in this exact structure: "
                '{"questions":[{"question":"...",'
                '"options":["...","...","...","..."],'
                '"answerIndex":0,"reason":"..."}]}'
            ),
        )

        chat_session = model.start_chat(history=[])

        response = chat_session.send_message(
            (
                f'The user is learning the course "{course}". '
                f'The topic is "{topic}". '
                f'Create a quiz on the subtopic "{subtopic}". '
                f'The description is "{description}".'
            ),
            stream=False,
        )

        response_text = response.text.strip()

        # ----------------------------------------------------
        # Remove accidental markdown code fences
        # ----------------------------------------------------

        if response_text.startswith("```"):
            response_text = response_text.replace(
                "```json",
                "",
                1
            ).replace(
                "```",
                "",
            ).strip()

        quiz_data = json.loads(response_text)

        # ----------------------------------------------------
        # Validate Gemini response
        # ----------------------------------------------------

        if (
            not isinstance(quiz_data, dict)
            or "questions" not in quiz_data
            or not isinstance(
                quiz_data["questions"],
                list,
            )
            or len(quiz_data["questions"]) == 0
        ):
            raise ValueError(
                "Gemini returned an invalid quiz structure."
            )

        print(
            f"Generated AI quiz with "
            f"{len(quiz_data['questions'])} questions."
        )

        return quiz_data

    except Exception as error:

        # ----------------------------------------------------
        # IMPORTANT:
        # Gemini errors do NOT crash the application anymore.
        # ----------------------------------------------------

        print(
            "Gemini quiz generation failed."
        )

        print(
            f"Reason: {type(error).__name__}: {error}"
        )

        print(
            "Using local fallback quiz."
        )

        return fallback_quiz(
            course,
            topic,
            subtopic,
            description,
        )