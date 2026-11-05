import smtplib
import ssl
from email.message import EmailMessage
from urllib.parse import urlencode
from fastapi import HTTPException
from starlette.concurrency import run_in_threadpool


class ServiceEmail:
    def __init__(self, config):
        self.config = config

    async def sendRecovery(self, email, token):
        origin = (self.config.developmentOrigin or self.config.publicUrl) if self.config.environment == "development" else self.config.publicUrl
        link = origin + "/redefinir-senha#" + urlencode({"token": token})
        message = EmailMessage()
        message["From"] = self.config.smtpFrom
        message["To"] = email
        message["Subject"] = "GutPlanner — Recuperação de senha"
        message.set_content("Recebemos uma solicitação de recuperação de senha.\n\n" + link + "\n\nO link expira em 30 minutos e só pode ser usado uma vez. Se você não solicitou, ignore esta mensagem.")
        try:
            await run_in_threadpool(self.send, message)
        except (OSError, smtplib.SMTPException, ValueError):
            raise HTTPException(503, "Envio de e-mail indisponível.") from None

    def send(self, message):
        config = self.config
        client = smtplib.SMTP_SSL if config.smtpSecurity == "ssl" else smtplib.SMTP
        options = {"timeout": 10}
        if config.smtpSecurity == "ssl":
            options["context"] = ssl.create_default_context()
        with client(config.smtpHost, config.smtpPort, **options) as smtp:
            if config.smtpSecurity == "starttls":
                smtp.starttls(context=ssl.create_default_context())
            if config.smtpUser:
                smtp.login(config.smtpUser, config.smtpPassword.get_secret_value() if config.smtpPassword else "")
            smtp.send_message(message)
