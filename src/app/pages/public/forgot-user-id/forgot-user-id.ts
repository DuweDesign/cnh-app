import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ForgotUserIdPayload } from '../../../core/models/auth.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'cnh-forgot-user-id',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-user-id.html',
  styleUrl: './forgot-user-id.scss',
})
export class ForgotUserId {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  readonly forgotUserIdForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    if (this.forgotUserIdForm.invalid || this.isSubmitting) {
      this.forgotUserIdForm.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isSubmitting = true;
    this.cdr.detectChanges();

    const payload: ForgotUserIdPayload = {
      email: this.forgotUserIdForm.getRawValue().email.trim().toLowerCase(),
    };

    this.authService
      .forgotUserId(payload)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (result) => {
          this.successMessage = result.message;
          this.forgotUserIdForm.reset({
            email: '',
          });
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            error?.message ||
            'Die User ID konnte nicht angefordert werden.';
          this.cdr.detectChanges();
        },
      });
  }

  get emailInvalid(): boolean {
    const control = this.forgotUserIdForm.controls.email;
    return control.invalid && (control.dirty || control.touched);
  }
}
