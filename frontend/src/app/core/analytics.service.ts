import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private lastTrackedUrl = '';

  init(): void {
    if (typeof window === 'undefined') return;

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        const url = event.urlAfterRedirects || event.url;
        if (url !== this.lastTrackedUrl) {
          this.lastTrackedUrl = url;
          this.track('PAGE_VIEW', url);
        }
      });
  }

  track(eventType: string, path?: string, metadata?: string): void {
    if (typeof window === 'undefined') return;

    const currentPath = path || window.location.pathname;
    if (currentPath.startsWith('/admin')) {
      return; // Skip analytics for admin screens
    }

    const payload = {
      eventType,
      path: currentPath,
      referrer: document.referrer || undefined,
      metadata,
    };

    this.http.post('/api/v1/analytics/track', payload).subscribe({
      error: () => {
        // Silently ignore tracking errors to protect user experience
      },
    });
  }
}
