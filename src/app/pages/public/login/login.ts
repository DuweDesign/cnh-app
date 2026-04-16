import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  isSubmitting = false;
  errorMessage = '';

  loginForm = this.fb.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(4)]],
    dealernumber: ['', [Validators.required, Validators.minLength(4)]]
  });

  constructor(
    private authService: AuthService
  ) {}

  login(): void {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }

    this.isSubmitting = true;
    this.cdr.detectChanges();

    this.authService.login(this.loginForm.getRawValue())
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/news']);
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Anmeldung fehlgeschlagen.';
          this.cdr.detectChanges();
        }
      });
  }

  get password() {
    return this.loginForm.controls.password;
  }

  get dealernumber() {
    return this.loginForm.controls.dealernumber;
  }
}