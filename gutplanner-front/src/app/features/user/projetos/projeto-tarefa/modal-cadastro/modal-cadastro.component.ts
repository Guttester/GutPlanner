import { Component, Input, output } from '@angular/core';
import { Tarefa } from '@Core/model/Tarefa';
import { TaskFormComponent } from '../task-form.component';
@Component({ selector: 'app-modal-cadastro', imports: [TaskFormComponent], templateUrl: './modal-cadastro.component.html' })
export class ModalCadastroComponent {
  @Input() task: Tarefa | null = null;
  readonly saved = output<Tarefa>();
  readonly cancelled = output<void>();
}
