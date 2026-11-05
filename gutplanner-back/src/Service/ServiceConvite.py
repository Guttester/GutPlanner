from uuid import uuid4
from fastapi import HTTPException
from pymongo.errors import DuplicateKeyError
from src.Model.User import User


class ServiceConvite:
    def __init__(self, invitationRepository, projectService):
        self.invitationRepository = invitationRepository
        self.projectService = projectService

    async def list(self, user, idProjeto):
        await self.projectService.authorize(user, idProjeto, ownerOnly=True)
        return await self.invitationRepository.listForProject(idProjeto)

    async def create(self, user, idProjeto, email):
        await self.projectService.authorize(user, idProjeto, ownerOnly=True)
        email = User(nome="Convite", email=email).email.lower()
        if email == user.email.lower():
            raise HTTPException(422)
        document = {"id": str(uuid4()), "idProjeto": idProjeto, "email": email, "status": "pending"}
        try:
            await self.invitationRepository.create(document)
        except DuplicateKeyError:
            raise HTTPException(409) from None
        return document

    async def delete(self, user, idProjeto, idConvite):
        await self.projectService.authorize(user, idProjeto, ownerOnly=True)
        if not await self.invitationRepository.delete(idProjeto, idConvite):
            raise HTTPException(404)
