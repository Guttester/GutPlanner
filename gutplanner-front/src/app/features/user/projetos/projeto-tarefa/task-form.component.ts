import { Component, Input, OnChanges, OnDestroy, inject, output } from '@angular/core';
import { AttachmentService } from '@Core/services/attachment.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideFileText, lucideImage, lucideTrash2 } from '@ng-icons/lucide';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AccountSettingsService } from '@Core/services/account-settings.service';
import { TaskService } from '@Core/services/task.service';
import { Tarefa, criarTarefaVazia } from '@Core/model/Tarefa';
@Component({ selector: 'app-task-form', imports: [FormsModule, NgIcon], providers: [provideIcons({ lucidePlus, lucideFileText, lucideImage, lucideTrash2 })], templateUrl: './task-form.component.html' })
export class TaskFormComponent implements OnChanges, OnDestroy {
  @Input() task: Tarefa | null = null;
  readonly saved = output<Tarefa>();
  readonly cancelled = output<void>();
  draft!: Tarefa;
  readonly store = inject(TaskService);
  readonly account = inject(AccountSettingsService).account;
  readonly categories = ['Desenvolvimento', 'QA & Testes', 'UI/UX', 'Estudo de Caso', 'Arquitetura', 'Infraestrutura', 'DevOps / CI/CD', 'Segurança', 'Banco de Dados', 'Documentação', 'Pesquisa & Desenvolvimento', 'Manutenção', 'Planejamento', 'Estudos', 'Bug'];
  isBug(): boolean { return this.draft.categoria.trim().toLowerCase() === 'bug'; }
  private readonly route = inject(ActivatedRoute);
  linkedSearch = '';
  linkedOpen = false;
  linkedTasks(): Tarefa[] {
    const projectId = this.draft.idProjeto || this.route.snapshot.pathFromRoot.map(route => route.paramMap.get('id')).find(Boolean);
    return this.store.tasks().filter(task => task.idProjeto === projectId && task.id !== this.draft.id && task.nome.toLocaleLowerCase('pt-BR').includes(this.linkedSearch.trim().toLocaleLowerCase('pt-BR')));
  }
  searchLinked(value: string): void { this.linkedSearch = value; this.draft.tarefaVinculadaId = null; this.linkedOpen = true; }
  chooseLinked(task: Tarefa): void { this.draft.tarefaVinculadaId = task.id; this.linkedSearch = task.nome; this.linkedOpen = false; }
  clearLinked(): void { this.draft.tarefaVinculadaId = null; this.linkedSearch = ''; }
  labelInput = '';
  readonly attachmentsStore = inject(AttachmentService);
  private readonly pendingFiles = new Set<string>();
  private destroyed = false;
  checkingFiles = false;
  attachmentError = '';
  get assignees(): string[] { return [...new Set([this.account().name.trim(), this.draft?.responsavel?.trim() ?? ''].filter(Boolean))]; }
  checklistTitle = '';
  error = '';
  ngOnChanges(): void {
    this.draft = this.task ? structuredClone(this.task) : criarTarefaVazia({ responsavel: this.account().name.trim() });
    this.linkedSearch = this.store.tasks().find(task => task.id === this.draft.tarefaVinculadaId)?.nome ?? '';
    this.linkedOpen = false;
    this.labelInput = '';

    this.error = '';
  }
  dateInput(): string { const date = this.draft.dataVencimento; return date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : ''; }
  setDate(value: string): void { this.draft.dataVencimento = value ? new Date(value + 'T00:00:00') : null; }
  addChecklist(): void {
    const title = this.checklistTitle.trim();
    if (!title) return;
    this.draft.checklist.push({ id: crypto.randomUUID(), descricao: title, statusItem: false });
    this.checklistTitle = '';
  }
  removeChecklist(id: string): void { this.draft.checklist = this.draft.checklist.filter(item => item.id !== id); }
  save(): void {
    if (!this.draft.nome.trim()) { this.error = 'Informe o título da tarefa.'; return; }
    if (this.isBug() && this.linkedSearch.trim() && !this.draft.tarefaVinculadaId) { this.error = 'Selecione uma tarefa da lista.'; return; }
    if (!this.isBug()) this.draft.tarefaVinculadaId = null;
    this.draft.tarefaVinculadaUrl = null;
    if (this.checkingFiles) return;
    this.pendingFiles.clear();
    this.saved.emit({ ...this.draft, nome: this.draft.nome.trim() });
  }
  addLabel(): void {
    const label = this.labelInput.trim();
    if (label && !this.draft.etiquetas.includes(label)) this.draft.etiquetas.push(label);
    this.labelInput = '';
  }
  removeLabel(label: string): void { this.draft.etiquetas = this.draft.etiquetas.filter(item => item !== label); }
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
        this.draft.listDocuments.push(url);
      }
    } catch { errors.push('Não foi possível ler o arquivo. Tente selecioná-lo novamente.'); }
    finally { this.checkingFiles = false; this.attachmentError = errors.join(' '); }
  }
  removeAttachment(value: string): void {
    this.draft.listDocuments = this.draft.listDocuments.filter(item => item !== value);
    if (this.pendingFiles.delete(value)) this.attachmentsStore.release(value);
  }
  filename(value: string): string { return this.attachmentsStore.filename(value); }
  fileSize(value: string): string { const file = this.attachmentsStore.file(value); return file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : ''; }
  isPending(value: string): boolean { return this.pendingFiles.has(value); }
  ngOnDestroy(): void { this.destroyed = true; for (const url of this.pendingFiles) this.attachmentsStore.release(url); }
}
