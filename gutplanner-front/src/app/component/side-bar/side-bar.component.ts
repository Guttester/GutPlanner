import { ThemeService } from '@Core/infra/theme.service';
import { AccountSettingsService } from '@Core/services/account-settings.service';
import { ProjectsService } from '@Core/services/projects.service';
import { Component, inject, effect, ElementRef, output, signal, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

export interface SidebarProject {
  readonly id: number;
  readonly name: string;
}

@Component({
  selector: 'app-side-bar',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.css'
})
export class SideBarComponent {
  readonly themeService = inject(ThemeService);
  readonly account = inject(AccountSettingsService).account;
  readonly createProject = output<SidebarProject>();
  readonly openKanban = output<SidebarProject>();
  readonly createTask = output<SidebarProject>();
  readonly deleteProject = output<SidebarProject>();
  readonly projects = inject(ProjectsService).projects;
  readonly addingProject = signal(false);
  readonly expandedProjectId = signal<number | null>(null);
  readonly projectToDelete = signal<SidebarProject | null>(null);
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
    const project = { id: Math.max(0, ...this.projects().map(item => item.id)) + 1, name: this.projectName.value.trim() };
    this.projects.update(projects => [...projects, project]);
    this.expandedProjectId.set(project.id);
    this.cancelProject();
    this.createProject.emit(project);
  }

  toggleProject(projectId: number): void {
    this.sidebarRecolhida = false;
    this.expandedProjectId.update(current => current === projectId ? null : projectId);
  }

  removeProject(project: SidebarProject): void {
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
    this.projects.update(projects => projects.filter(item => item.id !== project.id));
    if (this.expandedProjectId() === project.id) this.expandedProjectId.set(null);
    this.deleteProject.emit(project);
  }
}
