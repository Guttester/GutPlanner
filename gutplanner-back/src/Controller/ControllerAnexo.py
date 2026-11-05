from typing import Annotated
from urllib.parse import quote
from fastapi import APIRouter, File, UploadFile, HTTPException, Response
from src.Core.Config import getConfig
from .Dependencies import CurrentUser, ServiceDep

router = APIRouter(prefix="/api/projetos/{idProjeto}/tarefas/{idTarefa}/anexos", tags=["Anexos"])

@router.post("", status_code=201)
async def createAttachment(idProjeto: str, idTarefa: str, user: CurrentUser, services: ServiceDep, file: Annotated[UploadFile, File()]) -> dict:
    try:
        content = await file.read(getConfig().maxUploadBytes + 1)
        if len(content) > getConfig().maxUploadBytes:
            raise HTTPException(413)
        return await services.anexos.create(user, idProjeto, idTarefa, file.filename, file.content_type, content)
    finally:
        await file.close()

@router.get("/{idAnexo}")
async def getAttachment(idProjeto: str, idTarefa: str, idAnexo: str, user: CurrentUser, services: ServiceDep) -> Response:
    item = await services.anexos.get(user, idProjeto, idTarefa, idAnexo)
    return Response(item["content"], media_type=item["contentType"], headers={"Content-Disposition": ("attachment; filename*=UTF-8''" if item["contentType"] == "application/pdf" else "inline; filename*=UTF-8''") + quote(item["filename"], safe=""), "Content-Security-Policy": "default-src 'none'; sandbox", "X-Content-Type-Options": "nosniff", "Cross-Origin-Resource-Policy": "same-origin", "Cache-Control": "private, no-store"})

@router.delete("/{idAnexo}", status_code=204)
async def deleteAttachment(idProjeto: str, idTarefa: str, idAnexo: str, user: CurrentUser, services: ServiceDep):
    await services.anexos.delete(user, idProjeto, idTarefa, idAnexo)
