import { ChangeDetectionStrategy, Component, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Tag/chips input usable inside reactive forms (value: string[]).
 * Enter or comma adds the draft; backspace on empty draft removes the last chip.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-chips-input',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ChipsInput),
      multi: true,
    },
  ],
  template: `
    <div class="input flex min-h-[2.9rem] flex-wrap items-center gap-1.5 !py-1.5">
      @for (chip of chips(); track $index) {
        <span class="chip !text-sm">
          {{ chip }}
          <button type="button" class="ml-1.5 opacity-60 transition-opacity hover:opacity-100" (click)="remove($index)" aria-label="Remove">✕</button>
        </span>
      }
      <input
        type="text"
        class="min-w-[8rem] flex-1 bg-transparent text-sm outline-none placeholder:text-lav-500/70"
        aria-label="Add tag"
        [placeholder]="chips().length === 0 ? 'Type and press Enter…' : ''"
        [value]="draft()"
        (input)="onDraftInput($event)"
        (keydown)="onKeydown($event)"
        (blur)="commit(); onTouched()"
      />
    </div>
  `,
})
export class ChipsInput implements ControlValueAccessor {
  protected readonly chips = signal<string[]>([]);
  protected readonly draft = signal('');

  private onChange: (value: string[]) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

  writeValue(value: string[] | null): void {
    this.chips.set(value ?? []);
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  protected onDraftInput(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.commit();
    } else if (event.key === 'Backspace' && this.draft() === '' && this.chips().length > 0) {
      this.remove(this.chips().length - 1);
    }
  }

  protected commit(): void {
    const value = this.draft().replace(/,/g, '').trim();
    if (value.length > 0 && !this.chips().includes(value)) {
      this.chips.update((c) => [...c, value]);
      this.onChange(this.chips());
    }
    this.draft.set('');
  }

  protected remove(index: number): void {
    this.chips.update((c) => c.filter((_, i) => i !== index));
    this.onChange(this.chips());
  }
}
