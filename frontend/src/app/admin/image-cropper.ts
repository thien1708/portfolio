import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

/**
 * Minimal pan+zoom cropper: the image always covers the fixed-aspect frame;
 * drag to reposition, slide to zoom. Confirm re-renders the same transform
 * at export resolution and emits a JPEG blob ready for upload.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-image-cropper',
  template: `
    <div class="fixed inset-0 z-[60] grid place-items-center px-6">
      <button
        type="button"
        class="absolute inset-0 cursor-default bg-ink/40 backdrop-blur-sm"
        aria-label="Cancel"
        tabindex="-1"
        (click)="cancelled.emit()"
      ></button>
      <div class="card relative w-full max-w-lg p-6" role="dialog" aria-modal="true" aria-label="Crop image">
        <h3 class="mb-4 font-display text-lg font-extrabold">✂️ Crop image</h3>
        <canvas
          #canvas
          class="w-full cursor-grab touch-none rounded-xl border border-lav-200 active:cursor-grabbing dark:border-lav-700/50"
          (pointerdown)="onPointerDown($event)"
          (pointermove)="onPointerMove($event)"
          (pointerup)="onPointerUp($event)"
          (pointercancel)="onPointerUp($event)"
        ></canvas>
        <label class="mt-4 flex items-center gap-3 text-sm">
          <span class="text-lav-500">🔍</span>
          <input
            type="range"
            min="1"
            max="3"
            step="0.01"
            class="flex-1 accent-lav-500"
            [value]="zoom()"
            (input)="setZoom($event)"
            aria-label="Zoom"
          />
        </label>
        <div class="mt-5 flex gap-3">
          <button type="button" class="btn-primary flex-1 !py-2.5 text-sm" (click)="confirm()">✓ Use photo</button>
          <button type="button" class="btn-ghost !py-2.5 text-sm" (click)="cancelled.emit()">Cancel</button>
        </div>
      </div>
    </div>
  `,
})
export class ImageCropper implements OnInit, OnDestroy {
  readonly file = input.required<File>();
  /** Width / height of the crop frame. */
  readonly aspect = input(1);

  readonly confirmed = output<Blob>();
  readonly cancelled = output<void>();

  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  protected readonly zoom = signal(1);
  private readonly offset = signal({ x: 0, y: 0 });

  private image?: HTMLImageElement;
  private objectUrl?: string;
  private dragging = false;
  private lastX = 0;
  private lastY = 0;

  private static readonly VIEW_WIDTH = 440;
  private static readonly EXPORT_WIDTH = 1400;

  constructor() {
    effect(() => {
      this.zoom();
      this.offset();
      this.draw();
    });
  }

  ngOnInit(): void {
    this.objectUrl = URL.createObjectURL(this.file());
    const img = new Image();
    img.onload = () => {
      this.image = img;
      this.draw();
    };
    img.src = this.objectUrl;
  }

  ngOnDestroy(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
    }
  }

  protected setZoom(event: Event): void {
    this.zoom.set(Number((event.target as HTMLInputElement).value));
    this.offset.update((o) => this.clampOffset(o, this.zoom()));
  }

  protected onPointerDown(event: PointerEvent): void {
    this.dragging = true;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.dragging) return;
    const canvas = this.canvasRef().nativeElement;
    // Pointer deltas are in CSS pixels; convert to canvas units.
    const scale = canvas.width / canvas.getBoundingClientRect().width;
    const dx = (event.clientX - this.lastX) * scale;
    const dy = (event.clientY - this.lastY) * scale;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    this.offset.update((o) => this.clampOffset({ x: o.x + dx, y: o.y + dy }, this.zoom()));
  }

  protected onPointerUp(event: PointerEvent): void {
    this.dragging = false;
    (event.target as HTMLElement).releasePointerCapture(event.pointerId);
  }

  protected confirm(): void {
    if (!this.image) return;
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = ImageCropper.EXPORT_WIDTH;
    exportCanvas.height = Math.round(ImageCropper.EXPORT_WIDTH / this.aspect());
    this.render(exportCanvas);
    exportCanvas.toBlob(
      (blob) => {
        if (blob) this.confirmed.emit(blob);
      },
      'image/jpeg',
      0.88,
    );
  }

  /** Base scale so the image covers the frame; zoom multiplies on top. */
  private coverScale(frameW: number, frameH: number): number {
    if (!this.image) return 1;
    return Math.max(frameW / this.image.width, frameH / this.image.height);
  }

  private clampOffset(o: { x: number; y: number }, zoom: number): { x: number; y: number } {
    if (!this.image) return o;
    const frameW = ImageCropper.VIEW_WIDTH;
    const frameH = Math.round(frameW / this.aspect());
    const s = this.coverScale(frameW, frameH) * zoom;
    const maxX = Math.max(0, (this.image.width * s - frameW) / 2);
    const maxY = Math.max(0, (this.image.height * s - frameH) / 2);
    return { x: Math.min(maxX, Math.max(-maxX, o.x)), y: Math.min(maxY, Math.max(-maxY, o.y)) };
  }

  private draw(): void {
    const canvas = this.canvasRef?.()?.nativeElement;
    if (!canvas) return;
    canvas.width = ImageCropper.VIEW_WIDTH;
    canvas.height = Math.round(ImageCropper.VIEW_WIDTH / this.aspect());
    this.render(canvas);
  }

  private render(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx || !this.image) return;
    // The export canvas is a scaled-up copy of the view frame: same math,
    // proportional units.
    const unit = canvas.width / ImageCropper.VIEW_WIDTH;
    const s = this.coverScale(ImageCropper.VIEW_WIDTH, ImageCropper.VIEW_WIDTH / this.aspect()) * this.zoom() * unit;
    const o = this.offset();
    ctx.fillStyle = '#181630';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      this.image,
      canvas.width / 2 - (this.image.width * s) / 2 + o.x * unit,
      canvas.height / 2 - (this.image.height * s) / 2 + o.y * unit,
      this.image.width * s,
      this.image.height * s,
    );
  }
}
