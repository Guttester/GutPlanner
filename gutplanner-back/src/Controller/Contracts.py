from typing import Annotated, Literal
from pydantic import BaseModel, ConfigDict, Field, StringConstraints, StrictBool
from src.Model.Tarefa import Tarefa

Text = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
Email = Annotated[str, StringConstraints(strip_whitespace=True, max_length=254, pattern=r"^[^\s@]+@[^\s@]+\.[^\s@]+$")]
Password = Annotated[str, StringConstraints(min_length=8, max_length=1024)]

class Contract(BaseModel):
    model_config = ConfigDict(extra="forbid")

class LoginInput(Contract):
    username: Annotated[str, StringConstraints(min_length=1, max_length=254)]
    password: Annotated[str, StringConstraints(min_length=1, max_length=1024)] = Field(repr=False)

class RegisterInput(Contract):
    nome: Text
    email: Email
    senha: Password = Field(repr=False)

class EmailInput(Contract):
    email: Email

class PasswordInput(Contract):
    senhaAtual: Annotated[str, StringConstraints(min_length=1, max_length=1024)] = Field(repr=False)
    novaSenha: Password = Field(repr=False)

class NameInput(Contract):
    nome: Text

class ProjectInput(Contract):
    nomeProjeto: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=80)]

class TaskInput(Tarefa):
    id: str = ""
    idProjeto: str = ""

class StatusInput(Contract):
    status: Literal["pending", "progress", "review", "done"] | None

class ChecklistInput(Contract):
    statusItem: StrictBool

class CommentInput(Contract):
    mensagem: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=1000)]

class ResetPasswordInput(Contract):
    token: Annotated[str, StringConstraints(min_length=32, max_length=128, pattern=r"^[A-Za-z0-9_-]+$")] = Field(repr=False)
    novaSenha: Password = Field(repr=False)
