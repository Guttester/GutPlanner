from fastapi import APIRouter
from src.Model.Tarefa import Tarefa
from src.Model.Comentario import Comentario
from .Dependencies import CurrentUser, ServiceDep
from .Contracts import TaskInput, StatusInput, ChecklistInput, CommentInput

router = APIRouter(prefix="/api", tags=["Tarefas"])

@router.get("/tarefas")
async def listAll(user: CurrentUser, services: ServiceDep) -> list[Tarefa]:
    return await services.tarefas.list(user)

@router.get("/projetos/{idProjeto}/tarefas")
async def listTasks(idProjeto: str, user: CurrentUser, services: ServiceDep) -> list[Tarefa]:
    return await services.tarefas.list(user, idProjeto)

@router.get("/projetos/{idProjeto}/tarefas/{idTarefa}")
async def getTask(idProjeto: str, idTarefa: str, user: CurrentUser, services: ServiceDep) -> Tarefa:
    return await services.tarefas.get(user, idProjeto, idTarefa)

@router.post("/projetos/{idProjeto}/tarefas", status_code=201)
async def createTask(idProjeto: str, data: TaskInput, user: CurrentUser, services: ServiceDep) -> Tarefa:
    return await services.tarefas.create(user, idProjeto, data.model_dump())

@router.put("/projetos/{idProjeto}/tarefas/{idTarefa}")
async def editTask(idProjeto: str, idTarefa: str, data: TaskInput, user: CurrentUser, services: ServiceDep) -> Tarefa:
    return await services.tarefas.edit(user, idProjeto, idTarefa, data.model_dump())

@router.delete("/projetos/{idProjeto}/tarefas/{idTarefa}", status_code=204)
async def deleteTask(idProjeto: str, idTarefa: str, user: CurrentUser, services: ServiceDep):
    await services.tarefas.delete(user, idProjeto, idTarefa)

@router.patch("/projetos/{idProjeto}/tarefas/{idTarefa}/status")
async def setStatus(idProjeto: str, idTarefa: str, data: StatusInput, user: CurrentUser, services: ServiceDep) -> Tarefa:
    return await services.tarefas.setStatus(user, idProjeto, idTarefa, data.status)

@router.patch("/projetos/{idProjeto}/tarefas/{idTarefa}/checklist/{idItem}")
async def setChecklist(idProjeto: str, idTarefa: str, idItem: str, data: ChecklistInput, user: CurrentUser, services: ServiceDep) -> Tarefa:
    return await services.tarefas.setChecklist(user, idProjeto, idTarefa, idItem, data.statusItem)

@router.post("/projetos/{idProjeto}/tarefas/{idTarefa}/comentarios", status_code=201)
async def addComment(idProjeto: str, idTarefa: str, data: CommentInput, user: CurrentUser, services: ServiceDep) -> Comentario:
    return await services.tarefas.addComment(user, idProjeto, idTarefa, data.mensagem)
