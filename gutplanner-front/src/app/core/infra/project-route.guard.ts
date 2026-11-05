import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ProjectsService } from '@Core/services/projects.service';
export const projectRouteGuard: CanActivateFn = async route => {
  const store = inject(ProjectsService); const router = inject(Router);
  try { await store.load(); return store.projects().some(project => project.idProjeto === route.paramMap.get('id')) || router.createUrlTree(['/user']); }
  catch { return router.createUrlTree(['/user']); }
};
