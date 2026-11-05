from typing import Annotated
from pydantic import BaseModel, ConfigDict, StringConstraints

class Comentario(BaseModel):
    model_config = ConfigDict(extra="forbid", validate_assignment=True)

    id: Annotated[str, StringConstraints(strict=True, min_length=1, max_length=128)]
    autor: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
    mensagem: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=1000)]
