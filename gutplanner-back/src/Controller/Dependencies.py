from typing import Annotated
from fastapi import Depends, HTTPException, Request
from src.Core.Authorization import SessionUser, requireUser
from src.Service.Services import Services


def getServices(request: Request) -> Services:
    services = getattr(request.app.state, "services", None)
    if services is None:
        raise HTTPException(503)
    return services

CurrentUser = Annotated[SessionUser, Depends(requireUser)]
ServiceDep = Annotated[Services, Depends(getServices)]
