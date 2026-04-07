import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { COMPETITIONS, CompetitionType } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class CompetitionService {
  private authService = inject(AuthService);

  private readonly storageKey = 'cnh_selected_competition';
  private readonly _selectedCompetition = signal<CompetitionType | null>(this.getStoredCompetition());

  readonly selectedCompetition = this._selectedCompetition.asReadonly();

  readonly activeCompetition = computed<CompetitionType | null>(() => {
    const user = this.authService.getCurrentUser();

    if (!user) {
      return null;
    }

    if (user.competition) {
      return user.competition;
    }

    if (this.authService.canSelectCompetition()) {
      return this._selectedCompetition();
    }

    return null;
  });

  readonly canToggleCompetition = computed(() => this.authService.canSelectCompetition());

  constructor() {
    effect(() => {
      const current = this._selectedCompetition();

      if (current) {
        localStorage.setItem(this.storageKey, current);
      } else {
        localStorage.removeItem(this.storageKey);
      }
    });
  }

  setCompetition(competition: CompetitionType): void {
    if (!this.authService.canSelectCompetition()) {
      return;
    }

    this._selectedCompetition.set(competition);
  }

  toggleCompetition(): void {
    if (!this.authService.canSelectCompetition()) {
      return;
    }

    const current = this._selectedCompetition();

    if (current === COMPETITIONS.CASE_STEYR) {
      this._selectedCompetition.set(COMPETITIONS.NEW_HOLLAND);
      return;
    }

    this._selectedCompetition.set(COMPETITIONS.CASE_STEYR);
  }

  clearCompetitionSelection(): void {
    this._selectedCompetition.set(null);
  }

  private getStoredCompetition(): CompetitionType | null {
    const value = localStorage.getItem(this.storageKey);

    if (
      value === COMPETITIONS.CASE_STEYR ||
      value === COMPETITIONS.NEW_HOLLAND
    ) {
      return value;
    }

    return COMPETITIONS.CASE_STEYR;
  }
}