import { Injectable, OnDestroy } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AttachmentService implements OnDestroy {
  private readonly files = new Map<string, File>();
  register(file: File): string { const url = URL.createObjectURL(file); this.files.set(url, file); return url; }
  file(url: string): File | undefined { return this.files.get(url); }
  filename(url: string): string { return this.files.get(url)?.name ?? url.split('/').pop() ?? url; }
  isPdf(url: string): boolean { return this.files.get(url)?.type === 'application/pdf' || this.filename(url).toLowerCase().endsWith('.pdf'); }
  release(url: string): void { if (this.files.delete(url)) URL.revokeObjectURL(url); }
  ngOnDestroy(): void { for (const url of this.files.keys()) this.release(url); }
}
