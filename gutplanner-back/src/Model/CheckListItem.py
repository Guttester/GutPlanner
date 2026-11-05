from typing import Annotated
from pydantic import BaseModel, ConfigDict, StrictBool, StringConstraints

class ChecklistItem(BaseModel):
    model_config = ConfigDict(extra="forbid", validate_assignment=True)

    id: Annotated[str, StringConstraints(strict=True, min_length=1, max_length=128)]
    descricao: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=160)]
    statusItem: StrictBool = False
