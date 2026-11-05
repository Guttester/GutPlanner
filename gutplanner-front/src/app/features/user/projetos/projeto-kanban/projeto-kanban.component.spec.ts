import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetoKanbanComponent } from './projeto-kanban.component';

describe('ProjetoKanbanComponent', () => {
  let component: ProjetoKanbanComponent;
  let fixture: ComponentFixture<ProjetoKanbanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjetoKanbanComponent],
      providers: [provideRouter([]), { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '1' })), snapshot: { paramMap: convertToParamMap({ id: '1' }) } } }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjetoKanbanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('moves tasks between columns and preserves selected details', () => {
    const task = component.columnTasks('pending')[0];
    component.select(task);
    component.moveTask(task.id, 'progress');
    expect(component.columnTasks('pending').some(item => item.id === task.id)).toBeFalse();
    expect(component.columnTasks('progress').some(item => item.id === task.id)).toBeTrue();
    expect(component.selected()?.status).toBe('progress');
    expect(component.selected()?.listDocuments).toEqual(task.listDocuments);
  });

  it('reorders tasks and rejects tasks from another project', () => {
    const [first, second] = component.columnTasks('pending');
    component.moveTask(second.id, 'pending', first.id);
    expect(component.columnTasks('pending')[0].id).toBe(second.id);
    const foreign = component.tasks().find(task => task.idProjeto === '2')!;
    component.moveTask(foreign.id, 'done');
    expect(component.tasks().find(task => task.id === foreign.id)?.status).toBe(foreign.status);
  });

  it('supports moving a task with the keyboard', () => {
    const task = component.columnTasks('pending')[0];
    component.moveWithKeyboard(new KeyboardEvent('keydown', { key: 'ArrowRight' }), task);
    expect(component.tasks().find(item => item.id === task.id)?.status).toBe('progress');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
