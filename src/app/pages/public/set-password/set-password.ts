import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const passwordRepeat = control.get('passwordRepeat')?.value;

  if (!password || !passwordRepeat) {
    return null;
  }

  return password === passwordRepeat ? null : { passwordMismatch: true };
}

@Component({
  selector: 'cnh-set-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './set-password.html',
  styleUrl: './set-password.scss',
})
export class SetPassword implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  isSubmitting = false;
  isValidatingToken = true;
  isTokenValid = false;
  errorMessage = '';

  readonly token = this.route.snapshot.queryParamMap.get('token') ?? '';

  readonly form = this.fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(8)]],
      passwordRepeat: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator }
  );

  ngOnInit(): void {
    if (!this.token) {
      this.isValidatingToken = false;
      this.isTokenValid = false;
      this.errorMessage = 'Der Link ist ungültig oder unvollständig.';
      return;
    }

    this.authService.validateRegistrationToken(this.token).subscribe({
      next: (response) => {
        this.isValidatingToken = false;
        this.isTokenValid = response.valid;
        this.errorMessage = response.valid ? '' : response.message;
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.isValidatingToken = false;
        this.isTokenValid = false;
        this.errorMessage =
          error?.error?.message ||
          'Der Link konnte nicht geprüft werden.';
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {
    if (!this.token || !this.isTokenValid) {
      return;
    }

    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.authService.setPassword({
      token: this.token,
      password: this.form.get('password')?.value ?? ''
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/login']);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage =
        error?.error?.message ||
        'Das Passwort konnte nicht gesetzt werden.';
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  get passwordInvalid(): boolean {
    const control = this.form.get('password');
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  get passwordRepeatInvalid(): boolean {
    const control = this.form.get('passwordRepeat');
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  get passwordMismatch(): boolean {
    return !!this.form.errors?.['passwordMismatch'] && (this.form.dirty || this.form.touched);
  }
}