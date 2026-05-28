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

type RankingUserWithFallbacks = RankingUser & {
  ggdNumber?: string;
  warehouseNumber?: string;
  userId?: string;
};

type RankingPointsField = 'totalPoints' | 'managementRankingTotal' | 'managementRankingPart';

type ManagementRankingView = 'sales' | 'warehouse';
type CountryIso = 'DE' | 'AT';

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
  readonly warehouseRankingCountryIso = signal<CountryIso>('DE');
  readonly warehouseCountryOptions: { iso: CountryIso; label: string }[] = [
    { iso: 'DE', label: 'Deutschland' },
    { iso: 'AT', label: 'Österreich' },
  ];

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
   * Geschäftsführer Ranking nach Gesamtpunkten.
   */
  readonly managementTotalParticipants = signal<RankingParticipant[]>([]);

  /**
   * Geschäftsführer Ranking nach Lagerpunkten.
   */
  readonly managementPartParticipants = signal<RankingParticipant[]>([]);

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
    () => !this.canShowManagementTopRankings() || this.managementRankingView() === 'sales'
  );

  readonly isManagementWarehouseRankingVisible = computed(
    () => this.canShowManagementTopRankings() && this.managementRankingView() === 'warehouse'
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

  readonly canShowManagementTopRankings = computed(() => {
    const competitionKey = this.competitionConfig()?.key;

    return (
      (this.isManagementUser() || this.isFullAdminUser()) &&
      (competitionKey === 'new-holland' || competitionKey === 'case-steyr')
    );
  });

  readonly salesThemeClass = computed(() => this.competitionConfig()?.key ?? '');
  readonly warehouseThemeClass = computed(() => 'warehouse');

  readonly currentMonthLabel = computed(() => {
    const now = new Date();
    return now.toLocaleDateString('de-DE', { month: 'long' });
  });

  readonly salesTop10Participants = computed(() => this.salesParticipants().slice(0, 10));
  readonly warehouseTop10Participants = computed(() => this.warehouseParticipants().slice(0, 10));
  readonly managementTotalTop10Participants = computed(() =>
    this.managementTotalParticipants().slice(0, 10)
  );
  readonly managementPartTop10Participants = computed(() =>
    this.managementPartParticipants().slice(0, 10)
  );

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

  readonly warehouseRankingCountryLabel = computed(() => {
    if (this.showWarehouseFullRanking()) {
      return this.getCountryLabel(this.warehouseRankingCountryIso());
    }

    const user = this.currentUser();
    const userCountryIso = this.normalizeCountryIso(user?.iso || user?.country);

    return this.getCountryLabel(userCountryIso || 'DE');
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

    if (this.canShowManagementTopRankings()) {
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

    const teamRequest$ = this.isManagementUser()
      ? this.rankingService.getMyTeam(competition)
      : of(null);

    forkJoin({
      totalRanking: this.rankingService.getManagementRanking(competition),
      partRanking: this.rankingService.getManagementPartRanking(competition),
      team: teamRequest$,
    }).subscribe({
      next: ({ totalRanking, partRanking, team }) => {
        /**
         * Obere Tabelle = Top10 Geschäftsführer nach Management-Gesamtpunkten.
         */
        this.managementTotalParticipants.set(
          this.withLocalRanks(this.filterGermanyUsers(totalRanking.ranking)).map((entry) =>
            this.mapUserToParticipant(
              entry,
              entry.rank ?? null,
              'managementRankingTotal'
            )
          )
        );

        /**
         * Untere Tabelle = Team Ranking.
         */
        this.teamParticipants.set(
          team?.team.map((entry) =>
            this.mapUserToParticipant(entry, entry.overallRank ?? null)
          ) ?? []
        );

        /**
         * Geschäftsführer Lager Ranking nach Management-Lagerpunkten.
         */
        this.managementPartParticipants.set(
          this.withLocalRanks(this.filterGermanyUsers(partRanking.ranking)).map((entry) =>
            this.mapUserToParticipant(
              entry,
              entry.rank ?? null,
              'managementRankingPart'
            )
          )
        );

        if (this.isFullAdminUser()) {
          this.loadAdminSalesRanking(competition);
          return;
        }

        this.salesParticipants.set([]);
        this.warehouseParticipants.set([]);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Ranking konnte nicht geladen werden.');
        this.resetRankingState();
        this.loading.set(false);
      },
    });
  }

  private loadAdminSalesRanking(competition: RankingCompetition): void {
    this.rankingService.getSalesRanking(competition).subscribe({
      next: (sales) => {
        this.salesParticipants.set(
          sales.ranking.map((entry) =>
            this.mapUserToParticipant(entry, entry.rank ?? null)
          )
        );

        this.warehouseParticipants.set([]);
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
      ? this.rankingService.getWarehouseRanking(
          this.showWarehouseFullRanking() ? this.warehouseRankingCountryIso() : undefined
        )
      : of(null);

    forkJoin({
      sales: shouldLoadSales ? this.rankingService.getSalesRanking(competition) : of(null),
      warehouse: warehouseRequest$,
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

  private resetRankingState(): void {
    this.salesParticipants.set([]);
    this.managementTotalParticipants.set([]);
    this.managementPartParticipants.set([]);
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
    rank: number | null,
    pointsField: RankingPointsField = 'totalPoints'
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
      totalPoints: this.getUserPoints(user, pointsField),
    };
  }

  private getUserPoints(user: RankingUser, pointsField: RankingPointsField): number {
    if (pointsField === 'managementRankingTotal') {
      return user.managementRankingTotal ?? user.totalPoints ?? 0;
    }

    return user[pointsField] ?? 0;
  }

  private filterGermanyUsers(users: RankingUser[]): RankingUser[] {
    return users.filter((user) => this.normalizeCountryIso(user.iso || user.country) !== 'AT');
  }

  private withLocalRanks(users: RankingUser[]): RankingUser[] {
    return users.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));
  }

  private normalizeCountryIso(value?: string): CountryIso | '' {
    const normalized = String(value || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (['de', 'deutschland', 'germany'].includes(normalized)) {
      return 'DE';
    }

    if (['at', 'osterreich', 'oesterreich', 'austria'].includes(normalized)) {
      return 'AT';
    }

    return '';
  }

  private getCountryLabel(iso: CountryIso): string {
    return iso === 'AT' ? 'Österreich' : 'Deutschland';
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

  setWarehouseRankingCountry(iso: CountryIso): void {
    if (this.warehouseRankingCountryIso() === iso) {
      return;
    }

    this.warehouseRankingCountryIso.set(iso);
    this.warehouseCurrentPage.set(1);
    this.loadRanking();
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
