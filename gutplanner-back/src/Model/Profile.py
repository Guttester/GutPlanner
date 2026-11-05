from pydantic import BaseModel, ConfigDict, StrictStr

class Profile(BaseModel):
    """Contrato do perfil público externo GutTester, separado da conta GutPlanner."""

    model_config = ConfigDict(extra="ignore")

    QAfuncao: StrictStr | None = None
    nome: StrictStr | None = None
    sobremin: StrictStr | None = None
    headline: StrictStr | None = None
    tagline: list[StrictStr] | None = None
    certificado: list[StrictStr] | None = None
    formacao: list[StrictStr] | None = None
    experiencia: list[StrictStr] | None = None
    github: StrictStr
    linkedin: StrictStr
    email: StrictStr
    discord: StrictStr
