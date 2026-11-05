from pymongo import AsyncMongoClient


class Database:
    def __init__(self, uri, databaseName):
        self.client = AsyncMongoClient(uri, tz_aware=True, serverSelectionTimeoutMS=5000)
        self.database = self.client[databaseName]

    async def initialize(self):
        await self.client.admin.command("ping")
        db = self.database
        for collection, field in (("users", "idUser"), ("users", "email"), ("projects", "idProjeto"), ("tasks", "id"), ("attachments", "id"), ("invitations", "id"), ("sessions", "tokenHash")):
            await db[collection].create_index(field, unique=True)
        await db.users.create_index("recovery.tokenHash", unique=True, sparse=True)
        await db.projects.create_index("ownerId")
        await db.projects.create_index("memberIds")
        await db.tasks.create_index("idProjeto")
        await db.attachments.create_index([("idProjeto", 1), ("idTarefa", 1)])
        await db.invitations.create_index([("idProjeto", 1), ("email", 1)], unique=True)
        await db.recoveries.create_index("idUser", unique=True)
        for name in ("sessions", "recoveries"):
            await db[name].create_index("expiresAt", expireAfterSeconds=0)

    async def close(self):
        await self.client.close()
