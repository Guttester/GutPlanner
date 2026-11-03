import { Component, effect, ElementRef, inject, output, signal, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ThemeService } from '../../core/infra/theme.service';

export interface SidebarProject {
  readonly id: number;
  readonly name: string;
}

@Component({
  selector: 'app-side-bar',
  imports: [ReactiveFormsModule],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.css'
})
export class SideBarComponent {
  readonly themeService = inject(ThemeService);
  readonly createProject = output<SidebarProject>();
  readonly openKanban = output<SidebarProject>();
  readonly createTask = output<SidebarProject>();
  readonly deleteProject = output<SidebarProject>();
  readonly projects = signal<SidebarProject[]>([
    { id: 1, name: 'Projeto pessoal' },
    { id: 2, name: 'Projeto de trabalho' }
  ]);
  readonly addingProject = signal(false);
  readonly expandedProjectId = signal<number | null>(null);
  readonly projectName = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(80)]
  });
  private readonly projectNameInput = viewChild<ElementRef<HTMLInputElement>>('projectNameInput');
  private nextProjectId = 3;
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
    const project = { id: this.nextProjectId++, name: this.projectName.value.trim() };
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
    this.projects.update(projects => projects.filter(item => item.id !== project.id));
    if (this.expandedProjectId() === project.id) this.expandedProjectId.set(null);
    this.deleteProject.emit(project);
  }
}
