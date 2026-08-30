"""
TeamMatrix AI Learning Resources

Uses Gemini when available.
Falls back to local learning content when Gemini
is unavailable or the API quota is exhausted.
"""

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
# LOCAL FALLBACK RESOURCE
# ============================================================

def fallback_resources(
    course,
    knowledge_level,
    description,
    time,
):
    """
    Provides useful learning material without Gemini.
    """

    return f"""
# {course}

## Learning Level
{knowledge_level}

## Recommended Learning Time
{time}

## What You Will Learn

{description}

## Learning Objectives

By completing this topic, you should be able to:

1. Explain the main concepts related to this topic.
2. Understand the important terminology and fundamentals.
3. Apply the concepts to simple practical examples.
4. Identify common mistakes and avoid them.
5. Use the knowledge in a small real-world problem.

## Recommended Study Plan

### Step 1 — Understand the Basics

Start by understanding the fundamental definitions,
terminology, and concepts related to the topic.

Do not focus on memorization alone. Try to understand:

- What the concept means
- Why it is needed
- How it works
- Where it is used

### Step 2 — Study Examples

Work through simple examples.

For each example, ask yourself:

- What is the input?
- What happens internally?
- What is the output?
- Why does the solution work?

### Step 3 — Practice

Solve a few problems related to the topic.

Start with easy examples and gradually increase
the difficulty.

### Step 4 — Review

After studying, summarize the topic in your own words.

Try to explain the concept without looking at your notes.

### Step 5 — Apply

Create a small practical exercise or mini-project
using what you learned.

This helps convert theoretical knowledge into
practical understanding.

## Quick Revision Checklist

Before moving to the next topic, make sure you can:

- Explain the main idea.
- Define the important terms.
- Describe how the concept works.
- Solve a basic problem.
- Identify common mistakes.
- Explain one practical application.

## Practice Questions

1. What is the main idea behind this topic?
2. Why is this topic useful?
3. What are the most important concepts to remember?
4. Where is this concept commonly used?
5. Can you solve a simple problem using this concept?

## Final Tip

Do not try to finish the material as quickly as possible.

Focus on understanding the concepts,
practice them, and then test yourself.

Once you can explain the topic clearly in your own words,
you are ready to move forward.
"""


# ============================================================
# GEMINI RESOURCE GENERATION
# ============================================================

def generate_resources(
    course,
    knowledge_level,
    description,
    time,
):

    try:

        # ----------------------------------------------------
        # Check API key
        # ----------------------------------------------------

        if not GEMINI_API_KEY:

            print(
                "GEMINI_API_KEY not found. "
                "Using fallback learning resource."
            )

            return fallback_resources(
                course,
                knowledge_level,
                description,
                time,
            )

        # ----------------------------------------------------
        # Gemini configuration
        # ----------------------------------------------------

        generation_config = {
            "temperature": 1,
            "top_p": 0.95,
            "top_k": 64,
            "max_output_tokens": 8192,
            "response_mime_type": "text/plain",
        }

        model = genai.GenerativeModel(
            model_name="gemini-3.6-flash",
            generation_config=generation_config,
            system_instruction=(
                "You are an AI tutor. "
                "Maintain a clear, modest, and calm teaching style. "
                "Create useful learning material for the learner. "
                "Explain concepts clearly, provide examples, "
                "common mistakes, practical tips, and a short "
                "practice section. "
                "Adapt the explanation to the learner's knowledge level "
                "and available learning time."
            ),
        )

        chat_session = model.start_chat(
            history=[]
        )

        response = chat_session.send_message(
            (
                f"I am learning {course}. "
                f"My knowledge level is {knowledge_level}. "
                f"I want to learn: {description}. "
                f"I want to learn it in {time}. "
                "Teach me in a structured and practical way."
            ),
            stream=False,
        )

        resource_text = response.text.strip()

        if not resource_text:
            raise ValueError(
                "Gemini returned empty learning content."
            )

        print(
            "Generated AI learning resources successfully."
        )

        return resource_text

    except Exception as error:

        # ----------------------------------------------------
        # Fallback for quota/API/network errors
        # ----------------------------------------------------

        print(
            "Gemini resource generation failed."
        )

        print(
            f"Reason: {type(error).__name__}: {error}"
        )

        print(
            "Using local fallback learning resource."
        )

        return fallback_resources(
            course,
            knowledge_level,
            description,
            time,
        )