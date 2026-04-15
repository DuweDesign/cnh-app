import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequestPayload } from '../../../core/models/auth.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'cnh-forgot-password',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  readonly forgotPasswordForm = this.fb.nonNullable.group({
    dealernumber: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid || this.isSubmitting) {
      this.forgotPasswordForm.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isSubmitting = true;
    this.cdr.detectChanges();

    const payload: RegisterRequestPayload = {
      dealernumber: this.forgotPasswordForm.getRawValue().dealernumber.trim(),
      email: this.forgotPasswordForm.getRawValue().email.trim().toLowerCase(),
    };

    this.authService
      .forgotPassword(payload)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (result) => {
          this.successMessage = result.message;
          this.forgotPasswordForm.reset({
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
            'Die Passwortzurücksetzung konnte nicht gestartet werden.';
          this.cdr.detectChanges();
        },
      });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  get dealernumberInvalid(): boolean {
    const control = this.forgotPasswordForm.controls.dealernumber;
    return control.invalid && (control.dirty || control.touched);
  }

  get emailInvalid(): boolean {
    const control = this.forgotPasswordForm.controls.email;
    return control.invalid && (control.dirty || control.touched);
  }
}
