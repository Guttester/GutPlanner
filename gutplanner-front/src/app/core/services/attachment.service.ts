import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Injectable, OnDestroy, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AttachmentService implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly metadata = new Map<string, { name: string; type: string }>();
  async load(url: string): Promise<void> { if (url.startsWith('blob:') || this.metadata.has(url)) return; const response = await firstValueFrom(this.http.get(url, { observe: 'response', responseType: 'blob' })); const disposition = response.headers.get('Content-Disposition') ?? ''; const name = disposition.split("filename*=UTF-8''")[1]; this.metadata.set(url, { name: name ? decodeURIComponent(name) : 'Anexo', type: response.body?.type ?? '' }); }
  private readonly files = new Map<string, File>();
  register(file: File): string { const url = URL.createObjectURL(file); this.files.set(url, file); return url; }
  file(url: string): File | undefined { return this.files.get(url); }
  filename(url: string): string { return this.files.get(url)?.name ?? this.metadata.get(url)?.name ?? url.split('/').pop() ?? url; }
  isPdf(url: string): boolean { return (this.files.get(url)?.type ?? this.metadata.get(url)?.type) === 'application/pdf' || this.filename(url).toLowerCase().endsWith('.pdf'); }
  release(url: string): void { if (this.files.delete(url)) URL.revokeObjectURL(url); }
  ngOnDestroy(): void { for (const url of this.files.keys()) this.release(url); }
}
