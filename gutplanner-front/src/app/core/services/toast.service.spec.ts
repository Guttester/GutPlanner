import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('automatically closes a success message after five seconds', fakeAsync(() => {
    service.success('Tarefa criada.');
    tick(4999);
    expect(service.toast()?.closing).toBeFalse();
    tick(1);
    expect(service.toast()?.closing).toBeTrue();
    tick(200);
    expect(service.toast()).toBeNull();
  }));

  it('keeps errors visible until manually dismissed', fakeAsync(() => {
    service.error('Não foi possível salvar.');
    tick(10000);
    const toast = service.toast()!;
    expect(toast.closing).toBeFalse();
    service.dismiss(toast.id);
    tick(200);
    expect(service.toast()).toBeNull();
  }));

  it('does not let an old closing timer remove a replacement message', fakeAsync(() => {
    service.info('Primeira mensagem.');
    const previousId = service.toast()!.id;
    service.dismiss(previousId);
    tick(100);
    service.warning('Nova mensagem.', 0);
    service.dismiss(previousId);
    tick(10000);
    expect(service.toast()?.message).toBe('Nova mensagem.');
    expect(service.toast()?.closing).toBeFalse();
  }));
});
