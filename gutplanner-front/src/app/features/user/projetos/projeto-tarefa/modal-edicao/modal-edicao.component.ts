import { Component, Input, output } from '@angular/core';
import { KanbanTask } from '@Core/model/KanbanTask';
import { TaskFormComponent } from '../task-form.component';
@Component({ selector: 'app-modal-edicao', imports: [TaskFormComponent], templateUrl: './modal-edicao.component.html' })
export class ModalEdicaoComponent {
  @Input() task: KanbanTask | null = null;
  readonly saved = output<KanbanTask>();
  readonly cancelled = output<void>();
}
