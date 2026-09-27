import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Profile } from './models';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  updateProfileSeo(profile: Profile | null): void {
    if (!profile) return;

    const fullTitle = `${profile.fullName} — ${profile.title}`;
    const description = profile.summary || 'Software Development Engineer Portfolio';
    const currentUrl = this.doc.location?.origin || '';
    const imageUrl = profile.avatarUrl || `${currentUrl}/og-image.png`;

    this.titleService.setTitle(fullTitle);

    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ property: 'og:title', content: fullTitle });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:image', content: imageUrl });
    if (currentUrl) {
      this.metaService.updateTag({ property: 'og:url', content: currentUrl });
    }

    this.metaService.updateTag({ name: 'twitter:title', content: fullTitle });
    this.metaService.updateTag({ name: 'twitter:description', content: description });
    this.metaService.updateTag({ name: 'twitter:image', content: imageUrl });

    this.updateStructuredData(profile, currentUrl);
  }

  private updateStructuredData(profile: Profile, currentUrl: string): void {
    const scriptId = 'schema-org-profile';
    let script = this.doc.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = this.doc.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      this.doc.head.appendChild(script);
    }

    const socialLinks = [
      profile.githubUrl,
      profile.linkedinUrl,
      profile.facebookUrl,
    ].filter((link): link is string => Boolean(link && link.trim().length > 0));

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      mainEntity: {
        '@type': 'Person',
        name: profile.fullName,
        jobTitle: profile.title,
        description: profile.summary,
        email: profile.email ? `mailto:${profile.email}` : undefined,
        telephone: profile.phone || undefined,
        address: profile.location
          ? {
              '@type': 'PostalAddress',
              addressLocality: profile.location,
            }
          : undefined,
        image: profile.avatarUrl || undefined,
        url: currentUrl || undefined,
        sameAs: socialLinks.length > 0 ? socialLinks : undefined,
      },
    };

    script.text = JSON.stringify(schema, null, 2);
  }

  updateArticleSeo(params: { title: string; description: string; image?: string; url?: string }): void {
    this.titleService.setTitle(params.title);
    this.metaService.updateTag({ name: 'description', content: params.description });
    this.metaService.updateTag({ property: 'og:title', content: params.title });
    this.metaService.updateTag({ property: 'og:description', content: params.description });
    if (params.image) {
      this.metaService.updateTag({ property: 'og:image', content: params.image });
      this.metaService.updateTag({ name: 'twitter:image', content: params.image });
    }
    if (params.url) {
      this.metaService.updateTag({ property: 'og:url', content: params.url });
    }
    this.metaService.updateTag({ name: 'twitter:title', content: params.title });
    this.metaService.updateTag({ name: 'twitter:description', content: params.description });
  }
}
