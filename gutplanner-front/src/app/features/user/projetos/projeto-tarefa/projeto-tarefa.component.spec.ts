import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetoTarefaComponent } from './projeto-tarefa.component';

describe('ProjetoTarefaComponent', () => {
  let component: ProjetoTarefaComponent;
  let fixture: ComponentFixture<ProjetoTarefaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjetoTarefaComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjetoTarefaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
