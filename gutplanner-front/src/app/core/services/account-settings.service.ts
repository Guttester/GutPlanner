import { Injectable, signal } from '@angular/core';
export interface ProjectInvitationDraft { id: number; projectId: number; email: string; }
@Injectable({ providedIn: 'root' })
export class AccountSettingsService {
  readonly account = signal({ name: 'GutTester', email: 'guttester@example.com' });
  readonly invitations = signal<ProjectInvitationDraft[]>([]);
}
