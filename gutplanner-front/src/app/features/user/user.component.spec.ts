import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { UserComponent } from './user.component';

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('derives indicators from tasks and removes deleted project tasks', () => {
    expect(component.indicators().find(item => item.id === 'tasks')?.value).toBe(20);
    component.removeProject(component.projects()[0]);
    expect(component.tasks().every(task => task.idProjeto !== '1')).toBeTrue();
    expect(component.indicators().find(item => item.id === 'projects')?.value).toBe(1);
  });

  it('creates tasks in the selected project', () => {
    component.showTaskForm(component.projects()[1]);
    component.taskTitle = 'Nova tarefa';
    component.saveTask();
    expect(component.projectTasks('pending').some(task => task.nome === 'Nova tarefa')).toBeTrue();
    expect(component.addingTask()).toBeFalse();
  });
});
