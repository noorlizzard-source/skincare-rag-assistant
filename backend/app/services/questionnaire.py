from typing import Optional, Dict, Any
from app.models.schemas import UserProfile, QuestionnaireQuestion

class QuestionnaireEngine:
    """Dynamically determines the next relevant question based on user profile state."""

    QUESTIONS = {
        "skin_type": QuestionnaireQuestion(
            question_id="skin_type",
            text="What is your skin type (if known)?",
            options=["oily", "dry", "combination", "normal", "sensitive", "unsure"],
            category="basic"
        ),
        "main_concern": QuestionnaireQuestion(
            question_id="main_concern",
            text="What is your primary skincare concern today?",
            options=[
                "acne/breakouts",
                "dryness",
                "oiliness",
                "irritation",
                "redness",
                "uneven skin tone",
                "dark spots",
                "clogged pores",
                "rough texture",
                "sensitivity"
            ],
            category="concern"
        ),
        "current_routine": QuestionnaireQuestion(
            question_id="current_routine",
            text="What products do you currently use in your daily routine?",
            options=[
                "cleanser + moisturizer + sunscreen",
                "cleanser + moisturizer only",
                "active treatment serums (retinoid / AHA / BHA)",
                "water / cleanser only",
                "no fixed routine"
            ],
            category="routine"
        ),
        "new_product": QuestionnaireQuestion(
            question_id="new_product",
            text="Have you recently introduced any new skincare product or active ingredient in the past 2 weeks?",
            options=["Yes, a new active/treatment", "Yes, a new cleanser or moisturizer", "No recent changes", "Unsure"],
            category="history"
        ),
        "sun_exposure": QuestionnaireQuestion(
            question_id="sun_exposure",
            text="What is your typical daily sun exposure and sunscreen usage?",
            options=["Daily outdoor sun + daily SPF 30+", "Moderate sun + occasional SPF", "Mostly indoors + rare SPF", "High sun exposure + no SPF"],
            category="lifestyle"
        )
    }

    @staticmethod
    def get_next_question(profile: UserProfile) -> Optional[QuestionnaireQuestion]:
        """Returns the next relevant un-answered question or None if profile is sufficiently built."""
        if not profile.skin_type or profile.skin_type == "unsure":
            return QuestionnaireEngine.QUESTIONS["skin_type"]
        if not profile.main_concern:
            return QuestionnaireEngine.QUESTIONS["main_concern"]
        if not profile.current_routine:
            return QuestionnaireEngine.QUESTIONS["current_routine"]
        if profile.recent_product_introduced is None:
            return QuestionnaireEngine.QUESTIONS["new_product"]
        if "sun_exposure" not in profile.previous_answers:
            return QuestionnaireEngine.QUESTIONS["sun_exposure"]
        return None

    @staticmethod
    def update_profile_with_answer(profile: UserProfile, question_id: str, answer: Any) -> UserProfile:
        """Updates the profile fields based on questionnaire answers."""
        profile.previous_answers[question_id] = answer

        if question_id == "skin_type":
            profile.skin_type = str(answer).lower()
            if "sensitive" in profile.skin_type:
                profile.sensitivity = "sensitive"
        elif question_id == "main_concern":
            profile.main_concern = str(answer).lower()
        elif question_id == "current_routine":
            profile.current_routine["summary"] = str(answer)
        elif question_id == "new_product":
            profile.recent_product_introduced = "Yes" in str(answer)
        
        return profile
