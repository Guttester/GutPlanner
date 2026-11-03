import { KanbanTask } from '@Core/model/KanbanTask';

const titles = ['Definir escopo da próxima versão', 'Levantar requisitos complementares', 'Estudar integração com calendário', 'Criar protótipo do Kanban', 'Implementar drag and drop', 'Ajustar layout do cartão de tarefa', 'Revisar critérios de aceite', 'Configurar projeto no GutPlanner', 'Criar estrutura inicial do backlog', 'Definir etiquetas e prioridades'];
export const kanbanMocks: KanbanTask[] = [1, 2].flatMap(projectId => titles.map((title, index): KanbanTask => ({
  id: projectId * 100 + index, projectId, title,
  status: index < 3 ? 'pending' : index < 5 ? 'progress' : index < 7 ? 'review' : 'done',
  priority: (['Alta', 'Média', 'Baixa', 'Média', 'Alta', 'Média', 'Baixa', 'Baixa', 'Média', 'Baixa'] as const)[index],
  category: ['Planejamento', 'Requisitos', 'Pesquisa', 'Design', 'Desenvolvimento', 'UI/UX', 'Qualidade', 'Setup', 'Planejamento', 'Configuração'][index],
  description: index === 3 ? 'Criar o protótipo de alta fidelidade do Kanban do GutPlanner, contemplando as colunas, cartões, interação de arrastar e soltar e visualização de anexos da tarefa.' : `Organizar as atividades para ${title.toLowerCase()}, documentar as decisões e validar o resultado com a equipe.`,
  attachments: index === 3 ? ['/mocks/wireframe-home.svg', '/mocks/requisitos.pdf', '/mocks/fluxo-kanban.pdf'] : index % 2 === 0 ? ['/mocks/requisitos.pdf'] : [],
  information: index === 1
    ? 'Levantar e registrar os requisitos complementares necessários para a próxima versão do projeto, considerando funcionalidades, integrações e ajustes de usabilidade.\nO objetivo é consolidar as demandas adicionais, validar com as áreas envolvidas e garantir que os requisitos estejam claros, consistentes e priorizados para o ciclo de desenvolvimento.'
    : `A tarefa “${title}” faz parte do planejamento do ${projectId === 1 ? 'projeto pessoal' : 'projeto de trabalho'}. Registrar decisões, dependências e evidências relacionadas à execução.\nAntes de concluir, conferir o checklist, revisar os anexos disponíveis e validar o resultado com o responsável pela tarefa.`,
  labels: [['Planejamento', 'Produto'], ['Requisitos', 'Análise'], ['Pesquisa'], ['Design', 'UI/UX', 'Kanban'], ['Frontend', 'Kanban'], ['Design', 'Interface'], ['QA', 'Requisitos'], ['Configuração', 'Infra'], ['Backlog', 'Produto'], ['Processo']][index],
  assignee: ['GutTester', 'Mateus', 'Laura', 'GutTester', 'Rafael', 'Laura', 'Mateus', 'GutTester', 'Rafael', 'Laura'][index], dueDate: '2026-11-24',
  checklist: ['Definir estrutura das colunas', 'Criar cards com informações principais', 'Incluir visualização de anexos', 'Revisar e ajustar o protótipo'].map((title, id) => ({ id, title, done: id < 2 })),
  comments: index === 3 ? [{ id: 1, author: 'Laura', message: 'O protótipo ficou ótimo! Sugiro apenas ajustar o espaçamento dos cards.' }, { id: 2, author: 'Mateus', message: 'Adicionei o fluxo atualizado no anexo fluxo-kanban.pdf.' }] : []
})));
