import { AdminResource } from '../core/admin-api.service';

export interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'toggle' | 'chips' | 'image';
  required?: boolean;
  min?: number;
  max?: number;
  placeholder?: string;
  hint?: string;
}

export interface ResourceConfig {
  slug: AdminResource;
  title: string;
  singular: string;
  icon: string;
  columns: { key: string; label: string }[];
  fields: FieldDef[];
}

export const RESOURCE_CONFIGS: Record<string, ResourceConfig> = {
  skills: {
    slug: 'skills',
    title: 'Skills',
    singular: 'skill',
    icon: '🛠️',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'category', label: 'Category' },
      { key: 'proficiency', label: 'Proficiency %' },
    ],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Java' },
      { key: 'category', label: 'Category', type: 'text', required: true, placeholder: 'Backend', hint: 'Skills are grouped by category on the public page' },
      { key: 'proficiency', label: 'Proficiency (0–100)', type: 'number', required: true, min: 0, max: 100 },
      { key: 'icon', label: 'Icon (optional emoji)', type: 'text', placeholder: '⚙️' },
    ],
  },
  experiences: {
    slug: 'experiences',
    title: 'Experience',
    singular: 'experience',
    icon: '💼',
    columns: [
      { key: 'company', label: 'Company' },
      { key: 'role', label: 'Role' },
      { key: 'period', label: 'Period' },
    ],
    fields: [
      { key: 'company', label: 'Company', type: 'text', required: true },
      { key: 'role', label: 'Role', type: 'text', required: true },
      { key: 'period', label: 'Period', type: 'text', placeholder: '08/2024 – Present' },
      { key: 'description', label: 'Description', type: 'textarea', hint: 'One bullet point per line' },
      { key: 'techStack', label: 'Tech stack', type: 'chips', hint: 'Press Enter to add each technology' },
    ],
  },
  projects: {
    slug: 'projects',
    title: 'Projects',
    singular: 'project',
    icon: '🚀',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'period', label: 'Period' },
      { key: 'featured', label: 'Featured' },
    ],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'period', label: 'Period', type: 'text', placeholder: '04/2024 – 07/2024' },
      { key: 'description', label: 'Description', type: 'textarea', hint: 'One bullet point per line' },
      { key: 'techStack', label: 'Tech stack', type: 'chips', hint: 'Press Enter to add each technology' },
      { key: 'imageUrl', label: 'Cover image', type: 'image' },
      { key: 'demoUrl', label: 'Demo URL', type: 'text', placeholder: 'https://…' },
      { key: 'repoUrl', label: 'Repository URL', type: 'text', placeholder: 'https://github.com/…' },
      { key: 'featured', label: 'Featured project', type: 'toggle' },
    ],
  },
  education: {
    slug: 'education',
    title: 'Education',
    singular: 'education entry',
    icon: '🎓',
    columns: [
      { key: 'school', label: 'School' },
      { key: 'degree', label: 'Degree' },
      { key: 'period', label: 'Period' },
    ],
    fields: [
      { key: 'school', label: 'School', type: 'text', required: true },
      { key: 'degree', label: 'Degree / Major', type: 'text' },
      { key: 'period', label: 'Period', type: 'text', placeholder: '08/2018 – 06/2022' },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  certifications: {
    slug: 'certifications',
    title: 'Certifications',
    singular: 'certification',
    icon: '🏅',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'issuer', label: 'Issuer' },
      { key: 'issued', label: 'Issued' },
    ],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'TOEIC 855' },
      { key: 'issuer', label: 'Issuer', type: 'text', placeholder: 'ETS' },
      { key: 'issued', label: 'Issued (free text)', type: 'text', placeholder: '2023' },
      { key: 'url', label: 'Credential URL', type: 'text', placeholder: 'https://…' },
    ],
  },
};
