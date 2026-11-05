from fastapi import APIRouter
from src.Model.User import User
from src.Core.Authorization import SessionUser
from .Dependencies import CurrentUser, ServiceDep
from .Contracts import NameInput

router = APIRouter(prefix="/api/user", tags=["Usuário"])

@router.get("/me", response_model_exclude={"senha"})
async def getMe(user: CurrentUser, services: ServiceDep) -> User:
    return await services.user.get(user)

@router.patch("/me")
async def updateMe(data: NameInput, user: CurrentUser, services: ServiceDep) -> SessionUser:
    return await services.user.update(user, data.nome)
