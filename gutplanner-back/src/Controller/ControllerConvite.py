from fastapi import APIRouter
from .Dependencies import CurrentUser, ServiceDep
from .Contracts import EmailInput

router = APIRouter(prefix="/api/projetos/{idProjeto}/convites", tags=["Convites"])

@router.get("")
async def listInvitations(idProjeto: str, user: CurrentUser, services: ServiceDep) -> list[dict]:
    return await services.convites.list(user, idProjeto)

@router.post("", status_code=201)
async def createInvitation(idProjeto: str, data: EmailInput, user: CurrentUser, services: ServiceDep) -> dict:
    return await services.convites.create(user, idProjeto, data.email)

@router.delete("/{idConvite}", status_code=204)
async def deleteInvitation(idProjeto: str, idConvite: str, user: CurrentUser, services: ServiceDep):
    await services.convites.delete(user, idProjeto, idConvite)
