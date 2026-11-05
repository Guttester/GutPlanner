import asyncio
import os
import struct
import unicodedata
from pathlib import PurePath
from fastapi import HTTPException
from starlette.responses import JSONResponse


def validateFilename(filename: str, contentType: str) -> None:
    allowed = {"application/pdf": {".pdf"}, "image/png": {".png"}, "image/jpeg": {".jpg", ".jpeg"}}
    if not isinstance(filename, str) or not filename.strip() or len(filename) > 180:
        raise HTTPException(422)
    if filename != filename.strip() or filename.startswith('.') or any(c in filename for c in '/\\:') or any(unicodedata.category(c).startswith('C') for c in filename):
        raise HTTPException(422)
    if PurePath(filename).suffix.lower() not in allowed.get(contentType, set()):
        raise HTTPException(415)


class UploadScanner:
    async def scan(self, content: bytes) -> None:
        try:
            await asyncio.wait_for(self.scanStream(content), timeout=30)
        except (OSError, ValueError, asyncio.TimeoutError, asyncio.IncompleteReadError, asyncio.LimitOverrunError):
            raise HTTPException(503, "Verificação de arquivos indisponível.") from None

    async def scanStream(self, content: bytes) -> None:
        # Endereço exclusivamente da configuração do servidor, nunca do upload.
        host = os.getenv("CLAMAV_HOST", "127.0.0.1")
        port = int(os.getenv("CLAMAV_PORT", "3310"))
        reader, writer = await asyncio.open_connection(host, port, limit=4096)
        try:
            writer.write(b"zINSTREAM\0")
            for offset in range(0, len(content), 65536):
                chunk = content[offset:offset + 65536]
                writer.write(struct.pack('!I', len(chunk)) + chunk)
                await writer.drain()
            writer.write(struct.pack('!I', 0))
            await writer.drain()
            result = await reader.readuntil(b"\0")
            if result == b"stream: OK\0":
                return
            if result.rstrip(b"\0").endswith(b" FOUND"):
                raise HTTPException(422, "Arquivo recusado pela verificação de segurança.")
            raise HTTPException(503, "Verificação de arquivos indisponível.")
        finally:
            writer.close()
            await writer.wait_closed()


class UploadBodyLimit:
    """Limita bytes reais antes de qualquer processamento multipart, inclusive chunked."""
    def __init__(self, app, limit=6 * 1024 * 1024):
        self.app = app
        self.limit = limit
        self.active = 0

    async def __call__(self, scope, receive, send):
        if scope['type'] != 'http' or scope['method'] != 'POST' or not scope['path'].endswith('/anexos'):
            return await self.app(scope, receive, send)
        if self.active >= 4:
            return await JSONResponse({'message': 'Uploads ocupados. Tente novamente.'}, status_code=429)(scope, receive, send)
        self.active += 1
        try:
            body = bytearray()
            deadline = asyncio.get_running_loop().time() + 30
            while True:
                try:
                    remaining = deadline - asyncio.get_running_loop().time()
                    message = await asyncio.wait_for(receive(), timeout=min(15, remaining))
                except asyncio.TimeoutError:
                    return await JSONResponse({'message': 'Upload expirado.'}, status_code=408)(scope, receive, send)
                if message['type'] == 'http.disconnect':
                    return
                chunk = message.get('body', b'')
                if len(body) + len(chunk) > self.limit:
                    return await JSONResponse({'message': 'Arquivo excede o limite.'}, status_code=413)(scope, receive, send)
                body.extend(chunk)
                if not message.get('more_body', False):
                    break
            body = bytes(body)
            delivered = False
            async def replay():
                nonlocal delivered
                if not delivered:
                    delivered = True
                    return {'type': 'http.request', 'body': body, 'more_body': False}
                return await receive()
            await self.app(scope, replay, send)
        finally:
            self.active -= 1
