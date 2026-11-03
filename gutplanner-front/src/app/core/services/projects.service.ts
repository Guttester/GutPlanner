import { Injectable, signal } from '@angular/core';
import { projectMocks } from '@Core/mocks/projects.mock';
@Injectable({ providedIn: 'root' })
export class ProjectsService { readonly projects = signal(projectMocks.map(project => ({ ...project }))); }
