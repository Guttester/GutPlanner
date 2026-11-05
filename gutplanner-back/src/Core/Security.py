import hashlib
import secrets
from argon2 import PasswordHasher
from argon2.exceptions import VerificationError, InvalidHashError
from fastapi import Response
from .Config import Config

passwordHasher = PasswordHasher()


def hashPassword(password: str) -> str:
    if not 8 <= len(password) <= 1024:
        raise ValueError("A senha deve conter entre 8 e 1024 caracteres.")
    return passwordHasher.hash(password)


def verifyPassword(password: str, passwordHash: str) -> bool:
    if len(password) > 1024:
        return False
    try:
        return passwordHasher.verify(passwordHash, password)
    except (VerificationError, InvalidHashError):
        return False


def createToken() -> str:
    return secrets.token_urlsafe(32)


def hashToken(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def setSessionCookie(response: Response, token: str, config: Config) -> None:
    response.set_cookie("session", token, max_age=config.sessionSeconds, httponly=True, secure=config.secureCookies, samesite="lax", path="/")


def clearSessionCookie(response: Response, config: Config) -> None:
    response.delete_cookie("session", path="/", secure=config.secureCookies, httponly=True, samesite="lax")
    response.delete_cookie("XSRF-TOKEN", path="/", secure=config.secureCookies, samesite="strict")
