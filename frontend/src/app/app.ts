import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastOutlet } from './shared/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastOutlet],
  template: `
    <router-outlet />
    <app-toast-outlet />
  `,
})
export class App {}
