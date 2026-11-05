from datetime import datetime, timezone
from pymongo import ReturnDocument


class RepositoryUser:
    def __init__(self, database):
        self.database = database
        self.users = database.users
        self.sessions = database.sessions
        self.recoveries = database.recoveries

    async def create(self, document):
        await self.users.insert_one(dict(document))

    async def byEmail(self, email):
        return await self.users.find_one({"email": email}, {"_id": 0})

    async def byId(self, idUser):
        return await self.users.find_one({"idUser": idUser}, {"_id": 0})

    async def updateName(self, idUser, nome):
        return await self.users.find_one_and_update({"idUser": idUser}, {"$set": {"nome": nome}}, projection={"_id": 0}, return_document=ReturnDocument.AFTER)

    async def changePassword(self, idUser, oldHash, newHash):
        result = await self.users.update_one({"idUser": idUser, "passwordHash": oldHash}, {"$set": {"passwordHash": newHash}, "$inc": {"sessionVersion": 1}})
        return result.modified_count == 1

    async def createSession(self, document):
        await self.sessions.insert_one(dict(document))

    async def activeSession(self, tokenHash):
        return await self.sessions.find_one({"tokenHash": tokenHash, "expiresAt": {"$gt": datetime.now(timezone.utc)}}, {"_id": 0})

    async def revokeSession(self, tokenHash):
        await self.sessions.delete_one({"tokenHash": tokenHash})

    async def createRecovery(self, document):
        recovery = {key: value for key, value in document.items() if key != "idUser"}
        await self.users.update_one({"idUser": document["idUser"]}, {"$set": {"recovery": recovery}})

    async def resetPassword(self, tokenHash, newHash):
        # Consumo do token, troca da senha e revogação das sessões na mesma escrita.
        result = await self.users.update_one({
            "recovery.tokenHash": tokenHash,
            "recovery.expiresAt": {"$gt": datetime.now(timezone.utc)},
            "$expr": {"$eq": [{"$ifNull": ["$sessionVersion", 0]}, "$recovery.sessionVersion"]}
        }, {"$set": {"passwordHash": newHash}, "$inc": {"sessionVersion": 1}, "$unset": {"recovery": ""}})
        return result.modified_count == 1
