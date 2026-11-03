import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch, lucidePlus, lucidePencil, lucideTrash2, lucideNotepadText, lucideX } from '@ng-icons/lucide';
import { TaskService } from '@Core/services/task.service';
import { KanbanTask } from '@Core/model/KanbanTask';
import { ModalCadastroComponent } from './modal-cadastro/modal-cadastro.component';
import { ModalEdicaoComponent } from './modal-edicao/modal-edicao.component';
@Component({ selector: 'app-projeto-tarefa', host: { class: 'block min-w-0 lg:flex lg:min-h-0 lg:flex-1' }, imports: [NgIcon, ModalCadastroComponent, ModalEdicaoComponent], providers: [provideIcons({ lucideSearch, lucidePlus, lucidePencil, lucideTrash2, lucideNotepadText, lucideX })], templateUrl: './projeto-tarefa.component.html' })
export class ProjetoTarefaComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  readonly store = inject(TaskService);
  readonly query = signal('');
  readonly projectId = computed(() => Number(this.params().get('id')));
  readonly projectTasks = computed(() => this.store.tasks().filter(task => task.projectId === this.projectId()));
  readonly filtered = computed(() => this.projectTasks().filter(task => task.title.toLocaleLowerCase('pt-BR').includes(this.query().trim().toLocaleLowerCase('pt-BR'))));
  readonly editing = signal<KanbanTask | null>(null);
  readonly opened = signal(false);
  readonly deleting = signal<KanbanTask | null>(null);
  readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('editorDialog');
  open(task: KanbanTask | null = null): void { this.editing.set(task); this.opened.set(true); this.dialog()?.nativeElement.showModal(); }
  close(): void { this.dialog()?.nativeElement.close(); this.opened.set(false); this.editing.set(null); }
  save(task: KanbanTask): void {
    const current = this.editing();
    this.store.tasks.update(tasks => current ? tasks.map(item => item.id === current.id && item.projectId === this.projectId() ? { ...task, id: current.id, projectId: this.projectId() } : item) : [...tasks, { ...task, id: Math.max(0, ...tasks.map(item => item.id)) + 1, projectId: this.projectId() }]);
    this.close();
  }
  remove(): void {
    const task = this.deleting();
    if (task) this.store.tasks.update(tasks => tasks.filter(item => item.id !== task.id || item.projectId !== this.projectId()));
    this.deleting.set(null);
  }
}
