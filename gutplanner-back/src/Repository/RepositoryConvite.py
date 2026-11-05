class RepositoryConvite:
    def __init__(self, database):
        self.items = database.invitations

    async def listForProject(self, idProjeto):
        return await self.items.find({"idProjeto": idProjeto}, {"_id": 0}).to_list(length=None)

    async def create(self, document):
        await self.items.insert_one(dict(document))

    async def delete(self, idProjeto, idConvite):
        return (await self.items.delete_one({"idProjeto": idProjeto, "id": idConvite})).deleted_count == 1
