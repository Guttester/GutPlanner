import { Component, Input, OnChanges, OnDestroy, inject, output } from '@angular/core';
import { AttachmentService } from '@Core/services/attachment.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideFileText, lucideImage, lucideTrash2 } from '@ng-icons/lucide';
import { FormsModule } from '@angular/forms';
import { TaskService } from '@Core/services/task.service';
import { KanbanTask } from '@Core/model/KanbanTask';
@Component({ selector: 'app-task-form', imports: [FormsModule, NgIcon], providers: [provideIcons({ lucidePlus, lucideFileText, lucideImage, lucideTrash2 })], templateUrl: './task-form.component.html' })
export class TaskFormComponent implements OnChanges, OnDestroy {
  @Input() task: KanbanTask | null = null;
  readonly saved = output<KanbanTask>();
  readonly cancelled = output<void>();
  draft!: KanbanTask;
  readonly store = inject(TaskService);
  labelInput = '';
  readonly attachmentsStore = inject(AttachmentService);
  private readonly pendingFiles = new Set<string>();
  private destroyed = false;
  checkingFiles = false;
  attachmentError = '';
  get assignees(): string[] { return [...new Set([...this.store.tasks().map(task => task.assignee), this.draft?.assignee ?? ''].filter(Boolean))]; }
  checklistTitle = '';
  error = '';
  ngOnChanges(): void {
    this.draft = this.task ? structuredClone(this.task) : { id: 0, projectId: 0, title: '', status: 'pending', priority: 'Média', category: '', description: '', information: '', attachments: [], labels: [], assignee: '', dueDate: '', checklist: [], comments: [] };
    this.labelInput = '';

    this.error = '';
  }
  addChecklist(): void {
    const title = this.checklistTitle.trim();
    if (!title) return;
    this.draft.checklist.push({ id: Math.max(0, ...this.draft.checklist.map(item => item.id)) + 1, title, done: false });
    this.checklistTitle = '';
  }
  removeChecklist(id: number): void { this.draft.checklist = this.draft.checklist.filter(item => item.id !== id); }
  save(): void {
    if (!this.draft.title.trim()) { this.error = 'Informe o título da tarefa.'; return; }
    if (this.checkingFiles) return;
    this.pendingFiles.clear();
    this.saved.emit({ ...this.draft, title: this.draft.title.trim() });
  }
  addLabel(): void {
    const label = this.labelInput.trim();
    if (label && !this.draft.labels.includes(label)) this.draft.labels.push(label);
    this.labelInput = '';
  }
  removeLabel(label: string): void { this.draft.labels = this.draft.labels.filter(item => item !== label); }
  async selectFiles(input: HTMLInputElement): Promise<void> {
    const files = Array.from(input.files ?? []);
    input.value = '';
    this.checkingFiles = true;
    const errors: string[] = [];
    try {
      for (const file of files) {
        if (file.size === 0 || file.size > 5 * 1024 * 1024) { errors.push(`${file.name}: o limite é de 5 MB por arquivo, e o arquivo não pode estar vazio.`); continue; }
        const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());
        const valid = (file.type === 'application/pdf' && /\.pdf$/i.test(file.name) && [37, 80, 68, 70, 45].every((value, index) => bytes[index] === value))
          || (file.type === 'image/png' && /\.png$/i.test(file.name) && [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value))
          || (file.type === 'image/jpeg' && /\.jpe?g$/i.test(file.name) && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255);
        if (!valid) { errors.push(`${file.name}: selecione um PDF, PNG ou JPEG válido.`); continue; }
        if (this.destroyed) return;
        const url = this.attachmentsStore.register(file);
        this.pendingFiles.add(url);
        this.draft.attachments.push(url);
      }
    } catch { errors.push('Não foi possível ler o arquivo. Tente selecioná-lo novamente.'); }
    finally { this.checkingFiles = false; this.attachmentError = errors.join(' '); }
  }
  removeAttachment(value: string): void {
    this.draft.attachments = this.draft.attachments.filter(item => item !== value);
    if (this.pendingFiles.delete(value)) this.attachmentsStore.release(value);
  }
  filename(value: string): string { return this.attachmentsStore.filename(value); }
  fileSize(value: string): string { const file = this.attachmentsStore.file(value); return file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : ''; }
  isPending(value: string): boolean { return this.pendingFiles.has(value); }
  ngOnDestroy(): void { this.destroyed = true; for (const url of this.pendingFiles) this.attachmentsStore.release(url); }
}
