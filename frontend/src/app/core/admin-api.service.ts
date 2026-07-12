import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ContactMessage, Page, Profile } from './models';

export type AdminResource =
  | 'skills'
  | 'experiences'
  | 'projects'
  | 'education'
  | 'certifications';

/** Write access to /api/v1/admin/** — requires an authenticated admin. */
@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/v1/admin';

  create<T>(resource: AdminResource, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.base}/${resource}`, body);
  }

  update<T>(resource: AdminResource, id: number, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.base}/${resource}/${id}`, body);
  }

  delete(resource: AdminResource, id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${resource}/${id}`);
  }

  reorder(resource: AdminResource, ids: number[]): Observable<void> {
    return this.http.put<void>(`${this.base}/${resource}/reorder`, { ids });
  }

  updateProfile(body: unknown): Observable<Profile> {
    return this.http.put<Profile>(`${this.base}/profile`, body);
  }

  listMessages(page: number, size: number): Observable<Page<ContactMessage>> {
    return this.http.get<Page<ContactMessage>>(`${this.base}/messages`, {
      params: { page, size },
    });
  }

  unreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.base}/messages/unread-count`);
  }

  markRead(id: number, read: boolean): Observable<ContactMessage> {
    return this.http.patch<ContactMessage>(`${this.base}/messages/${id}/read`, null, {
      params: { read },
    });
  }

  deleteMessage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/messages/${id}`);
  }

  upload(file: File): Observable<{ url: string }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ url: string }>(`${this.base}/upload`, form);
  }
}
