import { AuthService } from './auth.service';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '@Core/infra/api.config';
import { Projeto } from '@Core/model/Projeto';
import { TaskService } from './task.service';
@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly auth = inject(AuthService);
  private accountId: string | undefined;
  constructor() { effect(() => { const id = this.auth.user()?.idUser; if (id !== this.accountId) { this.accountId = id; this.projectState.set([]); this.taskStore.tasks.set([]); } }); }
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_URL);
  private readonly taskStore = inject(TaskService);
  private readonly projectState = signal<Projeto[]>([]);
  readonly projects = computed(() => this.projectState().map(project => ({ ...project, tarefas: this.taskStore.tasks().filter(task => task.idProjeto === project.idProjeto) })));
  async load(): Promise<void> { const projects = await firstValueFrom(this.http.get<Projeto[]>(`${this.api}/projetos`)); this.projectState.set(projects); this.taskStore.tasks.set(projects.flatMap(project => project.tarefas.map(task => this.taskStore.normalize(task)))); }
  async add(project: Projeto): Promise<Projeto> { const result = await firstValueFrom(this.http.post<Projeto>(`${this.api}/projetos`, { nomeProjeto: project.nomeProjeto })); this.projectState.update(items => [...items, result]); return result; }
  async remove(id: string): Promise<void> { await firstValueFrom(this.http.delete(`${this.api}/projetos/${encodeURIComponent(id)}`)); this.projectState.update(items => items.filter(item => item.idProjeto !== id)); this.taskStore.tasks.update(items => items.filter(item => item.idProjeto !== id)); }
}
