import { authGuard } from '@Core/infra/auth.guard';
import { Routes } from '@angular/router';
import { projectRouteGuard } from '@Core/infra/project-route.guard';

export const routes: Routes = [
  { path: 'docs', title: 'Documentação | GutPlanner', loadComponent: () => import('@Features/docs/docs.component').then(module => module.DocsComponent) },
  { path: 'contato', title: 'Contato | GutPlanner', loadComponent: () => import('@Features/login/pages/contato/contato.component').then(module => module.ContatoComponent) },
  {
    path: 'user',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    title: 'Usuário | GutPlanner',
    loadComponent: () => import('@Features/user/user.component').then(module => module.UserComponent),
    children: [
      { path: '', pathMatch: 'full', children: [] },
      { path: 'meu-perfil', title: 'Meu perfil | GutPlanner', loadComponent: () => import('@Features/user/meu-perfil/meu-perfil.component').then(module => module.MeuPerfilComponent) },
      { path: 'projeto/:id/kanban', canActivate: [projectRouteGuard], title: 'Kanban | GutPlanner', loadComponent: () => import('@Features/user/projetos/projeto-kanban/projeto-kanban.component').then(module => module.ProjetoKanbanComponent) },
      { path: 'projeto/:id/tarefas', data: { fillViewport: true }, canActivate: [projectRouteGuard], title: 'Tarefas | GutPlanner', loadComponent: () => import('@Features/user/projetos/projeto-tarefa/projeto-tarefa.component').then(module => module.ProjetoTarefaComponent) },
      { path: 'projeto/:id', pathMatch: 'full', redirectTo: 'projeto/:id/kanban' },
      { path: '**', redirectTo: '/user' }
    ]
  },
  { path: 'login', pathMatch: 'full', redirectTo: '' },
  {
    path: '',
    loadComponent: () => import('@Features/login/login.component').then(module => module.LoginComponent),
    children: [
      { path: '', pathMatch: 'full', title: 'Entrar | GutPlanner', loadComponent: () => import('@Features/login/pages/entrar/entrar.component').then(module => module.EntrarComponent) },
      { path: 'cadastro', title: 'Cadastro | GutPlanner', loadComponent: () => import('@Features/login/pages/cadastro/cadastro.component').then(module => module.CadastroComponent) },
      { path: 'redefinir-senha', title: 'Redefinir senha | GutPlanner', loadComponent: () => import('@Features/login/pages/redefinir-senha/redefinir-senha.component').then(module => module.RedefinirSenhaComponent) },
      { path: 'recuperacao', title: 'Recuperar acesso | GutPlanner', loadComponent: () => import('@Features/login/pages/recuperacao/recuperacao.component').then(module => module.RecuperacaoComponent) }
    ]
  },
  { path: '**', redirectTo: '' }
];
