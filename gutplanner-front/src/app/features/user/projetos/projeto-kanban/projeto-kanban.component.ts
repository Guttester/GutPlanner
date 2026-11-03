import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideFileText, lucideFile, lucideImage, lucideChevronLeft, lucideChevronRight, lucideChevronDown, lucideX, lucideMaximize, lucideMinus, lucideFlag, lucideUser, lucideCalendar, lucideListChecks, lucideTags, lucideSend, lucideFolder, lucideBox, lucidePlay, lucideSearch, lucideCircleCheck, lucideCheck, lucideGripVertical, lucideMessageCircle, lucidePaperclip, lucideNotepadText, lucidePlus, lucideEllipsis } from '@ng-icons/lucide';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AttachmentService } from '@Core/services/attachment.service';
import { TaskService } from '@Core/services/task.service';
import { ProjectsService } from '@Core/services/projects.service';
import { KanbanTask } from '@Core/model/KanbanTask';

@Component({
  selector: 'app-projeto-kanban', imports: [DatePipe, NgIcon, RouterLink],
  providers: [provideIcons({ lucideFileText, lucideFile, lucideImage, lucideChevronLeft, lucideChevronRight, lucideChevronDown, lucideX, lucideMaximize, lucideMinus, lucideFlag, lucideUser, lucideCalendar, lucideListChecks, lucideTags, lucideSend, lucideFolder, lucideBox, lucidePlay, lucideSearch, lucideCircleCheck, lucideCheck, lucideGripVertical, lucideMessageCircle, lucidePaperclip, lucideNotepadText, lucidePlus, lucideEllipsis })],
  templateUrl: './projeto-kanban.component.html', styleUrl: './projeto-kanban.component.css'
})
export class ProjetoKanbanComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  private readonly projects = inject(ProjectsService).projects;
  readonly project = computed(() => this.projects().find(item => item.id === Number(this.params().get('id'))));
  readonly attachmentsStore = inject(AttachmentService);
  readonly tasks = inject(TaskService).tasks;
  readonly selectedId = signal<number | null>(null);
  readonly selected = computed(() => this.tasks().find(item => item.id === this.selectedId() && item.projectId === Number(this.params().get('id'))));
  readonly detailsCollapsed = signal(false);
  readonly zoom = signal(100);
  changeZoom(delta: number): void { this.zoom.update(value => Math.min(200, Math.max(50, value + delta))); }
  completedCount(): number { return this.selected()?.checklist.filter(item => item.done).length ?? 0; }
  addComment(input: HTMLInputElement): void {
    const message = input.value.trim();
    if (!message || message.length > 1000) return;
    this.tasks.update(tasks => tasks.map(task => task.id === this.selectedId() ? { ...task, comments: [...task.comments, { id: Math.max(0, ...task.comments.map(comment => comment.id)) + 1, author: 'GutTester', message }] } : task));
    input.value = '';
  }
  readonly attachmentIndex = signal(0);
  readonly attachment = computed(() => this.selected()?.attachments[this.attachmentIndex()]);
  readonly completion = computed(() => { const list = this.selected()?.checklist ?? []; return list.length ? Math.round(list.filter(item => item.done).length / list.length * 100) : 0; });
  readonly columns = [
    { status: 'pending', title: 'Backlog', icon: 'lucideBox', color: 'bg-gray-100/70 dark:bg-gray-950/40' },
    { status: 'progress', title: 'Em andamento', icon: 'lucidePlay', color: 'bg-gradient-to-br from-cyan-50/70 to-slate-100/80 dark:bg-none dark:bg-gray-950/40' },
    { status: 'review', title: 'Revisão', icon: 'lucideSearch', color: 'bg-gradient-to-br from-violet-50/80 to-indigo-50/80 dark:bg-none dark:bg-gray-950/40' },
    { status: 'done', title: 'Concluído', icon: 'lucideCircleCheck', color: 'bg-emerald-50/80 dark:bg-emerald-950/20' }
  ] as const;
  readonly draggingId = signal<number | null>(null);
  readonly dropStatus = signal<KanbanTask['status'] | null>(null);
  readonly moveAnnouncement = signal('');

  startDrag(event: DragEvent, task: KanbanTask): void {
    this.draggingId.set(task.id);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(task.id));
    }
  }

  allowDrop(event: DragEvent, status: KanbanTask['status']): void {
    if (this.draggingId() === null) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    this.dropStatus.set(status);
  }

  dropTask(event: DragEvent, status: KanbanTask['status'], beforeId?: number): void {
    event.preventDefault();
    event.stopPropagation();
    const id = this.draggingId();
    if (id !== null) this.moveTask(id, status, beforeId);
    this.endDrag();
  }

  endDrag(): void { this.draggingId.set(null); this.dropStatus.set(null); }

  moveTask(id: number, status: KanbanTask['status'], beforeId?: number): void {
    const task = this.tasks().find(item => item.id === id && item.projectId === Number(this.params().get('id')));
    if (!task || id === beforeId) return;
    this.tasks.update(tasks => {
      const remaining = tasks.filter(item => item.id !== id);
      const index = beforeId === undefined ? -1 : remaining.findIndex(item => item.id === beforeId && item.projectId === task.projectId && item.status === status);
      remaining.splice(index < 0 ? remaining.length : index, 0, { ...task, status });
      return remaining;
    });
    this.moveAnnouncement.set(`${task.title} movida para ${this.statusTitle(status)}.`);
  }

  moveWithKeyboard(event: KeyboardEvent, task: KanbanTask): void {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    event.stopPropagation();
    const index = this.columns.findIndex(column => column.status === task.status);
    const target = this.columns[index + (event.key === 'ArrowRight' ? 1 : -1)];
    if (target) this.moveTask(task.id, target.status);
  }

  columnTasks(status: KanbanTask['status']): KanbanTask[] { return this.tasks().filter(item => item.projectId === Number(this.params().get('id')) && item.status === status); }
  select(task: KanbanTask): void { this.selectedId.set(task.id); this.attachmentIndex.set(0); }
  moveAttachment(direction: number): void { const size = this.selected()?.attachments.length ?? 0; if (size) this.attachmentIndex.update(index => (index + direction + size) % size); }
  filename(path: string): string { return this.attachmentsStore.filename(path); }
  statusTitle(status: string): string { return this.columns.find(column => column.status === status)?.title ?? status; }
  toggleChecklist(id: number): void { this.tasks.update(tasks => tasks.map(task => task.id === this.selectedId() ? { ...task, checklist: task.checklist.map(item => item.id === id ? { ...item, done: !item.done } : item) } : task)); }
}
