import hashlib
from uuid import uuid4
from fastapi import HTTPException
from src.Core.Owasp import validateUpload
from src.Core.UploadSecurity import UploadScanner, validateFilename


class ServiceAnexo:
    def __init__(self, attachmentRepository, taskService, config):
        self.attachmentRepository = attachmentRepository
        self.taskService = taskService
        self.config = config
        self.scanner = UploadScanner()

    async def create(self, user, idProjeto, idTarefa, filename, contentType, content):
        await self.taskService.get(user, idProjeto, idTarefa)
        validateUpload(content, contentType, self.config)
        validateFilename(filename, contentType)
        await self.scanner.scan(content)
        document = {"id": str(uuid4()), "idProjeto": idProjeto, "idTarefa": idTarefa, "filename": filename, "contentType": contentType, "size": len(content), "content": content, "scanStatus": "clean", "sha256": hashlib.sha256(content).hexdigest()}
        if not await self.attachmentRepository.create(document):
            raise HTTPException(404)
        return {key: value for key, value in document.items() if key != "content"}

    async def get(self, user, idProjeto, idTarefa, idAnexo):
        await self.taskService.get(user, idProjeto, idTarefa)
        document = await self.attachmentRepository.get(idProjeto, idTarefa, idAnexo)
        if not document:
            raise HTTPException(404)
        # Arquivos anteriores à política não são disponibilizados sem inspeção.
        validateUpload(document["content"], document["contentType"], self.config)
        validateFilename(document["filename"], document["contentType"])
        if document.get("scanStatus") != "clean" or document.get("sha256") != hashlib.sha256(document["content"]).hexdigest():
            await self.scanner.scan(document["content"])
        return document

    async def delete(self, user, idProjeto, idTarefa, idAnexo):
        await self.taskService.get(user, idProjeto, idTarefa)
        if not await self.attachmentRepository.delete(idProjeto, idTarefa, idAnexo):
            raise HTTPException(404)
