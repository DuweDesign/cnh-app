import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequestPayload } from '../../../core/models/auth.model';

@Component({
  selector: 'cnh-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  readonly registerForm = this.fb.nonNullable.group({
    dealernumber: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    if (this.registerForm.invalid || this.isSubmitting) {
      this.registerForm.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isSubmitting = true;
    this.cdr.detectChanges();

    const payload: RegisterRequestPayload = {
      dealernumber: this.registerForm.getRawValue().dealernumber.trim(),
      email: this.registerForm.getRawValue().email.trim().toLowerCase(),
    };

    this.authService
      .requestRegistration(payload)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (result) => {
          this.successMessage = result.message;
          this.registerForm.reset({
            dealernumber: '',
            email: '',
          });
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            error?.message ||
            'Die Registrierung konnte nicht gestartet werden.';
          this.cdr.detectChanges();
        },
      });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  get dealernumberInvalid(): boolean {
    const control = this.registerForm.controls.dealernumber;
    return control.invalid && (control.dirty || control.touched);
  }

  get emailInvalid(): boolean {
    const control = this.registerForm.controls.email;
    return control.invalid && (control.dirty || control.touched);
  }
}