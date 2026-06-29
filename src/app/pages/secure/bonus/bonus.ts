import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CompetitionService } from '../../../core/services/competition.service';
import { AuthService } from '../../../core/services/auth.service';

import { USER_ROLES } from '../../../core/models/auth.model';
import { BonusStatusResponse } from '../../../core/models/bonus.model';
import { ProfileService } from '../../../core/services/profile.service';
import { MyProfile } from '../../../core/models/profile.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'cnh-bonus',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bonus.html',
  styleUrl: './bonus.scss',
})
export class Bonus {
  private competitionService = inject(CompetitionService);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);

  readonly competition = this.competitionService.activeCompetition;
  readonly competitionConfig = this.competitionService.competitionConfig;

  readonly profile = signal<MyProfile | null>(null);
  readonly currentUser = this.authService.user;
  
  readonly isLoading = signal<boolean>(true);
  readonly dealerNumberInput = signal<string>('');

  readonly isSaleUser = computed(() =>
    this.authService.getUserRole() === USER_ROLES.CNH_SALES
  );

  readonly isWarehouseUser = computed(() =>
    this.authService.getUserRole() === USER_ROLES.CNH_WAREHOUSE
  );

  readonly isAdmin = computed(() => {
    const role = this.currentUser()?.role;
    return ['sysadmin', 'vipp-admin', 'cnh-admin', 'warehouse-admin'].includes(role ?? '');
  });

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly bonusStatus = signal<BonusStatusResponse | null>(null);

  readonly winnerLimit = computed(() => this.bonusStatus()?.winnerLimit ?? 10);
  readonly bonusCountryIso = computed(() =>
    this.bonusStatus()?.countryIso ?? this.normalizeCountryIso(this.currentUser()?.iso || this.currentUser()?.country)
  );

  constructor() {
    if (this.isSaleUser() || this.isWarehouseUser() || this.authService.isAdmin()) {
      this.loadBonusStatus();
      this.loadProfile();
    } else {
      this.loading.set(false);
    }
  }

  readonly warehouseBonusPoints = computed(() =>
    this.profile()?.monthlyPoints.reduce((sum, month) => sum + (month.bonuspoints ?? 0), 0)
    ?? this.bonusStatus()?.myMonthBonusPoints
    ?? 0
  );

  loadBonusStatus(dealernumber?: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.profileService.getBonusStatus(dealernumber).subscribe({
      next: (response) => {
        this.bonusStatus.set(response);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          err?.error?.message || 'Bonusstatus konnte nicht geladen werden.'
        );
        this.loading.set(false);
      }
    });
  }

  readonly bonusHeadline = computed(() => {
    const status = this.bonusStatus();

    if (!status) return '';

    if (status.isTop10) {
      return this.competitionConfig()?.key === 'warehouse'
        ? `Du bist aktuell unter den Top ${this.winnerLimit()} und würdest einen Tischkicker gewinnen. Weiter so!`
        : `Du bist aktuell unter den Top ${this.winnerLimit()} – weiter so!`;
    }

    if (status.top10Count < this.winnerLimit()) {
      return 'Das Monatsranking baut sich aktuell noch auf.';
    }

    return this.competitionConfig()?.key === 'warehouse'
      ? `Bis zur Quartalschallenge fehlen dir noch ${status.pointsToTop10} Punkte`
      : `Bis zum Monatsbonus fehlen dir noch ${status.pointsToTop10} Punkte`;
  });

  readonly bonusNumber = computed(() => {
    const status = this.bonusStatus();

    if (!status) return null;

    return status.isTop10 ? null : status.pointsToTop10;
  });

  loadProfile(dealernumber?: string): void {
    this.isLoading.set(true);

    this.profileService.getMyProfile(dealernumber).subscribe({
      next: (response) => {
        this.profile.set(response);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  onLoadAdminProfile(): void {
    const dealernumber = this.dealerNumberInput().trim();
    this.loadBonusStatus(dealernumber || undefined);
    this.loadProfile(dealernumber || undefined);
  }

  onResetToOwnProfile(): void {
    this.dealerNumberInput.set('');
    this.loadBonusStatus();
    this.loadProfile();
  }

  private normalizeCountryIso(value?: string): 'DE' | 'AT' | null {
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

    return null;
  }
}
