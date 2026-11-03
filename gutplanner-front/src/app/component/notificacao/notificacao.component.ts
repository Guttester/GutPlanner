import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { ToastService, ToastType } from '@Core/services/toast.service';

@Component({
  selector: 'app-notificacao',
  imports: [NgClass],
  templateUrl: './notificacao.component.html',
  styleUrl: './notificacao.component.css'
})
export class NotificacaoComponent {
  readonly notifications = inject(ToastService);
  readonly titles: Record<ToastType, string> = {
    success: 'Sucesso', error: 'Erro', warning: 'Atenção', info: 'Informação'
  };
  readonly colors: Record<ToastType, string> = {
    success: 'text-emerald-500', error: 'text-red-500',
    warning: 'text-amber-500', info: 'text-cyan-500'
  };
}
