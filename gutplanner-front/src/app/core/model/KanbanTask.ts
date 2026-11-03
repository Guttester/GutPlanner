import { TaskMock } from '@Core/mocks/projects.mock';

export interface KanbanTask extends Omit<TaskMock, 'status'> {
  status: TaskMock['status'] | 'review';
  priority: 'Alta' | 'Média' | 'Baixa';
  category: string;
  description: string;
  information: string;
  attachments: string[];
  labels: string[];
  assignee: string;
  dueDate: string;
  checklist: { id: number; title: string; done: boolean }[];
  comments: { id: number; author: string; message: string }[];
}
