import { Component, Input, output } from '@angular/core';
import { Tarefa } from '@Core/model/Tarefa';
import { TaskFormComponent } from '../task-form.component';
@Component({ selector: 'app-modal-edicao', imports: [TaskFormComponent], templateUrl: './modal-edicao.component.html' })
export class ModalEdicaoComponent {
  @Input() task: Tarefa | null = null;
  readonly saved = output<Tarefa>();
  readonly cancelled = output<void>();
}
