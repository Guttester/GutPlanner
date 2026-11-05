from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from .Config import Config
from .Owasp import validateCsrf
from .RateLimit import RateLimit
from .UploadSecurity import UploadBodyLimit
from .Authorization import requireUser


def configureMiddleware(app: FastAPI, config: Config) -> None:
    app.add_middleware(UploadBodyLimit, limit=config.maxUploadBytes + 1024 * 1024)
    recoveryLimiter = RateLimit(5, 900)
    limiter = RateLimit(config.rateRequests, config.rateWindow)

    @app.middleware("http")
    async def protection(request: Request, callNext):
        try:
            if request.url.path.startswith("/api/"):
                limiter.check(request.client.host if request.client else "unknown")
                validateCsrf(request, config)
                if request.method == "POST" and request.url.path in {"/api/auth/password/recovery", "/api/auth/password/reset"}:
                    recoveryLimiter.check(request.client.host if request.client else "unknown")
                if request.method == "POST" and request.url.path.endswith("/anexos"):
                    user = await requireUser(request)
                    parts = request.url.path.strip('/').split('/')
                    if len(parts) != 6 or parts[1] != 'projetos' or parts[3] != 'tarefas':
                        raise HTTPException(404)
                    await request.app.state.services.tarefas.get(user, parts[2], parts[4])
            response = await callNext(request)
        except HTTPException as error:
            response = JSONResponse({"message": "Requisição recusada."}, status_code=error.status_code, headers=error.headers)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["X-Frame-Options"] = "DENY"
        if request.url.path.startswith("/api/"):
            response.headers["Cache-Control"] = "no-store"
        if config.secureCookies:
            response.headers["Strict-Transport-Security"] = "max-age=31536000"
        return response
