from pymongo import ReturnDocument


class RepositoryTarefa:
    def __init__(self, database):
        self.database = database
        self.tasks = database.tasks

    async def listForProjects(self, projectIds):
        return await self.tasks.find({"idProjeto": {"$in": projectIds}}, {"_id": 0}).to_list(length=None)

    async def get(self, idProjeto, idTarefa):
        return await self.tasks.find_one({"idProjeto": idProjeto, "id": idTarefa}, {"_id": 0})

    async def create(self, document):
        await self.tasks.insert_one(dict(document))

    async def edit(self, idProjeto, idTarefa, fields):
        allowed = {"nome", "descricao", "dataVencimento", "status", "criticidade", "categoria", "tarefaVinculadaUrl", "tarefaVinculadaId", "informacoes", "etiquetas", "responsavel", "checklist"}
        values = {key: value for key, value in fields.items() if key in allowed}
        return await self.tasks.find_one_and_update({"idProjeto": idProjeto, "id": idTarefa}, {"$set": values}, projection={"_id": 0}, return_document=ReturnDocument.AFTER)

    async def setStatus(self, idProjeto, idTarefa, status):
        return await self.edit(idProjeto, idTarefa, {"status": status})

    async def setChecklist(self, idProjeto, idTarefa, idItem, statusItem):
        return await self.tasks.find_one_and_update({"idProjeto": idProjeto, "id": idTarefa, "checklist.id": idItem}, {"$set": {"checklist.$.statusItem": statusItem}}, projection={"_id": 0}, return_document=ReturnDocument.AFTER)

    async def addComment(self, idProjeto, idTarefa, comment):
        return await self.tasks.find_one_and_update({"idProjeto": idProjeto, "id": idTarefa}, {"$push": {"comentarios": comment}}, projection={"_id": 0}, return_document=ReturnDocument.AFTER)

    async def delete(self, idProjeto, idTarefa):
        async with self.database.client.start_session() as session:
            async def operation(session):
                result = await self.tasks.delete_one({"idProjeto": idProjeto, "id": idTarefa}, session=session)
                await self.database.attachments.delete_many({"idProjeto": idProjeto, "idTarefa": idTarefa}, session=session)
                return result.deleted_count == 1
            return await session.with_transaction(operation)
