import { ProjectsService } from '@Core/services/projects.service';
import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ThemeService } from '@Core/infra/theme.service';
import { ProjectMock } from '@Core/mocks/projects.mock';
import { KanbanTask } from '@Core/model/KanbanTask';
import { TaskService } from '@Core/services/task.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideFolder, lucideListTodo, lucideClock3, lucideCircleCheck, lucideSearch, lucideColumns3, lucidePencil, lucideArrowUpRight } from '@ng-icons/lucide';
import { SideBarComponent } from '@Component/side-bar/side-bar.component';

@Component({
  selector: 'app-user',
  imports: [SideBarComponent, FormsModule, RouterLink, RouterOutlet, NgIcon],
  providers: [provideIcons({ lucideFolder, lucideListTodo, lucideClock3, lucideCircleCheck, lucideSearch, lucideColumns3, lucidePencil, lucideArrowUpRight })],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css',
  host: { '(document:click)': 'closeProfileOutside($event)', '(keydown.escape)': 'closeProfileMenu()' }
})
export class UserComponent {
  private readonly router = inject(Router);
  readonly themeService = inject(ThemeService);
  readonly profileMenuOpen = signal(false);
  private readonly profileMenu = viewChild<ElementRef<HTMLElement>>('profileMenu');
  private readonly profileToggle = viewChild<ElementRef<HTMLButtonElement>>('profileToggle');
  readonly projects = inject(ProjectsService).projects;
  readonly tasks = inject(TaskService).tasks;
  readonly selectedProject = signal<ProjectMock | null>(null);
  readonly addingTask = signal(false);
  readonly taskSearch = signal('');
  readonly projectFilter = signal(0);
  readonly dashboardTasks = computed(() => this.tasks().filter(task => this.projects().some(project => project.id === task.projectId) && (!this.projectFilter() || task.projectId === this.projectFilter()) && task.title.toLocaleLowerCase('pt-BR').includes(this.taskSearch().trim().toLocaleLowerCase('pt-BR'))));
  projectName(id: number): string { return this.projects().find(project => project.id === id)?.name ?? 'Projeto'; }
  taskCount(id: number): number { return this.tasks().filter(task => task.projectId === id).length; }
  statusTitle(status: string): string { return ({ pending: 'Backlog', progress: 'Em andamento', review: 'Revisão', done: 'Concluída' } as Record<string, string>)[status] ?? status; }
  taskTitle = '';
  readonly columns = [
    { status: 'pending', title: 'A fazer' },
    { status: 'progress', title: 'Em andamento' },
    { status: 'done', title: 'Concluídas' }
  ] as const;
  readonly indicators = computed(() => [
    { id: 'projects', title: 'Projetos', value: this.projects().length, symbol: 'lucideFolder', color: 'text-cyan-500' },
    { id: 'tasks', title: 'Tarefas', value: this.tasks().length, symbol: 'lucideListTodo', color: 'text-violet-500' },
    { id: 'progress', title: 'Em andamento', value: this.tasks().filter(task => task.status === 'progress').length, symbol: 'lucideClock3', color: 'text-amber-500' },
    { id: 'done', title: 'Concluídas', value: this.tasks().filter(task => task.status === 'done').length, symbol: 'lucideCircleCheck', color: 'text-emerald-500' }
  ]);

  closeProfileOutside(event: Event): void {
    if (event.target instanceof Node && !this.profileMenu()?.nativeElement.contains(event.target)) this.profileMenuOpen.set(false);
  }

  closeProfileMenu(): void {
    if (!this.profileMenuOpen()) return;
    this.profileMenuOpen.set(false);
    this.profileToggle()?.nativeElement.focus();
  }

  openProject(project: ProjectMock): void {
    this.selectedProject.set(project);
    this.addingTask.set(false);
    this.taskTitle = '';
  }

  navigateProject(project: ProjectMock, page: 'kanban' | 'tarefas'): void {
    this.selectedProject.set(null);
    this.addingTask.set(false);
    void this.router.navigate(['/user', 'projeto', project.id, page]);
  }

  addProject(project: ProjectMock): void {
    this.projects.update(projects => projects.some(item => item.id === project.id) ? projects : [...projects, project]);
    this.navigateProject(project, 'kanban');
  }

  removeProject(project: ProjectMock): void {
    this.projects.update(projects => projects.filter(item => item.id !== project.id));
    this.tasks.update(tasks => tasks.filter(task => task.projectId !== project.id));
    if (this.selectedProject()?.id === project.id) this.selectedProject.set(null);
    this.addingTask.set(false);
    if (this.router.isActive(`/user/projeto/${project.id}`, false)) void this.router.navigateByUrl('/user');
  }

  showTaskForm(project: ProjectMock): void {
    this.openProject(project);
    this.addingTask.set(true);
  }

  saveTask(): void {
    const project = this.selectedProject();
    const title = this.taskTitle.trim();
    if (!project || !title) return;
    this.tasks.update(tasks => [...tasks, { id: Math.max(0, ...tasks.map(task => task.id)) + 1, projectId: project.id, title, status: 'pending', priority: 'Média', category: '', description: '', information: '', attachments: [], labels: [], assignee: '', dueDate: '', checklist: [], comments: [] }]);
    this.taskTitle = '';
    this.addingTask.set(false);
  }

  projectTasks(status: KanbanTask['status']): KanbanTask[] {
    return this.tasks().filter(task => task.projectId === this.selectedProject()?.id && task.status === status);
  }
}
