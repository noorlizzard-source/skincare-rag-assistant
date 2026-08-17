import os
import json
import re
from typing import List, Dict, Any, Optional
from app.rag.grounding import SYSTEM_PROMPT_RAG, GroundingEngine
from app.models.schemas import GroundedResponse, UserProfile

class LLMService:
    """Interactions with LLM providers (Google Gemini / OpenAI / Grounded Fallback Engine)."""

    def __init__(self):
        self.api_key = os.getenv("LLM_API_KEY", "").strip()
        self.provider = os.getenv("LLM_PROVIDER", "gemini").lower()
        self.model_name = os.getenv("LLM_MODEL", "gemini-2.5-flash")

    def generate_grounded_response(
        self,
        user_message: str,
        retrieved_chunks: List[Dict[str, Any]],
        profile: Optional[UserProfile] = None,
        product_catalog: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """Generates a structured, evidence-grounded skincare response."""

        # 1. Check if retrieval confidence is zero/low
        if not retrieved_chunks or max([c.get("score", 0) for c in retrieved_chunks], default=0) < 0.02:
            return self._build_insufficient_info_response(user_message)

        # 2. Try Gemini API if key is present
        if self.api_key and self.provider == "gemini":
            try:
                from google import genai
                from google.genai import types

                client = genai.Client(api_key=self.api_key)
                prompt = GroundingEngine.build_prompt(user_message, retrieved_chunks, profile)
                
                response = client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_PROMPT_RAG,
                        temperature=0.2,
                        response_mime_type="application/json"
                    )
                )
                
                if response and response.text:
                    parsed = json.loads(response.text)
                    parsed["sources"] = GroundingEngine.format_sources(retrieved_chunks)
                    return parsed
            except Exception as e:
                print(f"Gemini API generation error: {e}. Falling back to Rule-Based Grounding Engine.")

        # 3. Fallback Grounded Generator (Rule-based RAG synthesis from retrieved context & product catalog)
        return self._rule_based_grounded_generator(user_message, retrieved_chunks, profile, product_catalog)

    def _rule_based_grounded_generator(
        self,
        user_message: str,
        retrieved_chunks: List[Dict[str, Any]],
        profile: Optional[UserProfile] = None,
        product_catalog: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """Synthesizes structured recommendations directly from retrieved knowledge chunks."""
        
        main_concern = profile.main_concern if profile and profile.main_concern else "general skin concern"
        skin_type = profile.skin_type if profile and profile.skin_type and profile.skin_type != "unsure" else "all skin types"

        # Combine text from retrieved chunks
        context_text = " ".join([c["text"] for c in retrieved_chunks]).lower()

        # Determine possible factors
        consistent_with = f"Based on your report of {main_concern} and {skin_type} skin, your presentation may be consistent with follicular sebum accumulation, mild epidermal barrier fluctuation, or skin stress."
        if "acne" in context_text or "breakout" in context_text:
            consistent_with = "Your reported symptoms may be consistent with mild to moderate comedogenic acne flare-ups or follicular keratonization."
        elif "dry" in context_text or "barrier" in context_text or "redness" in context_text:
            consistent_with = "Your reported symptoms may be consistent with transepidermal water loss (TEWL) and temporary skin barrier disruption."
        elif "spot" in context_text or "hyperpigmentation" in context_text:
            consistent_with = "Your concern is consistent with post-inflammatory hyperpigmentation (PIH) or localized UV-induced melanogenesis."

        # Extract recommended ingredients from context
        ingredients = []
        if "niacinamide" in context_text:
            ingredients.append({"name": "Niacinamide (Vitamin B3)", "reason": "Helps balance sebum production, strengthens barrier lipid synthesis, and evens out tone."})
        if "salicylic acid" in context_text or "bha" in context_text:
            ingredients.append({"name": "Salicylic Acid (BHA)", "reason": "Lipophilic exfoliant that penetrates pores to dissolve sebum and clear comedones."})
        if "ceramides" in context_text:
            ingredients.append({"name": "Ceramides (NP/AP/EOP)", "reason": "Restores physiological skin barrier lipids and prevents moisture loss."})
        if "centella" in context_text or "cica" in context_text:
            ingredients.append({"name": "Centella Asiatica (Cica)", "reason": "Soothes persistent redness, calms active irritation, and supports healing."})
        if "azelaic acid" in context_text:
            ingredients.append({"name": "Azelaic Acid (10%)", "reason": "Fades post-breakout dark spots and reduces skin inflammation."})

        if not ingredients:
            ingredients.append({"name": "Hyaluronic Acid & Glycerin", "reason": "Essential humectants to maintain hydration balance without clogging pores."})

        # Routine building
        am_routine = [
            "Step 1: Cleanse with a mild, non-stripping gentle cleanser.",
            "Step 2: Apply a light hydrating serum or target treatment ingredient.",
            "Step 3: Lock with a lightweight barrier-supporting moisturizer.",
            "Step 4: Apply broad-spectrum SPF 30+ sunscreen generously as final morning step."
        ]

        pm_routine = [
            "Step 1: Thoroughly cleanse to remove sunscreen, oil, and environmental buildup.",
            "Step 2: Apply your targeted active treatment (e.g. Salicylic Acid or Niacinamide) on dry skin.",
            "Step 3: Follow with a soothing moisturizer rich in ceramides or Centella Asiatica."
        ]

        # Avoidance advice
        what_to_avoid = [
            "Over-exfoliating or combining multiple strong active acids in the same routine step.",
            "Harsh physical facial scrubs, alcohol-heavy toners, or heavy pore-clogging waxes.",
            "Picking, squeezing, or aggressively popping acne lesions."
        ]

        # Match products from catalog
        matched_products = []
        if product_catalog:
            for p in product_catalog:
                p_skin_types = p.get("skin_types", [])
                p_concerns = p.get("concerns", [])
                
                # Matching logic
                if (skin_type in p_skin_types or "all" in p_skin_types) and (main_concern in p_concerns or any(ing["name"].lower() in [i.lower() for i in p.get("ingredients", [])] for ing in ingredients)):
                    matched_products.append(p)

        if not matched_products and product_catalog:
            matched_products = product_catalog[:2] # fallback match top products

        sources = GroundingEngine.format_sources(retrieved_chunks)

        return {
            "concern_summary": f"User reported concern: {main_concern} (Skin type: {skin_type}).",
            "consistent_with": consistent_with,
            "routine_am": am_routine,
            "routine_pm": pm_routine,
            "ingredients_to_look_for": ingredients,
            "what_to_avoid": what_to_avoid,
            "recommended_products": matched_products[:3],
            "how_to_start": "Introduce new active products one at a time. Perform a patch test on the inner forearm for 24-48 hours before full facial application. Start applying actives 2-3 nights per week before increasing frequency.",
            "when_to_see_dermatologist": "Seek professional medical evaluation from a dermatologist if you experience rapidly spreading redness, extreme pain, swelling, oozing lesions, fever, or severe recalcitrant cystic acne unresponsive to over-the-counter care.",
            "disclaimer": "This guidance is grounded in the current knowledge base for educational purposes only. It is not a medical diagnosis and does not replace consultation with a qualified dermatologist.",
            "sources": sources
        }

    def _build_insufficient_info_response(self, user_message: str) -> Dict[str, Any]:
        """Handles cases where vector retrieval confidence is below threshold."""
        return {
            "concern_summary": f"Query: '{user_message}'",
            "consistent_with": "Information not found in knowledge base.",
            "routine_am": [],
            "routine_pm": [],
            "ingredients_to_look_for": [],
            "what_to_avoid": [],
            "recommended_products": [],
            "how_to_start": "",
            "when_to_see_dermatologist": "If you are experiencing severe or unknown skin symptoms, please consult a healthcare professional.",
            "disclaimer": "Notice: The knowledge base does not contain sufficient reliable information to answer this specific query safely.",
            "sources": []
        }
