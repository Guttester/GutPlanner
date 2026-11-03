export interface ProjectMock { id: number; name: string; }
export interface TaskMock { id: number; projectId: number; title: string; status: 'pending' | 'progress' | 'done'; }

export const projectMocks: ProjectMock[] = [
  { id: 1, name: 'Projeto pessoal' },
  { id: 2, name: 'Projeto de trabalho' }
];

export const taskMocks: TaskMock[] = [
  { id: 1, projectId: 1, title: 'Implementar autenticação', status: 'pending' },
  { id: 2, projectId: 2, title: 'Criar endpoints do Kanban', status: 'progress' },
  { id: 3, projectId: 2, title: 'Configurar MongoDB', status: 'done' },
  ...['Montar quadro Kanban', 'Validar formulários', 'Revisar acessibilidade', 'Criar filtros', 'Integrar notificações'].map((title, index): TaskMock => ({ id: index + 4, projectId: index % 2 + 1, title, status: 'progress' })),
  ...['Configurar Angular', 'Configurar Tailwind', 'Definir tipografia', 'Criar navbar', 'Criar sidebar', 'Montar login', 'Criar página de contato', 'Definir rotas', 'Configurar CI', 'Preparar mocks'].map((title, index): TaskMock => ({ id: index + 9, projectId: index % 2 + 1, title, status: 'done' }))
];
