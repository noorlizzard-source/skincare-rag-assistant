import json
import os
from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter()

PRODUCTS_FILE = "./app/data/products.json"
INGREDIENTS_FILE = "./app/data/ingredients.json"

@router.get("/products", response_model=List[Dict[str, Any]])
async def get_products():
    if os.path.exists(PRODUCTS_FILE):
        with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

@router.get("/ingredients", response_model=List[Dict[str, Any]])
async def get_ingredients():
    if os.path.exists(INGREDIENTS_FILE):
        with open(INGREDIENTS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []
