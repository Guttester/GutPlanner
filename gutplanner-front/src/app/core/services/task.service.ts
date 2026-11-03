import { Injectable, signal } from '@angular/core';
import { kanbanMocks } from '@Core/mocks/kanban.mock';
@Injectable({ providedIn: 'root' })
export class TaskService {
  readonly tasks = signal(structuredClone(kanbanMocks));
}
