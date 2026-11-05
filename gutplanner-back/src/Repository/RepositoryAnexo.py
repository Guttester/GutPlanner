class RepositoryAnexo:
    def __init__(self, database):
        self.database = database

    async def create(self, document):
        async with self.database.client.start_session() as session:
            async def operation(session):
                result = await self.database.tasks.update_one({"idProjeto": document["idProjeto"], "id": document["idTarefa"]}, {"$addToSet": {"listDocuments": document["id"]}}, session=session)
                if not result.matched_count:
                    return False
                await self.database.attachments.insert_one(dict(document), session=session)
                return True
            return await session.with_transaction(operation)

    async def get(self, idProjeto, idTarefa, idAnexo):
        return await self.database.attachments.find_one({"idProjeto": idProjeto, "idTarefa": idTarefa, "id": idAnexo}, {"_id": 0})

    async def delete(self, idProjeto, idTarefa, idAnexo):
        async with self.database.client.start_session() as session:
            async def operation(session):
                result = await self.database.attachments.delete_one({"idProjeto": idProjeto, "idTarefa": idTarefa, "id": idAnexo}, session=session)
                await self.database.tasks.update_one({"idProjeto": idProjeto, "id": idTarefa}, {"$pull": {"listDocuments": idAnexo}}, session=session)
                return result.deleted_count == 1
            return await session.with_transaction(operation)
