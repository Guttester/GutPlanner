import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ToastService } from '../../core/services/toast.service';

import { NotificacaoComponent } from './notificacao.component';

describe('NotificacaoComponent', () => {
  let component: NotificacaoComponent;
  let fixture: ComponentFixture<NotificacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificacaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('announces errors and renders their messages as text', () => {
    TestBed.inject(ToastService).error('<img src=x onerror=alert(1)>');
    fixture.detectChanges();
    const alert: HTMLElement = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alert.getAttribute('aria-live')).toBe('assertive');
    expect(alert.textContent).toContain('<img src=x onerror=alert(1)>');
    expect(alert.querySelector('img')).toBeNull();
  });

  it('allows an informational notification to be closed', fakeAsync(() => {
    TestBed.inject(ToastService).info('Quadro atualizado.', 0);
    fixture.detectChanges();
    const status: HTMLElement = fixture.nativeElement.querySelector('[role="status"]');
    expect(status.getAttribute('aria-live')).toBe('polite');
    const button: HTMLButtonElement = status.querySelector('button')!;
    button.click();
    tick(200);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]')).toBeNull();
  }));
});
