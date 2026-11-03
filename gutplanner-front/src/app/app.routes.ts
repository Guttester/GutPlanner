import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', title: 'Entrar | GutPlanner', loadComponent: () => import('./features/login/login.component').then(module => module.LoginComponent) },
  { path: 'contato', title: 'Contato | GutPlanner', loadComponent: () => import('./features/login/pages/contato/contato.component').then(module => module.ContatoComponent) },
  { path: 'user', title: 'Usuário | GutPlanner', loadComponent: () => import('./features/user/user.component').then(module => module.UserComponent) }
];
