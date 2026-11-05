class RepositoryProjeto:
    def __init__(self, database):
        self.database = database
        self.projects = database.projects

    async def create(self, document):
        await self.projects.insert_one(dict(document))

    async def get(self, idProjeto):
        return await self.projects.find_one({"idProjeto": idProjeto}, {"_id": 0})

    async def listForUser(self, idUser):
        return await self.projects.find({"$or": [{"ownerId": idUser}, {"memberIds": idUser}]}, {"_id": 0}).to_list(length=None)

    async def delete(self, idProjeto, ownerId):
        async with self.database.client.start_session() as session:
            async def operation(session):
                result = await self.projects.delete_one({"idProjeto": idProjeto, "ownerId": ownerId}, session=session)
                if result.deleted_count:
                    for name in ("tasks", "attachments", "invitations"):
                        await self.database[name].delete_many({"idProjeto": idProjeto}, session=session)
                return result.deleted_count == 1
            return await session.with_transaction(operation)
