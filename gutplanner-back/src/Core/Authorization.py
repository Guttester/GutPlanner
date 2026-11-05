from typing import Protocol
from fastapi import HTTPException, Request
from pydantic import BaseModel, ConfigDict
from .Security import hashToken


class SessionUser(BaseModel):
    model_config = ConfigDict(frozen=True)
    idUser: str
    nome: str
    email: str


class AuthorizationStore(Protocol):
    async def findActiveSession(self, tokenHash: str) -> SessionUser | None:
        """Retornar somente sessões persistidas, não revogadas e não expiradas."""
        ...

    async def projectRole(self, idUser: str, idProjeto: str) -> str | None:
        ...


async def requireUser(request: Request) -> SessionUser:
    token = request.cookies.get("session")
    if not token or len(token) > 128:
        raise HTTPException(401, "Sessão inválida.")
    store = getattr(request.app.state, "authorizationStore", None)
    if store is None:
        raise HTTPException(503, "Autenticação indisponível.")
    user = await store.findActiveSession(hashToken(token))
    if user is None:
        raise HTTPException(401, "Sessão inválida.")
    return user


async def requireProject(request: Request, idProjeto: str, ownerOnly: bool = False) -> SessionUser:
    user = await requireUser(request)
    role = await request.app.state.authorizationStore.projectRole(user.idUser, idProjeto)
    if role not in ({"owner"} if ownerOnly else {"owner", "member"}):
        raise HTTPException(403, "Acesso negado.")
    return user
