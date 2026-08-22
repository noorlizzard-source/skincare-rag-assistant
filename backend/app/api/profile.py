from fastapi import APIRouter
from app.models.schemas import UserProfile

router = APIRouter()

@router.post("/profile/reset", response_model=UserProfile)
async def reset_profile():
    return UserProfile()
