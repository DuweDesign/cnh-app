import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { CompetitionService } from '../../../core/services/competition.service';
import { RankingService } from '../../../core/services/ranking.service';

import { USER_ROLES } from '../../../core/models/auth.model';
import { RankingUser } from '../../../core/models/ranking.model';
import { ProfileService } from '../../../core/services/profile.service';
import { MyProfile } from '../../../core/models/profile.model';

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
  private profileService = inject(ProfileService);

  readonly competition = this.competitionService.activeCompetition;
  readonly competitionConfig = this.competitionService.competitionConfig;

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly profile = signal<MyProfile | null>(null);

  /**
   * Admin / Sales Ranking gesamt
   */
  readonly participants = signal<RankingParticipant[]>([]);

  /**
   * Management Team Ranking
   */
  readonly teamParticipants = signal<RankingParticipant[]>([]);

  /**
   * Pagination nur für Admin-Komplett-Ranking
   */
  readonly pageSize = signal(10);
  readonly currentPage = signal(1);
  readonly pageSizeOptions = [10, 20, 50];

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

  /**
   * Für beide Rollen: obere Top10 Tabelle
   * - Admin: Top10 aus Gesamtranking
   * - Management: Top10 aus ownSales Ranking
   */
  readonly top10Participants = computed(() => this.participants().slice(0, 10));

  /**
   * Nur Admin: paginierte Gesamtliste
   */
  readonly totalPages = computed(() => {
    const total = this.participants().length;
    const size = this.pageSize();
    return total > 0 ? Math.ceil(total / size) : 1;
  });

  readonly paginatedParticipants = computed(() => {
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    const end = start + size;

    return this.participants().slice(start, end);
  });

  readonly paginationStart = computed(() => {
    if (!this.participants().length) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  readonly paginationEnd = computed(() => {
    const end = this.currentPage() * this.pageSize();
    return Math.min(end, this.participants().length);
  });

  constructor() {
    effect(() => {
      const competition = this.competition();
      const user = this.currentUser();

      if (!competition || !user) {
        this.participants.set([]);
        this.teamParticipants.set([]);
        this.currentPage.set(1);
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
    this.currentPage.set(1);

    if (user.role === USER_ROLES.CNH_MANAGEMENT) {
      forkJoin({
        ranking: this.rankingService.getManagementRanking(
          competition,
          user.dealerGroupId
        ),
        team: this.rankingService.getMyTeam(competition),
      }).subscribe({
        next: ({ ranking, team }) => {
          /**
           * Obere Tabelle = Top10 des Management-eigenen Rankings
           */
          this.participants.set(
            ranking.ownSales.map((entry) =>
              this.mapUserToParticipant(entry, entry.rankInOwnList ?? null)
            )
          );

          /**
           * Untere Tabelle = Team Ranking
           */
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

  setPageSize(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) {
      return;
    }

    this.currentPage.set(page);
  }

  previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  // PARTSPOINTS
  readonly currentManagementPartPoints = computed(() => {
    const profile = this.profile();

    if (!profile || profile.role !== USER_ROLES.CNH_MANAGEMENT || !this.authService.isAdmin()) {
      return 0;
    }

    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const monthlyEntry = profile.monthlyPoints?.find(
      (entry) => entry.monthKey === monthKey
    );

    return monthlyEntry?.partpoints ?? 0;
  });
}