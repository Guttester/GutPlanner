import { ToastService } from '@Core/services/toast.service';
import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch, lucidePlus, lucidePencil, lucideTrash2, lucideNotepadText, lucideX } from '@ng-icons/lucide';
import { TaskService } from '@Core/services/task.service';
import { Tarefa } from '@Core/model/Tarefa';
import { ModalCadastroComponent } from './modal-cadastro/modal-cadastro.component';
import { ModalEdicaoComponent } from './modal-edicao/modal-edicao.component';
@Component({ selector: 'app-projeto-tarefa', host: { class: 'block min-w-0 lg:flex lg:min-h-0 lg:flex-1' }, imports: [NgIcon, ModalCadastroComponent, ModalEdicaoComponent], providers: [provideIcons({ lucideSearch, lucidePlus, lucidePencil, lucideTrash2, lucideNotepadText, lucideX })], templateUrl: './projeto-tarefa.component.html' })
export class ProjetoTarefaComponent {
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  readonly store = inject(TaskService);
  readonly query = signal('');
  readonly idProjeto = computed(() => (this.params().get('id') ?? ''));
  readonly projectTasks = computed(() => this.store.tasks().filter(task => task.idProjeto === this.idProjeto()));
  readonly filtered = computed(() => this.projectTasks().filter(task => task.nome.toLocaleLowerCase('pt-BR').includes(this.query().trim().toLocaleLowerCase('pt-BR'))));
  readonly editing = signal<Tarefa | null>(null);
  readonly opened = signal(false);
  readonly deleting = signal<Tarefa | null>(null);
  readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('editorDialog');
  open(task: Tarefa | null = null): void { this.editing.set(task); this.opened.set(true); this.dialog()?.nativeElement.showModal(); }
  close(): void { this.dialog()?.nativeElement.close(); this.opened.set(false); this.editing.set(null); }
  saving = false;
  async save(task: Tarefa): Promise<void> { if (this.saving) return; this.saving = true; try { await this.store.save(task, this.idProjeto(), this.editing()?.id); this.toast.success('Tarefa salva.'); this.close(); } catch { if (task.id) this.editing.set(this.store.tasks().find(item => item.id === task.id) ?? null); } finally { this.saving = false; } }
  async remove(): Promise<void> { const task = this.deleting(); if (!task) return; try { await this.store.remove(this.idProjeto(), task.id); this.toast.success('Tarefa removida.'); this.deleting.set(null); } catch {} }
}
