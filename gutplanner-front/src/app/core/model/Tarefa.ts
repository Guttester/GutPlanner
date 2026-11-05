import { ChecklistItem } from './CheckListItem';
import { Comentario } from './Comentario';

export interface Tarefa {
  id: string;
  idProjeto: string;
  nome: string;
  descricao?: string;
  dataVencimento?: Date | null;
  status: 'pending' | 'progress' | 'review' | 'done' | null;
  criticidade: 'Alta' | 'Média' | 'Baixa';
  categoria: string;
  tarefaVinculadaId?: string | null;
  tarefaVinculadaUrl?: string | null;
  informacoes: string;
  etiquetas: string[];
  responsavel: string;
  listDocuments: string[];
  checklist: ChecklistItem[];
  comentarios: Comentario[];
}

export function criarTarefaVazia(overrides: Partial<Tarefa> = {}): Tarefa {
  return { id: '', idProjeto: '', nome: '', descricao: '', dataVencimento: null, status: 'pending', criticidade: 'Média', categoria: '', informacoes: '', etiquetas: [], responsavel: '', listDocuments: [], checklist: [], comentarios: [], ...overrides };
}
