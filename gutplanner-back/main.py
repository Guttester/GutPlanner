from fastapi import FastAPI, Response
from contextlib import asynccontextmanager
from src.Database.Database import Database
from src.Service.Services import Services
from src.Core.Config import getConfig
from src.Core.Exception import configureExceptions
from src.Core.Middleware import configureMiddleware
from src.Service.ServiceSeo import ServiceSeo

def createApp() -> FastAPI:
    config = getConfig()
    @asynccontextmanager
    async def lifespan(app):
        database = None
        try:
            if config.mongoUri:
                database = Database(config.mongoUri.get_secret_value(), config.mongoDatabase)
                await database.initialize()
                app.state.services = Services(database.database, config)
                app.state.authorizationStore = app.state.services.auth
            elif config.secureCookies:
                raise RuntimeError("MONGODB_URI é obrigatória em produção.")
            yield
        finally:
            if database:
                await database.close()

    app = FastAPI(title="GutPlanner", lifespan=lifespan, docs_url="/api/docs" if not config.secureCookies else None, redoc_url=None, openapi_url="/api/openapi.json")
    configureExceptions(app)
    configureMiddleware(app, config)
    seo = ServiceSeo(config)

    from src.Controller import ControllerAuth, ControllerUser, ControllerProjeto, ControllerTarefa, ControllerConvite, ControllerAnexo
    for controller in (ControllerAuth, ControllerUser, ControllerProjeto, ControllerTarefa, ControllerConvite, ControllerAnexo):
        app.include_router(controller.router)

    @app.get("/robots.txt", include_in_schema=False)
    def robots():
        return Response(seo.robots(), media_type="text/plain")

    @app.get("/sitemap.xml", include_in_schema=False)
    def sitemap():
        return Response(seo.sitemap(), media_type="application/xml")

    return app

app = createApp()