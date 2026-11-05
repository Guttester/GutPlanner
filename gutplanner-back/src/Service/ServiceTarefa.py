from uuid import uuid4
from fastapi import HTTPException
from src.Model.Tarefa import Tarefa
from src.Model.Comentario import Comentario


class ServiceTarefa:
    def __init__(self, taskRepository, projectService):
        self.taskRepository = taskRepository
        self.projectService = projectService

    def validated(self, document):
        if document is None:
            raise HTTPException(404)
        return Tarefa.model_validate(document)

    async def list(self, user, idProjeto=None):
        if idProjeto is not None:
            await self.projectService.authorize(user, idProjeto)
            ids = [idProjeto]
        else:
            ids = [project["idProjeto"] for project in await self.projectService.projectRepository.listForUser(user.idUser)]
        return [Tarefa.model_validate(item) for item in await self.taskRepository.listForProjects(ids)]

    async def get(self, user, idProjeto, idTarefa):
        await self.projectService.authorize(user, idProjeto)
        return self.validated(await self.taskRepository.get(idProjeto, idTarefa))

    async def create(self, user, idProjeto, data):
        await self.projectService.authorize(user, idProjeto)
        task = Tarefa.model_validate({**data, "id": str(uuid4()), "idProjeto": idProjeto})
        if task.comentarios or task.listDocuments:
            raise HTTPException(422, "Use os contratos de comentários e anexos.")
        await self.validateLinkedTask(task)
        self.validateChecklist(task)
        await self.taskRepository.create(task.model_dump())
        return task

    async def validateLinkedTask(self, task):
        if task.tarefaVinculadaId:
            if task.categoria.strip().lower() != "bug" or task.tarefaVinculadaId == task.id:
                raise HTTPException(422, "Vínculo inválido.")
            if not await self.taskRepository.get(task.idProjeto, task.tarefaVinculadaId):
                raise HTTPException(422, "Selecione uma tarefa existente deste projeto.")

    def validateChecklist(self, task):
        if len({item.id for item in task.checklist}) != len(task.checklist):
            raise HTTPException(422, "Itens de checklist duplicados.")

    async def edit(self, user, idProjeto, idTarefa, data):
        current = await self.get(user, idProjeto, idTarefa)
        task = Tarefa.model_validate({**data, "id": idTarefa, "idProjeto": idProjeto})
        await self.validateLinkedTask(task)
        self.validateChecklist(task)
        if task.comentarios != current.comentarios or task.listDocuments != current.listDocuments:
            raise HTTPException(422, "Use os contratos de comentários e anexos.")
        return self.validated(await self.taskRepository.edit(idProjeto, idTarefa, task.model_dump()))

    async def setStatus(self, user, idProjeto, idTarefa, status):
        task = await self.get(user, idProjeto, idTarefa)
        task.status = status
        return self.validated(await self.taskRepository.setStatus(idProjeto, idTarefa, task.status))

    async def setChecklist(self, user, idProjeto, idTarefa, idItem, statusItem):
        await self.get(user, idProjeto, idTarefa)
        if type(statusItem) is not bool:
            raise HTTPException(422)
        return self.validated(await self.taskRepository.setChecklist(idProjeto, idTarefa, idItem, statusItem))

    async def addComment(self, user, idProjeto, idTarefa, mensagem):
        await self.get(user, idProjeto, idTarefa)
        comment = Comentario(id=str(uuid4()), autor=user.nome, mensagem=mensagem)
        self.validated(await self.taskRepository.addComment(idProjeto, idTarefa, comment.model_dump()))
        return comment

    async def delete(self, user, idProjeto, idTarefa):
        await self.get(user, idProjeto, idTarefa)
        if not await self.taskRepository.delete(idProjeto, idTarefa):
            raise HTTPException(404)
