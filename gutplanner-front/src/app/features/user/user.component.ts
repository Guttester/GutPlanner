import { ToastService } from '@Core/services/toast.service';
import { AuthService } from '@Core/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { ProjectsService } from '@Core/services/projects.service';
import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { ThemeService } from '@Core/infra/theme.service';
import { Projeto } from '@Core/model/Projeto';
import { AccountSettingsService } from '@Core/services/account-settings.service';
import { Tarefa, criarTarefaVazia } from '@Core/model/Tarefa';
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
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly childPage = toSignal(this.router.events.pipe(filter(event => event instanceof NavigationEnd), map(() => this.route.snapshot.firstChild?.routeConfig?.path ?? '')), { initialValue: this.route.snapshot.firstChild?.routeConfig?.path ?? '' });
  readonly auth = inject(AuthService);
  loggingOut = false;
  readonly themeService = inject(ThemeService);
  readonly profileMenuOpen = signal(false);
  private readonly profileMenu = viewChild<ElementRef<HTMLElement>>('profileMenu');
  private readonly profileToggle = viewChild<ElementRef<HTMLButtonElement>>('profileToggle');
  private readonly settings = inject(AccountSettingsService);
  readonly account = this.settings.account;
  private readonly projectStore = inject(ProjectsService);
  readonly projects = this.projectStore.projects;
  private readonly taskStore = inject(TaskService);
  readonly tasks = this.taskStore.tasks;
  constructor() { void this.projectStore.load().catch(() => {}); void this.settings.loadProfile().catch(() => {}); }
  readonly selectedProject = signal<Projeto | null>(null);
  readonly addingTask = signal(false);
  readonly taskSearch = signal('');
  readonly projectFilter = signal('');
  readonly dashboardTasks = computed(() => this.tasks().filter(task => this.projects().some(project => project.idProjeto === task.idProjeto) && (!this.projectFilter() || task.idProjeto === this.projectFilter()) && task.nome.toLocaleLowerCase('pt-BR').includes(this.taskSearch().trim().toLocaleLowerCase('pt-BR'))));
  projectName(id: string): string { return this.projects().find(project => project.idProjeto === id)?.nomeProjeto ?? 'Projeto'; }
  taskCount(id: string): number { return this.tasks().filter(task => task.idProjeto === id).length; }
  statusTitle(status: string | null): string { return ({ pending: 'Backlog', progress: 'Em andamento', review: 'Revisão', done: 'Concluída' } as Record<string, string>)[status ?? ''] ?? status ?? 'Sem status'; }
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

  logout(): void {
    if (this.loggingOut) return;
    this.loggingOut = true;
    this.auth.logout().subscribe({ next: () => { this.loggingOut = false; void this.router.navigateByUrl('/'); }, error: () => { this.loggingOut = false; } });
  }

  closeProfileOutside(event: Event): void {
    if (event.target instanceof Node && !this.profileMenu()?.nativeElement.contains(event.target)) this.profileMenuOpen.set(false);
  }

  closeProfileMenu(): void {
    if (!this.profileMenuOpen()) return;
    this.profileMenuOpen.set(false);
    this.profileToggle()?.nativeElement.focus();
  }

  openProject(project: Projeto): void {
    this.selectedProject.set(project);
    this.addingTask.set(false);
    this.taskTitle = '';
  }

  navigateProject(project: Projeto, page: 'kanban' | 'tarefas'): void {
    this.selectedProject.set(null);
    this.addingTask.set(false);
    void this.router.navigate(['/user', 'projeto', project.idProjeto, page]);
  }

  async addProject(project: Projeto): Promise<void> { try { const result = await this.projectStore.add(project); this.toast.success('Projeto criado.'); this.navigateProject(result, 'kanban'); } catch {} }

  async removeProject(project: Projeto): Promise<void> { try { await this.projectStore.remove(project.idProjeto); this.toast.success('Projeto removido.'); this.selectedProject.set(null); if (this.router.isActive(`/user/projeto/${project.idProjeto}`, false)) void this.router.navigateByUrl('/user'); } catch {} }

  showTaskForm(project: Projeto): void {
    this.openProject(project);
    this.addingTask.set(true);
  }

  async saveTask(): Promise<void> { const project = this.selectedProject(); if (!project || !this.taskTitle.trim()) return; try { await this.taskStore.save(criarTarefaVazia({ nome: this.taskTitle.trim() }), project.idProjeto); this.taskTitle = ''; this.addingTask.set(false); } catch {} }

  projectTasks(status: Tarefa['status']): Tarefa[] {
    return this.tasks().filter(task => task.idProjeto === this.selectedProject()?.idProjeto && task.status === status);
  }
}
