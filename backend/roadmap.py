"""
TeamMatrix Roadmap Generator

Uses Gemini when available.
Falls back to a local roadmap when Gemini is unavailable
(for example, quota/rate-limit errors).
"""

import json
import os

import google.generativeai as genai
from dotenv import load_dotenv


# ============================================================
# LOAD ENVIRONMENT
# ============================================================

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


# ============================================================
# LOCAL FALLBACK ROADMAP
# ============================================================

def fallback_roadmap(topic, time, knowledge_level):
    """
    Creates a usable local roadmap when Gemini is unavailable.
    """

    topic_lower = (topic or "").lower()

    # --------------------------------------------------------
    # Machine Learning fallback
    # --------------------------------------------------------

    if any(
        word in topic_lower
        for word in [
            "machine learning",
            "ml",
            "data science",
        ]
    ):

        return {
            "week 1": {
                "topic": "Python and Mathematical Foundations for Machine Learning",
                "subtopics": [
                    {
                        "subtopic": "Python Basics for Data Science",
                        "time": "3 hours",
                        "description": (
                            "Learn essential Python concepts including "
                            "data structures, functions, lambda expressions, "
                            "and module imports."
                        ),
                    },
                    {
                        "subtopic": "NumPy for Scientific Computing",
                        "time": "4 hours",
                        "description": (
                            "Understand N-dimensional arrays, vectorization, "
                            "indexing, broadcasting, and matrix operations."
                        ),
                    },
                    {
                        "subtopic": "Data Manipulation with Pandas",
                        "time": "5 hours",
                        "description": (
                            "Learn Series and DataFrames, indexing, filtering, "
                            "grouping, merging, and loading datasets."
                        ),
                    },
                    {
                        "subtopic": "Linear Algebra and Statistics Fundamentals",
                        "time": "4 hours",
                        "description": (
                            "Understand vectors, matrices, dot products, "
                            "mean, median, variance, standard deviation, "
                            "and probability basics."
                        ),
                    },
                ],
            },
            "week 2": {
                "topic": "Data Preprocessing and Exploratory Data Analysis",
                "subtopics": [
                    {
                        "subtopic": "Data Cleaning and Missing Values",
                        "time": "3 hours",
                        "description": (
                            "Learn to detect and handle missing data, "
                            "duplicate entries, and outliers."
                        ),
                    },
                    {
                        "subtopic": "Data Visualization",
                        "time": "4 hours",
                        "description": (
                            "Create common visualizations such as line plots, "
                            "scatter plots, histograms, and correlation plots."
                        ),
                    },
                    {
                        "subtopic": "Feature Engineering and Scaling",
                        "time": "4 hours",
                        "description": (
                            "Learn feature encoding, normalization, and "
                            "standardization techniques."
                        ),
                    },
                    {
                        "subtopic": "Introduction to Scikit-Learn",
                        "time": "5 hours",
                        "description": (
                            "Understand dataset splitting, preprocessing "
                            "pipelines, model fitting, and prediction."
                        ),
                    },
                ],
            },
            "week 3": {
                "topic": "Supervised Machine Learning",
                "subtopics": [
                    {
                        "subtopic": "Linear and Logistic Regression",
                        "time": "4 hours",
                        "description": (
                            "Learn regression, classification, cost functions, "
                            "and gradient descent."
                        ),
                    },
                    {
                        "subtopic": "Decision Trees and Random Forests",
                        "time": "5 hours",
                        "description": (
                            "Understand tree-based decision making, entropy, "
                            "Gini impurity, and ensemble learning."
                        ),
                    },
                    {
                        "subtopic": "K-Nearest Neighbors and Support Vector Machines",
                        "time": "3 hours",
                        "description": (
                            "Learn distance-based classification, hyperplanes, "
                            "margins, and kernel methods."
                        ),
                    },
                    {
                        "subtopic": "Model Evaluation Metrics",
                        "time": "4 hours",
                        "description": (
                            "Master Accuracy, Precision, Recall, F1-score, "
                            "Confusion Matrix, MSE, RMSE, and R-squared."
                        ),
                    },
                ],
            },
            "week 4": {
                "topic": "Unsupervised Learning and End-to-End Project",
                "subtopics": [
                    {
                        "subtopic": "K-Means and Hierarchical Clustering",
                        "time": "4 hours",
                        "description": (
                            "Learn clustering techniques and methods for "
                            "selecting suitable numbers of clusters."
                        ),
                    },
                    {
                        "subtopic": "Dimensionality Reduction with PCA",
                        "time": "3 hours",
                        "description": (
                            "Understand Principal Component Analysis and "
                            "how it reduces feature dimensions."
                        ),
                    },
                    {
                        "subtopic": "Overfitting and Hyperparameter Tuning",
                        "time": "4 hours",
                        "description": (
                            "Learn regularization, bias-variance tradeoff, "
                            "and hyperparameter optimization."
                        ),
                    },
                    {
                        "subtopic": "End-to-End Machine Learning Project",
                        "time": "5 hours",
                        "description": (
                            "Build, evaluate, and improve a complete "
                            "machine learning pipeline on a real dataset."
                        ),
                    },
                ],
            },
        }

    # --------------------------------------------------------
    # Generic fallback
    # --------------------------------------------------------

    return {
        "week 1": {
            "topic": f"Fundamentals of {topic}",
            "subtopics": [
                {
                    "subtopic": f"Introduction to {topic}",
                    "time": "3 hours",
                    "description": (
                        f"Understand the fundamentals, terminology, "
                        f"applications, and core ideas of {topic}."
                    ),
                },
                {
                    "subtopic": f"Core Concepts of {topic}",
                    "time": "4 hours",
                    "description": (
                        f"Study the most important concepts and "
                        f"principles used in {topic}."
                    ),
                },
                {
                    "subtopic": f"Practical {topic}",
                    "time": "5 hours",
                    "description": (
                        f"Practice applying {topic} concepts through "
                        f"examples and small exercises."
                    ),
                },
                {
                    "subtopic": f"Review and Practice",
                    "time": "4 hours",
                    "description": (
                        f"Review the material and solve practical "
                        f"problems to reinforce your knowledge of {topic}."
                    ),
                },
            ],
        },
        "week 2": {
            "topic": f"Intermediate {topic}",
            "subtopics": [
                {
                    "subtopic": f"Intermediate Concepts",
                    "time": "4 hours",
                    "description": (
                        f"Build on the fundamentals and learn "
                        f"intermediate concepts in {topic}."
                    ),
                },
                {
                    "subtopic": f"Problem Solving in {topic}",
                    "time": "4 hours",
                    "description": (
                        f"Solve increasingly complex problems using "
                        f"{topic} techniques."
                    ),
                },
                {
                    "subtopic": f"Tools and Techniques",
                    "time": "4 hours",
                    "description": (
                        f"Explore common tools, workflows, and "
                        f"techniques associated with {topic}."
                    ),
                },
                {
                    "subtopic": f"Intermediate Project",
                    "time": "4 hours",
                    "description": (
                        f"Apply intermediate {topic} concepts in "
                        f"a practical mini-project."
                    ),
                },
            ],
        },
        "week 3": {
            "topic": f"Advanced {topic}",
            "subtopics": [
                {
                    "subtopic": f"Advanced Concepts",
                    "time": "4 hours",
                    "description": (
                        f"Study advanced principles and techniques "
                        f"used in {topic}."
                    ),
                },
                {
                    "subtopic": f"Optimization and Best Practices",
                    "time": "4 hours",
                    "description": (
                        f"Learn how to improve solutions and follow "
                        f"best practices in {topic}."
                    ),
                },
                {
                    "subtopic": f"Real-World Applications",
                    "time": "4 hours",
                    "description": (
                        f"Understand how {topic} is applied to "
                        f"real-world scenarios."
                    ),
                },
                {
                    "subtopic": f"Advanced Practice",
                    "time": "4 hours",
                    "description": (
                        f"Solve advanced problems and reinforce "
                        f"your understanding of {topic}."
                    ),
                },
            ],
        },
        "week 4": {
            "topic": f"{topic} Capstone",
            "subtopics": [
                {
                    "subtopic": "Project Planning",
                    "time": "3 hours",
                    "description": (
                        f"Plan a practical project using the "
                        f"knowledge gained from {topic}."
                    ),
                },
                {
                    "subtopic": "Project Implementation",
                    "time": "5 hours",
                    "description": (
                        f"Implement the main components of the "
                        f"{topic} project."
                    ),
                },
                {
                    "subtopic": "Testing and Improvement",
                    "time": "4 hours",
                    "description": (
                        f"Test the project, identify weaknesses, "
                        f"and improve the solution."
                    ),
                },
                {
                    "subtopic": "Final Review",
                    "time": "4 hours",
                    "description": (
                        f"Review the major {topic} concepts and "
                        f"complete the final project."
                    ),
                },
            ],
        },
    }


# ============================================================
# GEMINI ROADMAP GENERATION
# ============================================================

def create_roadmap(topic, time, knowledge_level):

    try:

        # ----------------------------------------------------
        # Check API key
        # ----------------------------------------------------

        if not GEMINI_API_KEY:
            print(
                "GEMINI_API_KEY not found. "
                "Using fallback roadmap."
            )

            return fallback_roadmap(
                topic,
                time,
                knowledge_level,
            )

        # ----------------------------------------------------
        # Generation config
        # ----------------------------------------------------

        generation_config = {
            "temperature": 1,
            "top_p": 0.95,
            "top_k": 64,
            "max_output_tokens": 8192,
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
                "You are an AI agent who provides good "
                "personalized learning paths based on user input. "
                "Provide subtopics with a small description and "
                "estimated learning time. Give more time to "
                "subtopics that require more understanding. "
                "Keep every key lowercase. "
                "Return ONLY valid JSON."
            ),
        )

        chat_session = model.start_chat(history=[])

        response = chat_session.send_message(
            (
                f"Suggest a roadmap for learning {topic} in {time}. "
                f"My Knowledge level is {knowledge_level}. "
                "I can spend total of 16 hours every week."
            ),
            stream=False,
        )

        response_text = response.text.strip()

        if response_text.startswith("```"):
            response_text = (
                response_text
                .replace("```json", "", 1)
                .replace("```", "")
                .strip()
            )

        roadmap_data = json.loads(response_text)

        if not isinstance(roadmap_data, dict):
            raise ValueError(
                "Gemini returned an invalid roadmap."
            )

        print("Generated AI roadmap successfully.")

        return roadmap_data

    except Exception as error:

        print(
            "Gemini roadmap generation failed."
        )

        print(
            f"Reason: {type(error).__name__}: {error}"
        )

        print(
            "Using local fallback roadmap."
        )

        return fallback_roadmap(
            topic,
            time,
            knowledge_level,
        )