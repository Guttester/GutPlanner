import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SideBarComponent } from './side-bar.component';

describe('SideBarComponent', () => {
  let component: SideBarComponent;
  let fixture: ComponentFixture<SideBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideBarComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SideBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('adds a named project from the sidebar form', () => {
    const addButton: HTMLButtonElement = fixture.nativeElement.querySelector('#sidebar-create-project');
    expect(addButton.textContent).toContain('Adicionar Projeto');
    addButton.click();
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('#sidebar-project-name');
    input.value = '  Projeto de teste  ';
    input.dispatchEvent(new Event('input'));
    const form: HTMLFormElement = fixture.nativeElement.querySelector('#sidebar-project-form');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(component.projects().at(-1)?.name).toBe('Projeto de teste');
    expect(fixture.nativeElement.querySelector('#sidebar-project-form')).toBeNull();
    expect(fixture.nativeElement.querySelector('#sidebar-project-menu-3').hidden).toBeFalse();
  });

  it('expands and collapses actions for the clicked project', () => {
    const toggle: HTMLButtonElement = fixture.nativeElement.querySelector('#sidebar-project-toggle-1');
    const menu: HTMLElement = fixture.nativeElement.querySelector('#sidebar-project-menu-1');
    expect(menu.hidden).toBeTrue();
    toggle.click();
    fixture.detectChanges();
    expect(menu.hidden).toBeFalse();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.nativeElement.querySelector('#sidebar-project-menu-2').hidden).toBeTrue();
    toggle.click();
    fixture.detectChanges();
    expect(menu.hidden).toBeTrue();
  });

  it('removes only the selected project and keeps remaining IDs stable', () => {
    component.toggleProject(1);
    fixture.detectChanges();
    const deleteButton: HTMLButtonElement = fixture.nativeElement.querySelector('#sidebar-delete-project-1');
    deleteButton.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#sidebar-project-1')).not.toBeNull();
    fixture.nativeElement.querySelector('#sidebar-delete-confirm').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#sidebar-project-1')).toBeNull();
    expect(fixture.nativeElement.querySelector('#sidebar-project-2')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('#sidebar-project-trash')).toBeNull();
  });

  it('keeps projects when deletion is cancelled', () => {
    const deleted = spyOn(component.deleteProject, 'emit');
    component.removeProject(component.projects()[0]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#sidebar-delete-dialog').open).toBeTrue();
    fixture.nativeElement.querySelector('#sidebar-delete-cancel').click();
    fixture.detectChanges();
    expect(component.projects().length).toBe(2);
    expect(deleted).not.toHaveBeenCalled();
    expect(component.projectToDelete()).toBeNull();
  });

  it('rejects whitespace-only project names', () => {
    component.showProjectInput();
    component.projectName.setValue('   ');
    component.addProject();
    expect(component.projects().length).toBe(2);
    expect(component.addingProject()).toBeTrue();
  });
});
