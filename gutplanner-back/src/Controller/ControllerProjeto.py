from fastapi import APIRouter
from src.Model.Projeto import Projeto
from .Dependencies import CurrentUser, ServiceDep
from .Contracts import ProjectInput

router = APIRouter(prefix="/api/projetos", tags=["Projetos"])

@router.get("")
async def listProjects(user: CurrentUser, services: ServiceDep) -> list[Projeto]:
    return await services.projetos.list(user)

@router.get("/{idProjeto}")
async def getProject(idProjeto: str, user: CurrentUser, services: ServiceDep) -> Projeto:
    return await services.projetos.get(user, idProjeto)

@router.post("", status_code=201)
async def createProject(data: ProjectInput, user: CurrentUser, services: ServiceDep) -> Projeto:
    return await services.projetos.create(user, data.nomeProjeto)

@router.delete("/{idProjeto}", status_code=204)
async def deleteProject(idProjeto: str, user: CurrentUser, services: ServiceDep):
    await services.projetos.delete(user, idProjeto)
