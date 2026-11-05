import { Tarefa } from './Tarefa';

export interface Projeto {
  idProjeto: string;
  nomeProjeto: string;
  tarefas: Tarefa[];
}
