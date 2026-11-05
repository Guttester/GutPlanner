import { ToastService } from '@Core/services/toast.service';
import { AuthService } from '@Core/services/auth.service';
import { Projeto } from '@Core/model/Projeto';
import { ThemeService } from '@Core/infra/theme.service';
import { AccountSettingsService } from '@Core/services/account-settings.service';
import { ProjectsService } from '@Core/services/projects.service';
import { Component, inject, effect, ElementRef, output, signal, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-side-bar',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.css'
})
export class SideBarComponent {
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly auth = inject(AuthService);
  loggingOut = false;
  readonly themeService = inject(ThemeService);
  readonly account = inject(AccountSettingsService).account;
  readonly createProject = output<Projeto>();
  readonly openKanban = output<Projeto>();
  readonly createTask = output<Projeto>();
  readonly deleteProject = output<Projeto>();
  private readonly projectStore = inject(ProjectsService);
  readonly projects = this.projectStore.projects;
  readonly addingProject = signal(false);
  readonly expandedProjectId = signal<string | null>(null);
  readonly projectToDelete = signal<Projeto | null>(null);
  private readonly deleteDialog = viewChild<ElementRef<HTMLDialogElement>>('deleteDialog');
  readonly projectName = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(80)]
  });
  private readonly projectNameInput = viewChild<ElementRef<HTMLInputElement>>('projectNameInput');
  menuMobileAberto = false;
  sidebarRecolhida = false;

  constructor() {
    effect(() => {
      if (this.addingProject()) this.projectNameInput()?.nativeElement.focus();
    });
  }

  logout(): void {
    if (this.loggingOut) return;
    this.loggingOut = true;
    this.auth.logout().subscribe({ next: () => { this.loggingOut = false; void this.router.navigateByUrl('/'); }, error: () => { this.loggingOut = false; } });
  }

  showProjectInput(): void {
    this.sidebarRecolhida = false;
    this.addingProject.set(true);
  }

  cancelProject(): void {
    this.addingProject.set(false);
    this.projectName.reset();
  }

  addProject(): void {
    this.projectName.markAsTouched();
    if (this.projectName.invalid) return;
    const project: Projeto = { idProjeto: crypto.randomUUID(), nomeProjeto: this.projectName.value.trim(), tarefas: [] };
    this.cancelProject();
    this.createProject.emit(project);
  }

  toggleProject(idProjeto: string): void {
    this.sidebarRecolhida = false;
    this.expandedProjectId.update(current => current === idProjeto ? null : idProjeto);
  }

  removeProject(project: Projeto): void {
    this.projectToDelete.set(project);
    this.deleteDialog()?.nativeElement.showModal();
  }

  cancelDelete(): void {
    this.deleteDialog()?.nativeElement.close();
    this.projectToDelete.set(null);
  }

  confirmDelete(): void {
    const project = this.projectToDelete();
    if (!project) return;
    this.cancelDelete();
    if (this.expandedProjectId() === project.idProjeto) this.expandedProjectId.set(null);
    this.deleteProject.emit(project);
  }
}
