import { CdkDrag, CdkDragHandle, CdkDropList, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminApiService } from '../core/admin-api.service';
import { ToastService } from '../core/toast.service';
import { ChipsInput } from '../shared/chips-input';
import { FieldDef, RESOURCE_CONFIGS, ResourceConfig } from './resource-configs';

type Row = Record<string, unknown> & { id: number };

@Component({
  selector: 'app-resource-page',
  imports: [ReactiveFormsModule, ChipsInput, CdkDropList, CdkDrag, CdkDragHandle],
  template: `
    @if (config(); as cfg) {
      <div class="mx-auto max-w-5xl">
        <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 class="font-display text-2xl font-extrabold">{{ cfg.icon }} {{ cfg.title }}</h2>
            <p class="mt-1 text-sm text-ink/60 dark:text-lav-100/60">
              Drag rows to reorder — changes go live on the public site immediately.
            </p>
          </div>
          <button type="button" class="btn-primary !px-5 !py-2.5 text-sm" (click)="openCreate()">＋ Add {{ cfg.singular }}</button>
        </div>

        @if (loading()) {
          <div class="space-y-3">
            @for (i of [1, 2, 3, 4]; track i) {
              <div class="skeleton h-14 w-full"></div>
            }
          </div>
        } @else if (items().length === 0) {
          <div class="card p-14 text-center">
            <p class="text-4xl">🗂️</p>
            <p class="mt-3 font-display font-bold">Nothing here yet</p>
            <p class="mt-1 text-sm text-ink/60 dark:text-lav-100/60">Add your first {{ cfg.singular }} to get started.</p>
          </div>
        } @else {
          <div class="card overflow-x-auto !rounded-2xl">
            <table class="w-full min-w-[36rem] text-sm">
              <thead>
                <tr class="border-b border-lav-200/70 text-left dark:border-lav-700/40">
                  <th class="w-10 px-4 py-3"></th>
                  @for (col of cfg.columns; track col.key) {
                    <th class="px-4 py-3 font-display text-xs font-bold uppercase tracking-wider text-lav-600 dark:text-lav-300">{{ col.label }}</th>
                  }
                  <th class="w-28 px-4 py-3 text-right font-display text-xs font-bold uppercase tracking-wider text-lav-600 dark:text-lav-300">Actions</th>
                </tr>
              </thead>
              <tbody cdkDropList (cdkDropListDropped)="onDrop($event)">
                @for (row of items(); track row.id) {
                  <tr cdkDrag class="border-b border-lav-100/70 bg-transparent transition-colors last:border-0 hover:bg-lav-50/70 dark:border-lav-800/40 dark:hover:bg-lav-800/20">
                    <td class="px-4 py-3 text-lav-400" cdkDragHandle style="cursor: grab">≡</td>
                    @for (col of cfg.columns; track col.key) {
                      <td class="px-4 py-3">{{ format(row, col.key) }}</td>
                    }
                    <td class="px-4 py-3 text-right">
                      <button type="button" class="rounded-lg px-2 py-1 transition-colors hover:bg-lav-100 dark:hover:bg-lav-800/50" (click)="openEdit(row)" aria-label="Edit">✏️</button>
                      <button type="button" class="rounded-lg px-2 py-1 transition-colors hover:bg-rose-50 dark:hover:bg-rose-500/10" (click)="confirmDeleteId.set(row.id)" aria-label="Delete">🗑️</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Drawer -->
      @if (drawerMode() !== null) {
        <div class="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            class="absolute inset-0 cursor-default bg-ink/30 backdrop-blur-sm"
            aria-label="Close drawer"
            tabindex="-1"
            (click)="closeDrawer()"
          ></button>
          <div class="relative flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-lav-200/70 bg-white p-8 shadow-soft-lg dark:border-lav-700/40 dark:bg-[#1d1a3a]">
            <div class="mb-6 flex items-center justify-between">
              <h3 class="font-display text-xl font-extrabold">
                {{ drawerMode() === 'create' ? 'Add' : 'Edit' }} {{ cfg.singular }}
              </h3>
              <button type="button" class="grid h-9 w-9 place-items-center rounded-xl transition-colors hover:bg-lav-100 dark:hover:bg-lav-800/50" (click)="closeDrawer()" aria-label="Close">✕</button>
            </div>

            <form [formGroup]="form" (ngSubmit)="save()" class="flex flex-1 flex-col gap-5">
              @for (field of cfg.fields; track field.key) {
                <div>
                  <label class="label" [for]="'field-' + field.key">
                    {{ field.label }} @if (field.required) { * }
                  </label>
                  @switch (field.type) {
                    @case ('textarea') {
                      <textarea [id]="'field-' + field.key" [formControlName]="field.key" rows="5" class="input resize-y" [placeholder]="field.placeholder ?? ''"></textarea>
                    }
                    @case ('number') {
                      <input [id]="'field-' + field.key" type="number" [formControlName]="field.key" class="input" [min]="field.min ?? null" [max]="field.max ?? null" />
                    }
                    @case ('toggle') {
                      <label class="flex cursor-pointer items-center gap-3">
                        <input [id]="'field-' + field.key" type="checkbox" [formControlName]="field.key" class="peer sr-only" />
                        <span class="relative h-6 w-11 rounded-full bg-lav-200 transition-colors peer-checked:bg-gradient-to-r peer-checked:from-lav-500 peer-checked:to-peri-500 dark:bg-lav-800 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5"></span>
                        <span class="text-sm text-ink/70 dark:text-lav-100/70">Show with a ⭐ badge</span>
                      </label>
                    }
                    @case ('chips') {
                      <app-chips-input [formControlName]="field.key" />
                    }
                    @case ('image') {
                      <div class="space-y-3">
                        @if (form.get(field.key)?.value) {
                          <div class="relative inline-block">
                            <img [src]="form.get(field.key)?.value" alt="Preview" class="h-32 w-52 rounded-xl border border-lav-200 object-cover dark:border-lav-700/50" />
                            <button type="button" class="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-rose-500 text-xs text-white shadow" (click)="form.get(field.key)?.setValue('')" aria-label="Remove image">✕</button>
                          </div>
                        }
                        <label class="btn-ghost !px-4 !py-2 text-sm" [class.opacity-60]="uploading()">
                          @if (uploading()) { ⏳ Uploading… } @else { 🖼️ {{ form.get(field.key)?.value ? 'Replace' : 'Upload' }} image }
                          <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" class="hidden" (change)="onFile($event, field.key)" [disabled]="uploading()" />
                        </label>
                      </div>
                    }
                    @default {
                      <input [id]="'field-' + field.key" type="text" [formControlName]="field.key" class="input" [placeholder]="field.placeholder ?? ''" />
                    }
                  }
                  @if (field.hint) {
                    <p class="mt-1 text-xs text-ink/50 dark:text-lav-100/50">{{ field.hint }}</p>
                  }
                  @if (fieldInvalid(field)) {
                    <p class="mt-1 text-xs text-rose-500">This field is required.</p>
                  }
                </div>
              }

              <div class="mt-auto flex gap-3 pt-4">
                <button type="submit" class="btn-primary flex-1" [disabled]="saving()">
                  @if (saving()) { Saving… } @else { 💾 Save }
                </button>
                <button type="button" class="btn-ghost" (click)="closeDrawer()">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Delete confirm -->
      @if (confirmDeleteId() !== null) {
        <div class="fixed inset-0 z-50 grid place-items-center px-6">
          <button
            type="button"
            class="absolute inset-0 cursor-default bg-ink/30 backdrop-blur-sm"
            aria-label="Cancel"
            tabindex="-1"
            (click)="confirmDeleteId.set(null)"
          ></button>
          <div class="card relative w-full max-w-sm p-8 text-center">
            <p class="text-4xl">🗑️</p>
            <h3 class="mt-3 font-display text-lg font-extrabold">Delete this {{ cfg.singular }}?</h3>
            <p class="mt-1 text-sm text-ink/60 dark:text-lav-100/60">This cannot be undone.</p>
            <div class="mt-6 flex gap-3">
              <button type="button" class="flex-1 rounded-2xl bg-rose-500 px-5 py-2.5 font-semibold text-white transition-all hover:bg-rose-600" (click)="doDelete()">Delete</button>
              <button type="button" class="btn-ghost flex-1 !px-5 !py-2.5" (click)="confirmDeleteId.set(null)">Cancel</button>
            </div>
          </div>
        </div>
      }
    }
  `,
})
export class ResourcePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly adminApi = inject(AdminApiService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  protected readonly config = signal<ResourceConfig | null>(null);
  protected readonly items = signal<Row[]>([]);
  protected readonly loading = signal(true);
  protected readonly drawerMode = signal<'create' | 'edit' | null>(null);
  protected readonly confirmDeleteId = signal<number | null>(null);
  protected readonly saving = signal(false);
  protected readonly uploading = signal(false);

  protected form: FormGroup = this.fb.group({});
  private editingId: number | null = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('resource') ?? '';
      const cfg = RESOURCE_CONFIGS[slug];
      if (!cfg) {
        this.router.navigate(['/admin/profile']);
        return;
      }
      this.config.set(cfg);
      this.drawerMode.set(null);
      this.load();
    });
  }

  private load(): void {
    const cfg = this.config();
    if (!cfg) {
      return;
    }
    this.loading.set(true);
    this.http.get<Row[]>(`/api/v1/${cfg.slug}`).subscribe({
      next: (rows) => {
        this.items.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error(`Could not load ${cfg.title.toLowerCase()}.`);
      },
    });
  }

  private buildForm(row?: Row): void {
    const cfg = this.config();
    if (!cfg) {
      return;
    }
    const group: Record<string, unknown> = {};
    for (const field of cfg.fields) {
      const validators = [];
      if (field.required) {
        validators.push(Validators.required);
      }
      if (field.min !== undefined) {
        validators.push(Validators.min(field.min));
      }
      if (field.max !== undefined) {
        validators.push(Validators.max(field.max));
      }
      const fallback =
        field.type === 'toggle' ? false : field.type === 'chips' ? [] : field.type === 'number' ? 0 : '';
      group[field.key] = [row?.[field.key] ?? fallback, validators];
    }
    this.form = this.fb.group(group);
  }

  protected openCreate(): void {
    this.editingId = null;
    this.buildForm();
    this.drawerMode.set('create');
  }

  protected openEdit(row: Row): void {
    this.editingId = row.id;
    this.buildForm(row);
    this.drawerMode.set('edit');
  }

  protected closeDrawer(): void {
    this.drawerMode.set(null);
  }

  protected fieldInvalid(field: FieldDef): boolean {
    const control = this.form.get(field.key);
    return control !== null && control.invalid && (control.dirty || control.touched);
  }

  protected save(): void {
    const cfg = this.config();
    if (!cfg) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const request =
      this.editingId === null
        ? this.adminApi.create(cfg.slug, this.form.value)
        : this.adminApi.update(cfg.slug, this.editingId, this.form.value);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.drawerMode.set(null);
        this.toast.success(this.editingId === null ? 'Created! ✨' : 'Saved! ✨');
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(err?.error?.message ?? 'Save failed.');
      },
    });
  }

  protected doDelete(): void {
    const cfg = this.config();
    const id = this.confirmDeleteId();
    if (!cfg || id === null) {
      return;
    }
    this.adminApi.delete(cfg.slug, id).subscribe({
      next: () => {
        this.confirmDeleteId.set(null);
        this.toast.success('Deleted.');
        this.load();
      },
      error: () => {
        this.confirmDeleteId.set(null);
        this.toast.error('Delete failed.');
      },
    });
  }

  protected onDrop(event: CdkDragDrop<Row[]>): void {
    const cfg = this.config();
    if (!cfg || event.previousIndex === event.currentIndex) {
      return;
    }
    const rows = [...this.items()];
    moveItemInArray(rows, event.previousIndex, event.currentIndex);
    this.items.set(rows);
    this.adminApi.reorder(cfg.slug, rows.map((r) => r.id)).subscribe({
      next: () => this.toast.success('Order updated.'),
      error: () => {
        this.toast.error('Could not save the new order.');
        this.load();
      },
    });
  }

  protected onFile(event: Event, key: string): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.toast.error('Image is too large (max 2 MB).');
      return;
    }
    this.uploading.set(true);
    this.adminApi.upload(file).subscribe({
      next: (res) => {
        this.uploading.set(false);
        this.form.get(key)?.setValue(res.url);
        this.toast.success('Image uploaded.');
      },
      error: (err) => {
        this.uploading.set(false);
        this.toast.error(err?.error?.message ?? 'Upload failed.');
      },
    });
  }

  protected format(row: Row, key: string): string {
    const value = row[key];
    if (value === null || value === undefined || value === '') {
      return '—';
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'boolean') {
      return value ? '⭐ Yes' : '—';
    }
    const text = String(value);
    return text.length > 70 ? text.slice(0, 70) + '…' : text;
  }
}
