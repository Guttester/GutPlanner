import secrets
from fastapi import HTTPException, Request
from .Config import Config


def validateCsrf(request: Request, config: Config) -> None:
    if request.method in {"GET", "HEAD", "OPTIONS"}:
        return
    origin = request.headers.get("origin")
    allowedOrigins = {config.publicUrl}
    if config.environment == "development" and config.developmentOrigin:
        allowedOrigins.add(config.developmentOrigin)
    if origin not in allowedOrigins:
        raise HTTPException(403)
    cookie = request.cookies.get("XSRF-TOKEN", "")
    header = request.headers.get("X-XSRF-TOKEN", "")
    if not cookie or len(cookie) > 128 or not secrets.compare_digest(cookie.encode(), header.encode()):
        raise HTTPException(403)


def validateUpload(content: bytes, contentType: str, config: Config) -> None:
    if not content or len(content) > config.maxUploadBytes:
        raise HTTPException(413)
    signatures = {"application/pdf": b"%PDF-", "image/png": b"\x89PNG\r\n\x1a\n", "image/jpeg": b"\xff\xd8\xff"}
    if contentType not in signatures or not content.startswith(signatures[contentType]):
        raise HTTPException(415)
