from uuid import uuid4
from fastapi import HTTPException
from src.Model.Projeto import Projeto
from src.Model.Tarefa import Tarefa


class ServiceProjeto:
    def __init__(self, projectRepository, taskRepository):
        self.projectRepository = projectRepository
        self.taskRepository = taskRepository

    async def authorize(self, user, idProjeto, ownerOnly=False):
        project = await self.projectRepository.get(idProjeto)
        if not project:
            raise HTTPException(404)
        owner = project["ownerId"] == user.idUser
        if not owner and (ownerOnly or user.idUser not in project.get("memberIds", [])):
            raise HTTPException(403)
        return project

    async def list(self, user):
        documents = await self.projectRepository.listForUser(user.idUser)
        tasks = await self.taskRepository.listForProjects([item["idProjeto"] for item in documents])
        return [Projeto(idProjeto=item["idProjeto"], nomeProjeto=item["nomeProjeto"], tarefas=[Tarefa.model_validate(task) for task in tasks if task["idProjeto"] == item["idProjeto"]]) for item in documents]

    async def get(self, user, idProjeto):
        project = await self.authorize(user, idProjeto)
        return Projeto(idProjeto=idProjeto, nomeProjeto=project["nomeProjeto"], tarefas=await self.taskRepository.listForProjects([idProjeto]))

    async def create(self, user, nomeProjeto):
        project = Projeto(idProjeto=str(uuid4()), nomeProjeto=nomeProjeto)
        await self.projectRepository.create({"idProjeto": project.idProjeto, "nomeProjeto": project.nomeProjeto, "ownerId": user.idUser, "memberIds": []})
        return project

    async def delete(self, user, idProjeto):
        await self.authorize(user, idProjeto, ownerOnly=True)
        if not await self.projectRepository.delete(idProjeto, user.idUser):
            raise HTTPException(404)
