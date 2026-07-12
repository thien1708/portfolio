import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Certification,
  ContactPayload,
  EducationItem,
  Experience,
  Profile,
  Project,
  Skill,
} from './models';

/** Read-only access to the public portfolio endpoints. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/v1';

  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(`${this.base}/profile`);
  }

  getSkills(): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.base}/skills`);
  }

  getExperiences(): Observable<Experience[]> {
    return this.http.get<Experience[]>(`${this.base}/experiences`);
  }

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.base}/projects`);
  }

  getEducation(): Observable<EducationItem[]> {
    return this.http.get<EducationItem[]>(`${this.base}/education`);
  }

  getCertifications(): Observable<Certification[]> {
    return this.http.get<Certification[]>(`${this.base}/certifications`);
  }

  sendContact(payload: ContactPayload): Observable<void> {
    return this.http.post<void>(`${this.base}/contact`, payload);
  }
}
