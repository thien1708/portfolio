export interface Profile {
  id: number;
  fullName: string;
  title: string;
  summary: string | null;
  avatarUrl: string | null;
  email: string;
  phone: string | null;
  location: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  facebookUrl: string | null;
  cvUrl: string | null;
  typingRoles: string[];
  yearsExperience: number | null;
}

export interface Skill {
  id: number;
  name: string;
  category: string;
  proficiency: number;
  icon: string | null;
  sortOrder: number;
}

export interface Experience {
  id: number;
  company: string;
  role: string;
  period: string | null;
  description: string | null;
  techStack: string[];
  sortOrder: number;
}

export interface Project {
  id: number;
  name: string;
  period: string | null;
  description: string | null;
  techStack: string[];
  imageUrl: string | null;
  demoUrl: string | null;
  repoUrl: string | null;
  featured: boolean;
  sortOrder: number;
}

export interface EducationItem {
  id: number;
  school: string;
  degree: string | null;
  period: string | null;
  description: string | null;
  sortOrder: number;
}

export interface Certification {
  id: number;
  name: string;
  issuer: string | null;
  issued: string | null;
  url: string | null;
  sortOrder: number;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AuthResponse {
  accessToken: string;
  expiresInSeconds: number;
  email: string;
}

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}
