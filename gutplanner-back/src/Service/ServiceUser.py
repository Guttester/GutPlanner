from fastapi import HTTPException
from src.Model.User import User
from src.Core.Authorization import SessionUser


class ServiceUser:
    def __init__(self, userRepository, projectService):
        self.userRepository = userRepository
        self.projectService = projectService

    async def get(self, user):
        document = await self.userRepository.byId(user.idUser)
        if not document:
            raise HTTPException(401)
        projects = await self.projectService.list(user)
        owned = {item["idProjeto"] for item in await self.projectService.projectRepository.listForUser(user.idUser) if item["ownerId"] == user.idUser}
        return User(idUser=user.idUser, nome=document["nome"], email=document["email"], meusProjetos=[item for item in projects if item.idProjeto in owned], projetosCompartilhados=[item for item in projects if item.idProjeto not in owned])

    async def update(self, user, nome):
        validated = User(nome=nome, email=user.email)
        document = await self.userRepository.updateName(user.idUser, validated.nome)
        if not document:
            raise HTTPException(401)
        return SessionUser(idUser=user.idUser, nome=document["nome"], email=document["email"])
