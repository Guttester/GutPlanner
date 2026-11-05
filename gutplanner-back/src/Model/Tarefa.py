from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StrictStr, StringConstraints, HttpUrl, TypeAdapter, field_validator

from .CheckListItem import ChecklistItem
from .Comentario import Comentario

class Tarefa(BaseModel):
    model_config = ConfigDict(extra="forbid", validate_assignment=True)

    id: Annotated[str, StringConstraints(strict=True, min_length=1, max_length=128)]
    idProjeto: Annotated[str, StringConstraints(strict=True, min_length=1, max_length=128)]
    nome: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=160)]
    descricao: Annotated[str, StringConstraints(max_length=5000)] | None = None
    dataVencimento: datetime | None = None
    status: Literal["pending", "progress", "review", "done"] | None = None
    criticidade: Literal["Alta", "Média", "Baixa"] = "Média"
    categoria: Annotated[str, StringConstraints(max_length=160)] = ""
    tarefaVinculadaId: Annotated[str, StringConstraints(strict=True, min_length=1, max_length=128)] | None = None
    tarefaVinculadaUrl: Annotated[str, StringConstraints(max_length=2048)] | None = None
    informacoes: Annotated[str, StringConstraints(max_length=5000)] = ""
    etiquetas: list[StrictStr] = Field(default_factory=list)
    responsavel: Annotated[str, StringConstraints(max_length=160)] = ""
    listDocuments: list[StrictStr] = Field(default_factory=list)
    checklist: list[ChecklistItem] = Field(default_factory=list)
    comentarios: list[Comentario] = Field(default_factory=list)

    @field_validator("listDocuments")
    @classmethod
    def validateDocumentReferences(cls, references: list[str]) -> list[str]:
        if any(not value.strip() or value.lower().startswith(("blob:", "data:")) for value in references):
            raise ValueError("Anexos devem referenciar arquivos persistidos, sem URLs temporárias ou conteúdo embutido.")
        return references

    @field_validator("tarefaVinculadaUrl")
    @classmethod
    def validateTaskLink(cls, value: str | None) -> str | None:
        if not value or not value.strip():
            return None
        url = TypeAdapter(HttpUrl).validate_python(value.strip())
        if url.username or url.password:
            raise ValueError("O link não pode conter credenciais.")
        return str(url)
