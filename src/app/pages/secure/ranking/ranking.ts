import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';

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

type RankingCompetition = Parameters<RankingService['getSalesRanking']>[0];
type RankingResponse = ReturnType<RankingService['getSalesRanking']>;

type RankingUserWithFallbacks = RankingUser & {
  ggdNumber?: string;
  warehouseNumber?: string;
  userId?: string;
};

type ManagementRankingView = 'sales' | 'warehouse';

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
   * Ansicht für Management User:
   * sales = Verkäufer-/Team-Ranking
   * warehouse = Gesamtes Lager-Ranking
   */
  readonly managementRankingView = signal<ManagementRankingView>('sales');

  /**
   * Verkäufer Ranking.
   */
  readonly salesParticipants = signal<RankingParticipant[]>([]);

  /**
   * Lager Ranking.
   */
  readonly warehouseParticipants = signal<RankingParticipant[]>([]);

  /**
   * Management Team Ranking.
   */
  readonly teamParticipants = signal<RankingParticipant[]>([]);

  /**
   * Pagination Verkäufer Top 100.
   */
  readonly salesPageSize = signal(10);
  readonly salesCurrentPage = signal(1);

  /**
   * Pagination Lager Top 100.
   */
  readonly warehousePageSize = signal(10);
  readonly warehouseCurrentPage = signal(1);

  /**
   * Pagination Management Team Ranking.
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

  readonly isManagementSalesRankingVisible = computed(
    () => !this.isManagementUser() || this.managementRankingView() === 'sales'
  );

  readonly isManagementWarehouseRankingVisible = computed(
    () => this.isManagementUser() && this.managementRankingView() === 'warehouse'
  );

  readonly isWarehouseUser = computed(
    () => this.authService.getUserRole() === USER_ROLES.CNH_WAREHOUSE
  );

  readonly isWarehouseAdminUser = computed(
    () => this.authService.getUserRole() === USER_ROLES.WAREHOUSE_ADMIN
  );

  readonly isFullAdminUser = computed(() => {
    const role = this.authService.getUserRole();

    return [
      USER_ROLES.SYSADMIN,
      USER_ROLES.CNH_ADMIN,
      USER_ROLES.VIPP_ADMIN,
    ].includes(role as never);
  });

  readonly isAdminUser = computed(
    () => this.isFullAdminUser() || this.isWarehouseAdminUser()
  );

  /**
   * Verkäufer-Ranking:
   * - Management sieht Verkäufer Top10 + eigenes Team.
   * - Full Admins sehen Verkäufer Top10 + Top100.
   */
  readonly canShowSalesRanking = computed(
    () => this.isManagementUser() || this.isFullAdminUser()
  );

  /**
   * Lager-Ranking:
   * - Warehouse User sieht Lager Top10.
   * - Warehouse Admin sieht Lager Top10 + Top100.
   * - Full Admins sehen Lager Top10 + Top100 zusätzlich zum Verkäufer-Ranking.
   */
  readonly canShowWarehouseRanking = computed(
    () => this.isWarehouseUser() || this.isWarehouseAdminUser() || this.isFullAdminUser()
  );

  readonly showSalesFullRanking = computed(() => this.isFullAdminUser());

  readonly showWarehouseFullRanking = computed(
    () => this.isWarehouseAdminUser() || this.isFullAdminUser()
  );

  readonly salesThemeClass = computed(() => this.competitionConfig()?.key ?? '');
  readonly warehouseThemeClass = computed(() => 'warehouse');

  readonly currentMonthLabel = computed(() => {
    const now = new Date();
    return now.toLocaleDateString('de-DE', { month: 'long' });
  });

  readonly salesTop10Participants = computed(() => this.salesParticipants().slice(0, 10));
  readonly warehouseTop10Participants = computed(() => this.warehouseParticipants().slice(0, 10));

  /**
   * Verkäufer Top 100 Pagination.
   */
  readonly salesTotalPages = computed(() => {
    const total = this.salesParticipants().length;
    const size = this.salesPageSize();

    return total > 0 ? Math.ceil(total / size) : 1;
  });

  readonly paginatedSalesParticipants = computed(() => {
    const page = this.salesCurrentPage();
    const size = this.salesPageSize();
    const start = (page - 1) * size;
    const end = start + size;

    return this.salesParticipants().slice(start, end);
  });

  readonly salesPaginationStart = computed(() => {
    if (!this.salesParticipants().length) return 0;

    return (this.salesCurrentPage() - 1) * this.salesPageSize() + 1;
  });

  readonly salesPaginationEnd = computed(() => {
    const end = this.salesCurrentPage() * this.salesPageSize();

    return Math.min(end, this.salesParticipants().length);
  });

  /**
   * Lager Top 100 Pagination.
   */
  readonly warehouseTotalPages = computed(() => {
    const total = this.warehouseParticipants().length;
    const size = this.warehousePageSize();

    return total > 0 ? Math.ceil(total / size) : 1;
  });

  readonly paginatedWarehouseParticipants = computed(() => {
    const page = this.warehouseCurrentPage();
    const size = this.warehousePageSize();
    const start = (page - 1) * size;
    const end = start + size;

    return this.warehouseParticipants().slice(start, end);
  });

  readonly warehousePaginationStart = computed(() => {
    if (!this.warehouseParticipants().length) return 0;

    return (this.warehouseCurrentPage() - 1) * this.warehousePageSize() + 1;
  });

  readonly warehousePaginationEnd = computed(() => {
    const end = this.warehouseCurrentPage() * this.warehousePageSize();

    return Math.min(end, this.warehouseParticipants().length);
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

      if (!competition || !user) {
        this.resetRankingState();
        return;
      }

      this.loadRanking();
    });
  }

  private loadRanking(): void {
    const competition = this.competition() as RankingCompetition | null;
    const user = this.currentUser();

    if (!competition || !user) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.resetPagination();

    if (user.role === USER_ROLES.CNH_MANAGEMENT) {
      this.loadManagementRanking(competition);
      return;
    }

    if (this.canShowWarehouseRanking() || this.canShowSalesRanking()) {
      this.loadRoleBasedRankings(competition);
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

    const warehouseRequest$ = this.getWarehouseRankingRequest();

    forkJoin({
      ranking: this.rankingService.getManagementRanking(
        competition,
        user.dealerGroupId
      ),
      team: this.rankingService.getMyTeam(competition),
      warehouse: warehouseRequest$ ?? of(null),
    }).subscribe({
      next: ({ ranking, team, warehouse }) => {
        /**
         * Obere Tabelle = Top10 des Management-eigenen Verkäufer-Rankings.
         */
        this.salesParticipants.set(
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

        /**
         * Lager Ranking wird für Manager vorgeladen,
         * aber erst nach Klick auf den Button angezeigt.
         */
        this.warehouseParticipants.set(
          warehouse?.ranking.map((entry) =>
            this.mapUserToParticipant(entry, entry.rank ?? null)
          ) ?? []
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

  private loadRoleBasedRankings(competition: RankingCompetition): void {
    const shouldLoadSales = this.canShowSalesRanking();
    const shouldLoadWarehouse = this.canShowWarehouseRanking();
    const warehouseRequest$ = shouldLoadWarehouse
      ? this.getWarehouseRankingRequest()
      : of(null);

    if (shouldLoadWarehouse && !warehouseRequest$) {
      this.error.set('Warehouse-Ranking konnte nicht geladen werden. Bitte getWarehouseRanking() im RankingService ergänzen.');
      this.resetRankingState();
      this.loading.set(false);
      return;
    }

    forkJoin({
      sales: shouldLoadSales ? this.rankingService.getSalesRanking(competition) : of(null),
      warehouse: warehouseRequest$ ?? of(null),
    }).subscribe({
      next: ({ sales, warehouse }) => {
        this.salesParticipants.set(
          sales?.ranking.map((entry) =>
            this.mapUserToParticipant(entry, entry.rank ?? null)
          ) ?? []
        );

        this.warehouseParticipants.set(
          warehouse?.ranking.map((entry) =>
            this.mapUserToParticipant(entry, entry.rank ?? null)
          ) ?? []
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

  private getWarehouseRankingRequest(): RankingResponse | null {
    const rankingService = this.rankingService as RankingService & {
      getWarehouseRanking?: () => RankingResponse;
    };

    return rankingService.getWarehouseRanking?.call(this.rankingService) ?? null;
  }

  private resetRankingState(): void {
    this.salesParticipants.set([]);
    this.warehouseParticipants.set([]);
    this.teamParticipants.set([]);
    this.managementRankingView.set('sales');
    this.resetPagination();
  }

  private resetPagination(): void {
    this.salesCurrentPage.set(1);
    this.warehouseCurrentPage.set(1);
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

  setSalesPageSize(size: number): void {
    this.salesPageSize.set(size);
    this.salesCurrentPage.set(1);
  }

  goToSalesPage(page: number): void {
    if (page < 1 || page > this.salesTotalPages()) {
      return;
    }

    this.salesCurrentPage.set(page);
  }

  previousSalesPage(): void {
    this.goToSalesPage(this.salesCurrentPage() - 1);
  }

  nextSalesPage(): void {
    this.goToSalesPage(this.salesCurrentPage() + 1);
  }

  setWarehousePageSize(size: number): void {
    this.warehousePageSize.set(size);
    this.warehouseCurrentPage.set(1);
  }

  goToWarehousePage(page: number): void {
    if (page < 1 || page > this.warehouseTotalPages()) {
      return;
    }

    this.warehouseCurrentPage.set(page);
  }

  previousWarehousePage(): void {
    this.goToWarehousePage(this.warehouseCurrentPage() - 1);
  }

  nextWarehousePage(): void {
    this.goToWarehousePage(this.warehouseCurrentPage() + 1);
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

  openManagementWarehouseRanking(): void {
    this.managementRankingView.set('warehouse');
    this.warehouseCurrentPage.set(1);
  }

  openManagementSalesRanking(): void {
    this.managementRankingView.set('sales');
    this.teamCurrentPage.set(1);
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
