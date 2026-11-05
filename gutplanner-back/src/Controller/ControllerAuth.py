from fastapi import APIRouter, Request, Response
from src.Core.Config import getConfig
from src.Core.Security import createToken, setSessionCookie, clearSessionCookie
from src.Core.Authorization import SessionUser
from .Dependencies import CurrentUser, ServiceDep
from .Contracts import LoginInput, RegisterInput, EmailInput, PasswordInput, ResetPasswordInput

router = APIRouter(prefix="/api/auth", tags=["Autenticação"])

@router.get("/csrf", status_code=204)
def csrf(response: Response):
    config = getConfig()
    response.set_cookie("XSRF-TOKEN", createToken(), secure=config.secureCookies, httponly=False, samesite="strict", path="/", max_age=config.sessionSeconds)

@router.get("/session")
async def session(user: CurrentUser) -> SessionUser:
    return user

@router.post("/login")
async def login(data: LoginInput, response: Response, services: ServiceDep) -> SessionUser:
    user, token = await services.auth.login(data.username, data.password)
    setSessionCookie(response, token, getConfig())
    return user

@router.post("/logout", status_code=204)
async def logout(request: Request, response: Response, services: ServiceDep):
    await services.auth.logout(request.cookies.get("session"))
    clearSessionCookie(response, getConfig())

@router.post("/register", status_code=204)
async def register(data: RegisterInput, services: ServiceDep):
    await services.auth.register(data.nome, data.email, data.senha)

@router.post("/password/recovery", status_code=204)
async def recovery(data: EmailInput, services: ServiceDep):
    await services.auth.recover(data.email)

@router.put("/password", status_code=204)
async def password(data: PasswordInput, user: CurrentUser, services: ServiceDep, response: Response):
    await services.auth.changePassword(user, data.senhaAtual, data.novaSenha)
    clearSessionCookie(response, getConfig())

@router.post("/password/reset", status_code=204)
async def resetPassword(data: ResetPasswordInput, services: ServiceDep, response: Response):
    await services.auth.resetPassword(data.token, data.novaSenha)
    clearSessionCookie(response, getConfig())
