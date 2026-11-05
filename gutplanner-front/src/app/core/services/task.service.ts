import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '@Core/infra/api.config';
import { Tarefa } from '@Core/model/Tarefa';
import { AttachmentService } from './attachment.service';
@Injectable({ providedIn: 'root' })
export class TaskService {
  readonly tasks = signal<Tarefa[]>([]);
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_URL);
  private readonly files = inject(AttachmentService);
  url(project: string, id?: string): string { return `${this.api}/projetos/${encodeURIComponent(project)}/tarefas${id ? '/' + encodeURIComponent(id) : ''}`; }
  normalize(task: Tarefa): Tarefa { return { ...task, dataVencimento: task.dataVencimento ? new Date(task.dataVencimento) : null, listDocuments: task.listDocuments.map(id => id.startsWith(this.api + '/') ? id : `${this.url(task.idProjeto, task.id)}/anexos/${encodeURIComponent(id)}`) }; }
  put(task: Tarefa): Tarefa { const value = this.normalize(task); this.tasks.update(items => [...items.filter(item => item.id !== value.id), value]); return value; }
  async load(): Promise<void> { this.tasks.set((await firstValueFrom(this.http.get<Tarefa[]>(`${this.api}/tarefas`))).map(item => this.normalize(item))); }
  async save(task: Tarefa, project: string, id?: string): Promise<void> {
    const current = id ? this.tasks().find(item => item.id === id) : undefined;
    const refs = (values: string[]) => values.map(value => decodeURIComponent(value.split('/').pop()!));
    const payload = { ...task, id: id ?? '', idProjeto: project, comentarios: current?.comentarios ?? [], listDocuments: refs(current?.listDocuments ?? []) };
    const result = await firstValueFrom(id ? this.http.put<Tarefa>(this.url(project, id), payload) : this.http.post<Tarefa>(this.url(project), payload));
    this.put(result);
    task.id = result.id;
    for (const url of current?.listDocuments ?? []) if (!task.listDocuments.includes(url)) await firstValueFrom(this.http.delete(url));
    for (const url of task.listDocuments) { const file = this.files.file(url); if (file) { const form = new FormData(); form.append('file', file); await firstValueFrom(this.http.post(`${this.url(project, result.id)}/anexos`, form)); this.files.release(url); } }
    this.put(await firstValueFrom(this.http.get<Tarefa>(this.url(project, result.id))));
  }
  async remove(project: string, id: string): Promise<void> { await firstValueFrom(this.http.delete(this.url(project, id))); this.tasks.update(items => items.filter(item => item.id !== id)); }
  async status(task: Tarefa, status: Tarefa['status']): Promise<void> { this.put(await firstValueFrom(this.http.patch<Tarefa>(`${this.url(task.idProjeto, task.id)}/status`, { status }))); }
  async checklist(task: Tarefa, id: string, statusItem: boolean): Promise<void> { this.put(await firstValueFrom(this.http.patch<Tarefa>(`${this.url(task.idProjeto, task.id)}/checklist/${encodeURIComponent(id)}`, { statusItem }))); }
  async comment(task: Tarefa, mensagem: string): Promise<void> { await firstValueFrom(this.http.post(`${this.url(task.idProjeto, task.id)}/comentarios`, { mensagem })); this.put(await firstValueFrom(this.http.get<Tarefa>(this.url(task.idProjeto, task.id)))); }
}
