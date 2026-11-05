import logging
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException
from fastapi.responses import JSONResponse

logger = logging.getLogger("gutplanner")


def configureExceptions(app: FastAPI) -> None:
    @app.exception_handler(HTTPException)
    async def httpError(request: Request, error: HTTPException):
        messages = {400: "Requisição inválida.", 401: "Sessão inválida.", 403: "Acesso negado.", 404: "Recurso não encontrado.", 409: "Operação em conflito.", 429: "Tente novamente mais tarde.", 503: "Serviço indisponível."}
        return JSONResponse({"message": messages.get(error.status_code, "Não foi possível concluir a operação.")}, status_code=error.status_code, headers=error.headers)

    @app.exception_handler(RequestValidationError)
    async def validationError(request: Request, error: RequestValidationError):
        return JSONResponse({"message": "Dados inválidos."}, status_code=422)

    @app.exception_handler(Exception)
    async def unexpectedError(request: Request, error: Exception):
        logger.error("Falha interna: %s", type(error).__name__)
        return JSONResponse({"message": "Erro interno."}, status_code=500)
