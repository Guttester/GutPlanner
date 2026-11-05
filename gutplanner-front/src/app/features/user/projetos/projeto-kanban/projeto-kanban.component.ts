import { ToastService } from '@Core/services/toast.service';
import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideFileText, lucideFile, lucideImage, lucideChevronLeft, lucideChevronRight, lucideChevronDown, lucideX, lucideMaximize, lucideMinus, lucideFlag, lucideUser, lucideCalendar, lucideListChecks, lucideTags, lucideSend, lucideFolder, lucideBox, lucidePlay, lucideSearch, lucideCircleCheck, lucideCheck, lucideGripVertical, lucideMessageCircle, lucidePaperclip, lucideNotepadText, lucidePlus, lucideEllipsis } from '@ng-icons/lucide';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AttachmentService } from '@Core/services/attachment.service';
import { AccountSettingsService } from '@Core/services/account-settings.service';
import { TaskService } from '@Core/services/task.service';
import { ProjectsService } from '@Core/services/projects.service';
import { Tarefa } from '@Core/model/Tarefa';

@Component({
  selector: 'app-projeto-kanban', imports: [DatePipe, NgIcon, RouterLink],
  providers: [provideIcons({ lucideFileText, lucideFile, lucideImage, lucideChevronLeft, lucideChevronRight, lucideChevronDown, lucideX, lucideMaximize, lucideMinus, lucideFlag, lucideUser, lucideCalendar, lucideListChecks, lucideTags, lucideSend, lucideFolder, lucideBox, lucidePlay, lucideSearch, lucideCircleCheck, lucideCheck, lucideGripVertical, lucideMessageCircle, lucidePaperclip, lucideNotepadText, lucidePlus, lucideEllipsis })],
  templateUrl: './projeto-kanban.component.html', styleUrl: './projeto-kanban.component.css'
})
export class ProjetoKanbanComponent {
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  private readonly projects = inject(ProjectsService).projects;
  readonly project = computed(() => this.projects().find(item => item.idProjeto === (this.params().get('id') ?? '')));
  readonly attachmentsStore = inject(AttachmentService);
  readonly account = inject(AccountSettingsService).account;
  linkedTask(task: Tarefa): Tarefa | undefined { return this.tasks().find(item => item.id === task.tarefaVinculadaId && item.idProjeto === task.idProjeto); }
  avatarInitial(name: string | null | undefined): string { return name?.trim().charAt(0).toUpperCase() || '?'; }
  private readonly taskStore = inject(TaskService);
  readonly tasks = this.taskStore.tasks;
  readonly selectedId = signal<string | null>(null);
  readonly selected = computed(() => this.tasks().find(item => item.id === this.selectedId() && item.idProjeto === (this.params().get('id') ?? '')));
  readonly detailsCollapsed = signal(false);
  readonly zoom = signal(100);
  changeZoom(delta: number): void { this.zoom.update(value => Math.min(200, Math.max(50, value + delta))); }
  completedCount(): number { return this.selected()?.checklist.filter(item => item.statusItem).length ?? 0; }
  async addComment(input: HTMLInputElement): Promise<void> { const task = this.selected(); const message = input.value.trim(); if (!task || !message || message.length > 1000) return; try { await this.taskStore.comment(task, message); input.value = ''; this.toast.success('Comentário adicionado.'); } catch {} }
  readonly attachmentIndex = signal(0);
  readonly attachment = computed(() => this.selected()?.listDocuments[this.attachmentIndex()]);
  readonly completion = computed(() => { const list = this.selected()?.checklist ?? []; return list.length ? Math.round(list.filter(item => item.statusItem).length / list.length * 100) : 0; });
  readonly columns = [
    { status: 'pending', title: 'Backlog', icon: 'lucideBox', color: 'bg-gray-100/70 dark:bg-gray-950/40' },
    { status: 'progress', title: 'Em andamento', icon: 'lucidePlay', color: 'bg-gradient-to-br from-cyan-50/70 to-slate-100/80 dark:bg-none dark:bg-gray-950/40' },
    { status: 'review', title: 'Revisão', icon: 'lucideSearch', color: 'bg-gradient-to-br from-violet-50/80 to-indigo-50/80 dark:bg-none dark:bg-gray-950/40' },
    { status: 'done', title: 'Concluído', icon: 'lucideCircleCheck', color: 'bg-emerald-50/80 dark:bg-emerald-950/20' }
  ] as const;
  readonly draggingId = signal<string | null>(null);
  readonly dropStatus = signal<Tarefa['status'] | null>(null);
  readonly moveAnnouncement = signal('');

  startDrag(event: DragEvent, task: Tarefa): void {
    this.draggingId.set(task.id);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(task.id));
    }
  }

  allowDrop(event: DragEvent, status: Tarefa['status']): void {
    if (this.draggingId() === null) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    this.dropStatus.set(status);
  }

  dropTask(event: DragEvent, status: Tarefa['status'], beforeId?: string): void {
    event.preventDefault();
    event.stopPropagation();
    const id = this.draggingId();
    if (id !== null) this.moveTask(id, status, beforeId);
    this.endDrag();
  }

  endDrag(): void { this.draggingId.set(null); this.dropStatus.set(null); }

  async moveTask(id: string, status: Tarefa['status'], beforeId?: string): Promise<void> { const task = this.tasks().find(item => item.id === id); if (!task || task.status === status) return; try { await this.taskStore.status(task, status); this.moveAnnouncement.set(`${task.nome} movida para ${this.statusTitle(status)}.`); } catch {} }

  moveWithKeyboard(event: KeyboardEvent, task: Tarefa): void {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    event.stopPropagation();
    const index = this.columns.findIndex(column => column.status === task.status);
    const target = this.columns[index + (event.key === 'ArrowRight' ? 1 : -1)];
    if (target) this.moveTask(task.id, target.status);
  }

  columnTasks(status: Tarefa['status']): Tarefa[] { return this.tasks().filter(item => item.idProjeto === (this.params().get('id') ?? '') && item.status === status); }
  select(task: Tarefa): void { this.selectedId.set(task.id); this.attachmentIndex.set(0); for (const url of task.listDocuments) void this.attachmentsStore.load(url).catch(() => {}); }
  moveAttachment(direction: number): void { const size = this.selected()?.listDocuments.length ?? 0; if (size) this.attachmentIndex.update(index => (index + direction + size) % size); }
  filename(path: string): string { return this.attachmentsStore.filename(path); }
  statusTitle(status: string | null): string { return this.columns.find(column => column.status === status)?.title ?? status ?? 'Sem status'; }
  async toggleChecklist(id: string): Promise<void> { const task = this.selected(); const item = task?.checklist.find(item => item.id === id); if (!task || !item) return; try { await this.taskStore.checklist(task, id, !item.statusItem); } catch {} }
}
