import { Component, Input, output } from '@angular/core';
import { KanbanTask } from '@Core/model/KanbanTask';
import { TaskFormComponent } from '../task-form.component';
@Component({ selector: 'app-modal-cadastro', imports: [TaskFormComponent], templateUrl: './modal-cadastro.component.html' })
export class ModalCadastroComponent {
  @Input() task: KanbanTask | null = null;
  readonly saved = output<KanbanTask>();
  readonly cancelled = output<void>();
}
