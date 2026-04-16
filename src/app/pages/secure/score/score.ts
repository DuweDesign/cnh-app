import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompetitionService } from '../../../core/services/competition.service';
import { ProfileService } from '../../../core/services/profile.service';
import { MyProfile } from '../../../core/models/profile.model';

@Component({
  selector: 'cnh-score',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './score.html',
  styleUrl: './score.scss',
})
export class Score {
  private competitionService = inject(CompetitionService);
  private profileService = inject(ProfileService);

  readonly competition = this.competitionService.activeCompetition;
  readonly competitionConfig = this.competitionService.competitionConfig;

  readonly profile = signal<MyProfile | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  readonly totalPoints = computed(() => this.profile()?.totalPoints ?? 0);
  readonly rank = computed(() => this.profile()?.rank ?? null);
  // readonly pointsToNextRank = computed(() => this.profile()?.pointsToNextRank ?? 0);

  readonly rankingHeadline = computed(() => {
    const currentRank = this.rank();
    // const distance = this.pointsToNextRank();

    if (currentRank === null) {
      return 'Deine Platzierung wird aktuell berechnet.';
    }

    if (currentRank === 1) {
      return 'Stark! Du bist aktuell auf Platz 1.';
    }

    // if (distance <= 3) {
    //   return 'Top! Du bist derzeit unter den Gewinnern - jetzt heißt es dran zu bleiben!';
    // }

    return 'Bleib dran – der nächste Rang ist in Reichweite!';
  });

  constructor() {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.profileService.getMyProfile().subscribe({
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
}