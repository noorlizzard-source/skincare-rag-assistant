import json
import os
from typing import List, Dict, Any, Optional
from app.models.schemas import UserProfile

class RecommenderService:
    """Matches catalog products with user profile, sensitivity, and retrieved RAG context."""

    def __init__(self, catalog_path: str = "./app/data/products.json"):
        self.catalog_path = catalog_path
        self.catalog: List[Dict[str, Any]] = []
        self.load_catalog()

    def load_catalog(self):
        if os.path.exists(self.catalog_path):
            try:
                with open(self.catalog_path, 'r', encoding='utf-8') as f:
                    self.catalog = json.load(f)
            except Exception as e:
                print(f"Error loading product catalog: {e}")
                self.catalog = []

    def match_products(self, profile: UserProfile, top_n: int = 3) -> List[Dict[str, Any]]:
        """Filters and ranks catalog products tailored to skin type, concern, and sensitivity."""
        if not self.catalog:
            return []

        scored = []
        user_skin = (profile.skin_type or "unsure").lower()
        user_concern = (profile.main_concern or "").lower()
        is_sensitive = profile.sensitivity == "sensitive"

        for prod in self.catalog:
            score = 0.0
            prod_skins = [s.lower() for s in prod.get("skin_types", [])]
            prod_concerns = [c.lower() for c in prod.get("concerns", [])]
            prod_ingredients = [i.lower() for i in prod.get("ingredients", [])]

            # Skin type compatibility
            if user_skin in prod_skins or "all" in prod_skins:
                score += 3.0
            elif user_skin != "unsure":
                score -= 1.5

            # Concern match
            if user_concern in prod_concerns:
                score += 4.0
            elif any(user_concern in c for c in prod_concerns):
                score += 2.0

            # Sensitive skin protection (penalty for high active concentration without soothe)
            if is_sensitive:
                if "sensitive" in prod_skins:
                    score += 2.0
                if any(harsh in " ".join(prod_ingredients) for harsh in ["glycolic", "retinol", "benzoyl"]):
                    score -= 2.0

            scored.append((score, prod))

        # Sort descending by match score
        scored.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored[:top_n]]
