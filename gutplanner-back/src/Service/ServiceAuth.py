from datetime import datetime, timedelta, timezone
from uuid import uuid4
from fastapi import HTTPException
from pymongo.errors import DuplicateKeyError
from starlette.concurrency import run_in_threadpool
from src.Core.Authorization import SessionUser
from src.Core.Security import createToken, hashToken, hashPassword, verifyPassword
from src.Model.User import User


class ServiceAuth:
    def __init__(self, userRepository, projectRepository, config, recoverySender=None):
        self.userRepository = userRepository
        self.projectRepository = projectRepository
        self.config = config
        self.recoverySender = recoverySender
        self.dummyHash = hashPassword(createToken())

    def publicUser(self, user):
        return SessionUser(idUser=user["idUser"], nome=user["nome"], email=user["email"])

    async def register(self, nome, email, senha):
        user = User(nome=nome, email=email)
        passwordHash = await run_in_threadpool(hashPassword, senha)
        try:
            await self.userRepository.create({"idUser": str(uuid4()), "nome": user.nome, "email": user.email.lower(), "passwordHash": passwordHash, "sessionVersion": 0})
        except DuplicateKeyError:
            pass  # Resposta externa neutra, sem revelar contas existentes.

    async def login(self, username, password):
        if not isinstance(username, str) or not isinstance(password, str):
            raise HTTPException(422)
        user = await self.userRepository.byEmail(username.strip().lower())
        valid = await run_in_threadpool(verifyPassword, password, user["passwordHash"] if user else self.dummyHash)
        if not user or not valid:
            raise HTTPException(401)
        token = createToken()
        await self.userRepository.createSession({"tokenHash": hashToken(token), "idUser": user["idUser"], "sessionVersion": user.get("sessionVersion", 0), "expiresAt": datetime.now(timezone.utc) + timedelta(seconds=self.config.sessionSeconds)})
        return self.publicUser(user), token

    async def findActiveSession(self, tokenHash):
        session = await self.userRepository.activeSession(tokenHash)
        if not session:
            return None
        user = await self.userRepository.byId(session["idUser"])
        if not user or user.get("sessionVersion", 0) != session["sessionVersion"]:
            return None
        return self.publicUser(user)

    async def session(self, token):
        user = await self.findActiveSession(hashToken(token)) if token else None
        if not user:
            raise HTTPException(401)
        return user

    async def logout(self, token):
        if token:
            await self.userRepository.revokeSession(hashToken(token))

    async def projectRole(self, idUser, idProjeto):
        project = await self.projectRepository.get(idProjeto)
        if not project:
            return None
        if project["ownerId"] == idUser:
            return "owner"
        return "member" if idUser in project.get("memberIds", []) else None

    async def changePassword(self, user, senhaAtual, novaSenha):
        document = await self.userRepository.byId(user.idUser)
        if not document or not await run_in_threadpool(verifyPassword, senhaAtual, document["passwordHash"]):
            raise HTTPException(401)
        if senhaAtual == novaSenha:
            raise HTTPException(422)
        passwordHash = await run_in_threadpool(hashPassword, novaSenha)
        if not await self.userRepository.changePassword(user.idUser, document["passwordHash"], passwordHash):
            raise HTTPException(409)

    async def recover(self, email):
        email = User(nome="Recuperação", email=email).email.lower()
        if self.recoverySender is None:
            raise HTTPException(503, "Envio de recuperação não configurado.")
        user = await self.userRepository.byEmail(email)
        if user:
            token = createToken()
            await self.userRepository.createRecovery({"idUser": user["idUser"], "tokenHash": hashToken(token), "sessionVersion": user.get("sessionVersion", 0), "expiresAt": datetime.now(timezone.utc) + timedelta(minutes=30)})
            await self.recoverySender.sendRecovery(email, token)

    async def resetPassword(self, token, novaSenha):
        passwordHash = await run_in_threadpool(hashPassword, novaSenha)
        if not await self.userRepository.resetPassword(hashToken(token), passwordHash):
            raise HTTPException(400, "Link inválido ou expirado.")
