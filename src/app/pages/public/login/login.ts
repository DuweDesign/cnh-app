import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginPayload } from '../../../core/models/auth.model';
import { firstValueFrom } from 'rxjs';

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

  isSubmitting = false;
  errorMessage = '';

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    dealernumber: ['', [Validators.required, Validators.minLength(4)]]
  });

  constructor(
    private authService: AuthService
  ) { }

  async login(): Promise<void> {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    try {
      const { email, password, dealernumber } = this.loginForm.getRawValue();

      const response = await firstValueFrom(
        this.authService.login({ email, password, dealernumber })
      );

      if (response.success) {
        await this.router.navigateByUrl('/home');
      } else {
        this.errorMessage = response.message || 'Anmeldung fehlgeschlagen.';
      }
    } catch (error) {
      console.error('Login fehlgeschlagen:', error);
      this.errorMessage = 'Anmeldung fehlgeschlagen. Bitte prüfe deine Eingaben.';
    } finally {
      this.isSubmitting = false;
    }
  }

  get email() {
    return this.loginForm.controls.email;
  }

  get password() {
    return this.loginForm.controls.password;
  }
}