import { ChecklistItem } from "./CheckListItem";

export interface Tarefa {
  id: string;
  nome: string;
  descricao?: string;
  dataVencimento?: Date | null;
  status: string | null;
  listDocuments: any[];
  checklist: ChecklistItem[];
}

