import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { CompetitionService } from '../../../core/services/competition.service';
import { RankingService } from '../../../core/services/ranking.service';

import { USER_ROLES } from '../../../core/models/auth.model';
import { RankingUser } from '../../../core/models/ranking.model';

type RankingParticipant = {
  id: string;
  rank: number | null;
  dealerNumber: string;
  name: string;
  company: string;
  monthPoints: number;
  totalPoints: number;
};

@Component({
  selector: 'cnh-ranking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ranking.html',
  styleUrl: './ranking.scss',
})
export class Ranking {
  private competitionService = inject(CompetitionService);
  private authService = inject(AuthService);
  private rankingService = inject(RankingService);

  readonly competition = this.competitionService.activeCompetition;
  readonly competitionConfig = this.competitionService.competitionConfig;

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly participants = signal<RankingParticipant[]>([]);
  readonly teamParticipants = signal<RankingParticipant[]>([]);

  readonly currentUser = computed(() => this.authService.getCurrentUser());

  readonly isManagementUser = computed(
    () => this.authService.getUserRole() === USER_ROLES.CNH_MANAGEMENT
  );

  readonly isAdminUser = computed(() => {
    const role = this.authService.getUserRole();
    return [
      USER_ROLES.SYSADMIN,
      USER_ROLES.CNH_ADMIN,
      USER_ROLES.VIPP_ADMIN,
    ].includes(role as never);
  });

  readonly currentMonthLabel = computed(() => {
    const now = new Date();
    return now.toLocaleDateString('de-DE', { month: 'long' });
  });

  constructor() {
    effect(() => {
      const competition = this.competition();
      const user = this.currentUser();

      if (!competition || !user) {
        this.participants.set([]);
        this.teamParticipants.set([]);
        return;
      }

      this.loadRanking();
    });
  }

  private loadRanking(): void {
    const competition = this.competition();
    const user = this.currentUser();

    if (!competition || !user) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    if (user.role === USER_ROLES.CNH_MANAGEMENT) {
      forkJoin({
        ranking: this.rankingService.getManagementRanking(
          competition,
          user.dealerGroupId
        ),
        team: this.rankingService.getMyTeam(competition),
      }).subscribe({
        next: ({ ranking, team }) => {
          this.participants.set(
            ranking.ownSales.map((entry) =>
              this.mapUserToParticipant(entry, entry.rankInOwnList ?? null)
            )
          );

          this.teamParticipants.set(
            team.team.map((entry) =>
              this.mapUserToParticipant(entry, entry.overallRank ?? null)
            )
          );

          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.message || 'Ranking konnte nicht geladen werden.');
          this.participants.set([]);
          this.teamParticipants.set([]);
          this.loading.set(false);
        },
      });

      return;
    }

    if (this.isAdminUser()) {
      this.rankingService.getSalesRanking(competition).subscribe({
        next: (response) => {
          this.participants.set(
            response.ranking.map((entry) =>
              this.mapUserToParticipant(entry, entry.rank ?? null)
            )
          );
          this.teamParticipants.set([]);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.message || 'Ranking konnte nicht geladen werden.');
          this.participants.set([]);
          this.teamParticipants.set([]);
          this.loading.set(false);
        },
      });

      return;
    }

    this.error.set('Keine Berechtigung für diese Seite.');
    this.participants.set([]);
    this.teamParticipants.set([]);
    this.loading.set(false);
  }

  private mapUserToParticipant(
    user: RankingUser,
    rank: number | null
  ): RankingParticipant {
    return {
      id: user._id,
      rank,
      dealerNumber: user.dealernumber,
      name: `${user.firstname} ${user.surname}`,
      company: user.company || '-',
      monthPoints: this.getCurrentMonthPoints(user),
      totalPoints: user.totalPoints ?? 0,
    };
  }

  private getCurrentMonthPoints(user: RankingUser): number {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const monthlyEntry = user.monthlyPoints?.find(
      (entry) => entry.monthKey === monthKey
    );

    if (!monthlyEntry) {
      return 0;
    }

    return (
      (monthlyEntry.points ?? 0) +
      (monthlyEntry.bonuspoints ?? 0) +
      (monthlyEntry.partpoints ?? 0)
    );
  }
}