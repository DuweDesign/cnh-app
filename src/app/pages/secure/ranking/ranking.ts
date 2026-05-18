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

type Tab = 'sales' | 'warehouse';
type RankingCompetition = Parameters<RankingService['getSalesRanking']>[0];
type RankingResponse = ReturnType<RankingService['getSalesRanking']>;

type RankingUserWithFallbacks = RankingUser & {
  ggdNumber?: string;
  warehouseNumber?: string;
  userId?: string;
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

  readonly activeTab = signal<Tab>('sales');

  readonly competition = this.competitionService.activeCompetition;
  readonly competitionConfig = this.competitionService.competitionConfig;

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly profile = signal<MyProfile | null>(null);

  /**
   * Aktives Ranking für Top10 und Admin-Komplettliste.
   */
  readonly participants = signal<RankingParticipant[]>([]);

  /**
   * Management Team Ranking.
   */
  readonly teamParticipants = signal<RankingParticipant[]>([]);

  /**
   * Pagination für Admin-Komplett-Ranking.
   */
  readonly pageSize = signal(10);
  readonly currentPage = signal(1);

  /**
   * Pagination für Management Team Ranking.
   */
  readonly teamPageSize = signal(10);
  readonly teamCurrentPage = signal(1);

  readonly pageSizeOptions = [10, 20, 50];

  readonly currentUser = computed(() => this.authService.getCurrentUser());

  readonly isManagementUser = computed(
    () => this.authService.getUserRole() === USER_ROLES.CNH_MANAGEMENT
  );

  readonly isSaleUser = computed(
    () => this.authService.getUserRole() === USER_ROLES.CNH_SALES
  );

  readonly isWarehouseUser = computed(
    () => this.authService.getUserRole() === USER_ROLES.CNH_WAREHOUSE
  );

  readonly isAdminUser = computed(() => {
    const role = this.authService.getUserRole();

    return [
      USER_ROLES.SYSADMIN,
      USER_ROLES.CNH_ADMIN,
      USER_ROLES.VIPP_ADMIN,
      USER_ROLES.WAREHOUSE_ADMIN,
    ].includes(role as never);
  });

  readonly showRankingTabs = computed(() => this.isAdminUser());

  readonly effectiveTab = computed<Tab>(() => {
    if (this.isWarehouseUser()) {
      return 'warehouse';
    }

    return this.activeTab();
  });

  readonly rankingThemeClass = computed(() => {
    if (this.effectiveTab() === 'warehouse') {
      return 'warehouse';
    }

    return this.competitionConfig()?.key ?? '';
  });

  readonly top10Title = computed(() =>
    this.effectiveTab() === 'warehouse'
      ? 'TOP10 Lager Ranking'
      : 'TOP10 Verkäufer Ranking'
  );

  readonly fullRankingTitle = computed(() =>
    this.effectiveTab() === 'warehouse'
      ? 'Top 100 Lager'
      : 'Top 100 Verkäufer'
  );

  readonly currentMonthLabel = computed(() => {
    const now = new Date();
    return now.toLocaleDateString('de-DE', { month: 'long' });
  });

  readonly top10Participants = computed(() => this.participants().slice(0, 10));

  /**
   * Admin-Komplett-Ranking Pagination.
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

  /**
   * Team-Ranking Pagination.
   */
  readonly teamTotalPages = computed(() => {
    const total = this.teamParticipants().length;
    const size = this.teamPageSize();

    return total > 0 ? Math.ceil(total / size) : 1;
  });

  readonly paginatedTeamParticipants = computed(() => {
    const page = this.teamCurrentPage();
    const size = this.teamPageSize();
    const start = (page - 1) * size;
    const end = start + size;

    return this.teamParticipants().slice(start, end);
  });

  readonly teamPaginationStart = computed(() => {
    if (!this.teamParticipants().length) return 0;

    return (this.teamCurrentPage() - 1) * this.teamPageSize() + 1;
  });

  readonly teamPaginationEnd = computed(() => {
    const end = this.teamCurrentPage() * this.teamPageSize();

    return Math.min(end, this.teamParticipants().length);
  });

  constructor() {
    effect(() => {
      const competition = this.competition();
      const user = this.currentUser();
      const tab = this.effectiveTab();

      if (!competition || !user) {
        this.resetRankingState();
        return;
      }

      this.loadRanking(tab);
    });
  }

  setTab(tab: Tab): void {
    if (this.activeTab() === tab) {
      return;
    }

    this.activeTab.set(tab);
    this.currentPage.set(1);
    this.teamCurrentPage.set(1);
  }

  private loadRanking(tab: Tab): void {
    const competition = this.competition() as RankingCompetition | null;
    const user = this.currentUser();

    if (!competition || !user) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.currentPage.set(1);
    this.teamCurrentPage.set(1);

    if (user.role === USER_ROLES.CNH_MANAGEMENT) {
      this.loadManagementRanking(competition);
      return;
    }

    if (this.isAdminUser()) {
      this.loadAdminRanking(competition, tab);
      return;
    }

    this.error.set('Keine Berechtigung für diese Seite.');
    this.resetRankingState();
    this.loading.set(false);
  }

  private loadManagementRanking(competition: RankingCompetition): void {
    const user = this.currentUser();

    if (!user) {
      this.resetRankingState();
      this.loading.set(false);
      return;
    }

    forkJoin({
      ranking: this.rankingService.getManagementRanking(
        competition,
        user.dealerGroupId
      ),
      team: this.rankingService.getMyTeam(competition),
    }).subscribe({
      next: ({ ranking, team }) => {
        /**
         * Obere Tabelle = Top10 des Management-eigenen Rankings.
         */
        this.participants.set(
          ranking.ownSales.map((entry) =>
            this.mapUserToParticipant(entry, entry.rankInOwnList ?? null)
          )
        );

        /**
         * Untere Tabelle = Team Ranking.
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
        this.resetRankingState();
        this.loading.set(false);
      },
    });
  }

  private loadAdminRanking(competition: RankingCompetition, tab: Tab): void {
    const request$ = this.getRankingRequest(competition, tab);

    if (!request$) {
      this.error.set('Warehouse-Ranking konnte nicht geladen werden. Bitte getWarehouseRanking() im RankingService ergänzen.');
      this.resetRankingState();
      this.loading.set(false);
      return;
    }

    request$.subscribe({
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
        this.resetRankingState();
        this.loading.set(false);
      },
    });
  }

  private getRankingRequest(
    competition: RankingCompetition,
    tab: Tab
  ): RankingResponse | null {
    if (tab === 'warehouse') {
      const rankingService = this.rankingService as RankingService & {
        getWarehouseRanking?: (competition: RankingCompetition) => RankingResponse;
      };

      return rankingService.getWarehouseRanking?.call(this.rankingService, competition) ?? null;
    }

    return this.rankingService.getSalesRanking(competition);
  }

  private resetRankingState(): void {
    this.participants.set([]);
    this.teamParticipants.set([]);
    this.currentPage.set(1);
    this.teamCurrentPage.set(1);
  }

  private mapUserToParticipant(
    user: RankingUser,
    rank: number | null
  ): RankingParticipant {
    const userWithFallbacks = user as RankingUserWithFallbacks;

    return {
      id: user._id,
      rank,
      dealerNumber:
        userWithFallbacks.dealernumber ||
        userWithFallbacks.ggdNumber ||
        userWithFallbacks.warehouseNumber ||
        userWithFallbacks.userId ||
        '-',
      name: `${user.firstname ?? ''} ${user.surname ?? ''}`.trim() || '-',
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

  setTeamPageSize(size: number): void {
    this.teamPageSize.set(size);
    this.teamCurrentPage.set(1);
  }

  goToTeamPage(page: number): void {
    if (page < 1 || page > this.teamTotalPages()) {
      return;
    }

    this.teamCurrentPage.set(page);
  }

  previousTeamPage(): void {
    this.goToTeamPage(this.teamCurrentPage() - 1);
  }

  nextTeamPage(): void {
    this.goToTeamPage(this.teamCurrentPage() + 1);
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
