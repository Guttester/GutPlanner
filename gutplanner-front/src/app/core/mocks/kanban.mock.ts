import { Tarefa } from '@Core/model/Tarefa';

const titles = ['Definir escopo da próxima versão', 'Levantar requisitos complementares', 'Estudar integração com calendário', 'Criar protótipo do Kanban', 'Implementar drag and drop', 'Ajustar layout do cartão de tarefa', 'Revisar critérios de aceite', 'Configurar projeto no GutPlanner', 'Criar estrutura inicial do backlog', 'Definir etiquetas e prioridades'];
export const kanbanMocks: Tarefa[] = [1, 2].flatMap(projectId => titles.map((title, index): Tarefa => ({
  id: String(projectId * 100 + index), idProjeto: String(projectId), nome: title,
  status: index < 3 ? 'pending' : index < 5 ? 'progress' : index < 7 ? 'review' : 'done',
  criticidade: (['Alta', 'Média', 'Baixa', 'Média', 'Alta', 'Média', 'Baixa', 'Baixa', 'Média', 'Baixa'] as const)[index],
  categoria: ['Planejamento', 'Requisitos', 'Pesquisa', 'Design', 'Desenvolvimento', 'UI/UX', 'Qualidade', 'Setup', 'Planejamento', 'Configuração'][index],
  descricao: index === 3 ? 'Criar o protótipo de alta fidelidade do Kanban do GutPlanner, contemplando as colunas, cartões, interação de arrastar e soltar e visualização de anexos da tarefa.' : `Organizar as atividades para ${title.toLowerCase()}, documentar as decisões e validar o resultado com a equipe.`,
  listDocuments: index === 3 ? ['/mocks/wireframe-home.svg', '/mocks/requisitos.pdf', '/mocks/fluxo-kanban.pdf'] : index % 2 === 0 ? ['/mocks/requisitos.pdf'] : [],
  informacoes: index === 1
    ? 'Levantar e registrar os requisitos complementares necessários para a próxima versão do projeto, considerando funcionalidades, integrações e ajustes de usabilidade.\nO objetivo é consolidar as demandas adicionais, validar com as áreas envolvidas e garantir que os requisitos estejam claros, consistentes e priorizados para o ciclo de desenvolvimento.'
    : `A tarefa “${title}” faz parte do planejamento do ${projectId === 1 ? 'projeto pessoal' : 'projeto de trabalho'}. Registrar decisões, dependências e evidências relacionadas à execução.\nAntes de concluir, conferir o checklist, revisar os anexos disponíveis e validar o resultado com o responsável pela tarefa.`,
  etiquetas: [['Planejamento', 'Produto'], ['Requisitos', 'Análise'], ['Pesquisa'], ['Design', 'UI/UX', 'Kanban'], ['Frontend', 'Kanban'], ['Design', 'Interface'], ['QA', 'Requisitos'], ['Configuração', 'Infra'], ['Backlog', 'Produto'], ['Processo']][index],
  responsavel: ['GutTester', 'Mateus', 'Laura', 'GutTester', 'Rafael', 'Laura', 'Mateus', 'GutTester', 'Rafael', 'Laura'][index], dataVencimento: new Date(2026, 10, 24),
  checklist: ['Definir estrutura das colunas', 'Criar cards com informações principais', 'Incluir visualização de anexos', 'Revisar e ajustar o protótipo'].map((title, id) => ({ id: String(id), descricao: title, statusItem: id < 2 })),
  comentarios: index === 3 ? [{ id: '1', autor: 'Laura', mensagem: 'O protótipo ficou ótimo! Sugiro apenas ajustar o espaçamento dos cards.' }, { id: '2', autor: 'Mateus', mensagem: 'Adicionei o fluxo atualizado no anexo fluxo-kanban.pdf.' }] : []
})));
