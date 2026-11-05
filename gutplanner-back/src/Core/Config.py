import os
from pathlib import Path
from dotenv import load_dotenv
from functools import lru_cache
from typing import Literal
from pydantic import BaseModel, Field, SecretStr, model_validator


class Config(BaseModel):
    environment: Literal["development", "production"] = "development"
    publicUrl: str = "http://localhost:4200"
    developmentOrigin: str | None = None
    sessionSeconds: int = Field(default=28800, ge=300, le=604800)
    rateRequests: int = Field(default=120, ge=1)
    rateWindow: int = Field(default=60, ge=1)
    maxUploadBytes: int = 5 * 1024 * 1024
    smtpHost: str | None = None
    smtpPort: int = Field(default=587, ge=1, le=65535)
    smtpUser: str | None = None
    smtpPassword: SecretStr | None = None
    smtpFrom: str = "noreply@gutplanner.local"
    smtpSecurity: Literal["starttls", "ssl", "none"] = "starttls"
    mongoUri: SecretStr | None = None
    mongoDatabase: str = Field(default="gutplanner", pattern=r"^[a-zA-Z0-9_-]+$")

    @model_validator(mode="after")
    def validateOrigin(self):
        from urllib.parse import urlsplit
        url = urlsplit(self.publicUrl)
        if url.scheme not in ("http", "https") or not url.hostname or url.username or url.password or url.query or url.fragment or url.path not in ("", "/"):
            raise ValueError("PUBLIC_URL deve conter somente uma origem HTTP válida.")
        if self.environment == "production" and url.scheme != "https":
            raise ValueError("Produção exige HTTPS.")
        if self.environment == "production" and self.smtpHost and self.smtpSecurity == "none":
            raise ValueError("SMTP em produção exige TLS.")
        if self.developmentOrigin:
            local = urlsplit(self.developmentOrigin)
            if local.scheme != "http" or local.hostname not in {"localhost", "127.0.0.1"} or local.username or local.password or local.query or local.fragment or local.path not in ("", "/"):
                raise ValueError("DEVELOPMENT_ORIGIN deve ser uma origem HTTP local.")
            self.developmentOrigin = self.developmentOrigin.rstrip("/")
        self.publicUrl = self.publicUrl.rstrip("/")
        return self

    @property
    def secureCookies(self) -> bool:
        return self.environment == "production"


@lru_cache
def getConfig() -> Config:
    load_dotenv(Path(__file__).resolve().parents[2] / ".env", override=False)
    return Config(developmentOrigin=os.getenv("DEVELOPMENT_ORIGIN"), smtpHost=os.getenv("SMTP_HOST"), smtpPort=os.getenv("SMTP_PORT", "587"), smtpUser=os.getenv("SMTP_USER"), smtpPassword=os.getenv("SMTP_PASSWORD"), smtpFrom=os.getenv("SMTP_FROM", "noreply@gutplanner.local"), smtpSecurity=os.getenv("SMTP_SECURITY", "starttls"), environment=os.getenv("ENVIRONMENT", "development"), publicUrl=os.getenv("PUBLIC_URL", "http://localhost:4200"), sessionSeconds=os.getenv("SESSION_SECONDS", "28800"), rateRequests=os.getenv("RATE_REQUESTS", "120"), rateWindow=os.getenv("RATE_WINDOW", "60"), mongoUri=os.getenv("MONGODB_URI"), mongoDatabase=os.getenv("MONGODB_DATABASE", "gutplanner"))
