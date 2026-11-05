from typing import Annotated
from pydantic import BaseModel, ConfigDict, Field, SecretStr, StringConstraints
from .Projeto import Projeto

class User(BaseModel):
    model_config = ConfigDict(extra="forbid", validate_assignment=True)

    idUser: Annotated[str, StringConstraints(strict=True, min_length=1, max_length=128)] | None = None
    nome: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
    email: Annotated[str, StringConstraints(strip_whitespace=True, max_length=254, pattern=r"^[^\s@]+@[^\s@]+\.[^\s@]+$")]
    # Campo de entrada. Nunca serializar uma senha na resposta ou no documento do usuário.
    # A camada de autenticação deverá gerar e persistir somente o hash Argon2id.
    senha: SecretStr | None = Field(default=None, exclude=True, repr=False)
    meusProjetos: list[Projeto] = Field(default_factory=list)
    projetosCompartilhados: list[Projeto] = Field(default_factory=list)
