import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ProjectsService } from '@Core/services/projects.service';

// Valida apenas os projetos dos mocks. A autorização real pertence ao backend.
export const projectRouteGuard: CanActivateFn = route => {
  const id = route.paramMap.get('id');
  return inject(ProjectsService).projects().some(project => String(project.id) === id)
    || inject(Router).createUrlTree(['/user']);
};
