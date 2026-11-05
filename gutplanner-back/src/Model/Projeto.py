from typing import Annotated
from pydantic import BaseModel, ConfigDict, Field, StringConstraints, model_validator
from typing_extensions import Self

from .Tarefa import Tarefa


class Projeto(BaseModel):
    model_config = ConfigDict(extra="forbid", validate_assignment=True)

    idProjeto: Annotated[str, StringConstraints(strict=True, min_length=1, max_length=128)]
    nomeProjeto: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=80)]
    tarefas: list[Tarefa] = Field(default_factory=list)

    @model_validator(mode="after")
    def validateProjectTasks(self) -> Self:
        if any(tarefa.idProjeto != self.idProjeto for tarefa in self.tarefas):
            raise ValueError("As tarefas devem pertencer ao projeto informado.")
        return self
