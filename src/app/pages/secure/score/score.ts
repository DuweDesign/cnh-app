import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CompetitionService } from '../../../core/services/competition.service';
import { ProfileService } from '../../../core/services/profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { MyProfile } from '../../../core/models/profile.model';

@Component({
  selector: 'cnh-score',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './score.html',
  styleUrl: './score.scss',
})
export class Score {
  private competitionService = inject(CompetitionService);
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);

  readonly competition = this.competitionService.activeCompetition;
  readonly competitionConfig = this.competitionService.competitionConfig;

  readonly profile = signal<MyProfile | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  readonly dealerNumberInput = signal<string>('');

  readonly currentUser = this.authService.user;
  readonly isAdmin = computed(() => {
    const role = this.currentUser()?.role;
    return ['sysadmin', 'vipp-admin', 'cnh-admin'].includes(role ?? '');
  });

  readonly totalPoints = computed(() => this.profile()?.totalPoints ?? 0);
  readonly rank = computed(() => this.profile()?.rank ?? null);
  readonly isTop10 = computed(() => this.profile()?.isTop10);
  readonly pointsToTop10 = computed(() => this.profile()?.pointsToTop10 ?? 0);

  readonly rankingHeadline = computed(() => {
    const currentRank = this.rank();

    if (currentRank === null) {
      return 'Deine Platzierung wird aktuell berechnet.';
    }

    if (currentRank === 1) {
      return 'Stark! Du bist aktuell auf Platz 1.';
    }

    if (this.isTop10()) {
      return 'Top! Du bist derzeit unter den Gewinnern - jetzt heißt es dran zu bleiben!';
    }

    return `Bleib dran – dir fehlen noch ${this.pointsToTop10()} Punkte bis zu Rang 10!`;
  });

  constructor() {
    this.loadProfile();
  }

  loadProfile(dealernumber?: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.profileService.getMyProfile(dealernumber).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Fehler beim Laden des Profils:', err);
        this.error.set('Der Punktestand konnte nicht geladen werden.');
        this.isLoading.set(false);
      },
    });
  }

  onLoadAdminProfile(): void {
    const dealernumber = this.dealerNumberInput().trim();
    this.loadProfile(dealernumber || undefined);
  }

  onResetToOwnProfile(): void {
    this.dealerNumberInput.set('');
    this.loadProfile();
  }
}