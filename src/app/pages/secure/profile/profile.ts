import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { MyProfile } from '../../../core/models/profile.model';
import { CompetitionService } from '../../../core/services/competition.service';

@Component({
  selector: 'cnh-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  private competitionService = inject(CompetitionService);
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);

  readonly competition = this.competitionService.activeCompetition;
  readonly competitionConfig = this.competitionService.competitionConfig;
  
  private fb = inject(FormBuilder);

  readonly profile = signal<MyProfile | null>(null);
  readonly user = this.authService.user;

  readonly isEditingName = signal(false);
  readonly isChangingPassword = signal(false);
  readonly loading = signal(false);
  readonly successMessage = signal('');
  readonly errorMessage = signal('');

  readonly displayCompetition = computed(() => {
    const competition = this.user()?.competition;
    if (competition === 'case-steyr') return 'CASE / STEYR';
    if (competition === 'new-holland') return 'New Holland';
    return '-';
  });

  readonly displayRole = computed(() => {
    const role = this.user()?.role;
    switch (role) {
      case 'sysadmin':
        return 'Systemadmin';
      case 'vipp-admin':
        return 'VIPP Admin';
      case 'cnh-admin':
        return 'CNH Admin';
      case 'cnh-sales':
        return 'Verkäufer';
      case 'cnh-management':
        return 'Geschäftsführung';
      default:
        return '-';
    }
  });

  readonly nameForm = this.fb.nonNullable.group({
    firstname: ['', [Validators.required]],
    surname: ['', [Validators.required]],
  });

  readonly passwordForm = this.fb.nonNullable.group(
    {
      currentPassword: ['', [Validators.required, Validators.minLength(8)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
    },
    {
      validators: (form) => {
        const newPassword = form.get('newPassword')?.value;
        const confirmPassword = form.get('confirmPassword')?.value;
        return newPassword === confirmPassword ? null : { passwordMismatch: true };
      },
    }
  );

  constructor() {
    const user = this.user();
    if (user) {
      this.nameForm.patchValue({
        firstname: user.firstname || '',
        surname: user.surname || '',
      });
    }
  }

  startEditName(): void {
    const user = this.user();
    if (!user) return;

    this.resetMessages();
    this.nameForm.patchValue({
      firstname: user.firstname || '',
      surname: user.surname || '',
    });
    this.isEditingName.set(true);
  }

  cancelEditName(): void {
    this.isEditingName.set(false);
    this.nameForm.reset();
    this.resetMessages();
  }

  saveName(): void {
    if (this.nameForm.invalid) {
      this.nameForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.resetMessages();

    this.profileService.updateProfile(this.nameForm.getRawValue()).subscribe({
      next: (response) => {
        this.successMessage.set(response.message || 'Name erfolgreich aktualisiert.');
        this.isEditingName.set(false);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message || 'Name konnte nicht gespeichert werden.');
        this.loading.set(false);
      },
    });
  }

  startChangePassword(): void {
    this.resetMessages();
    this.passwordForm.reset();
    this.isChangingPassword.set(true);
  }

  cancelChangePassword(): void {
    this.isChangingPassword.set(false);
    this.passwordForm.reset();
    this.resetMessages();
  }

  savePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword } = this.passwordForm.getRawValue();

    this.loading.set(true);
    this.resetMessages();

    this.profileService.changePassword({ currentPassword, newPassword }).subscribe({
      next: (response) => {
        this.successMessage.set(response.message || 'Passwort erfolgreich geändert.');
        this.isChangingPassword.set(false);
        this.passwordForm.reset();
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message || 'Passwort konnte nicht geändert werden.');
        this.loading.set(false);
      },
    });
  }

  private resetMessages(): void {
    this.successMessage.set('');
    this.errorMessage.set('');
  }
}