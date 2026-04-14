import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { COMPETITIONS, CompetitionType } from '../models/auth.model';
import { HttpClient } from '@angular/common/http';
import { COMPETITION_CONFIG, CompetitionConfig } from '../config/competition.config';
import { environment } from '../../../environments/environments';

interface CompetitionBackgroundResponse {
  success: boolean;
  competition: string;
  month: string;
  backgroundImage: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class CompetitionService {
  private apiUrl = environment.apiUrl;

  private authService = inject(AuthService);
  private http = inject(HttpClient);

  private readonly storageKey = 'cnh_selected_competition';
  private readonly _selectedCompetition = signal<CompetitionType | null>(this.getStoredCompetition());
  private readonly _competitionConfig = signal<CompetitionConfig | null>(null);

  readonly selectedCompetition = this._selectedCompetition.asReadonly();
  readonly competitionConfig = this._competitionConfig.asReadonly();

  readonly activeCompetition = computed<CompetitionType | null>(() => {
    const user = this.authService.getCurrentUser();

    if (!user) {
      return null;
    }

    if (user.competition) {
      return user.competition;
    }

    if (this.authService.canSelectCompetition()) {
      return this._selectedCompetition() ?? COMPETITIONS.CASE_STEYR;
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

    effect(() => {
      const competition = this.activeCompetition();

      if (!competition) {
        this._competitionConfig.set(null);
        return;
      }

      this.loadCompetitionConfig(competition);
    })
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

  private loadCompetitionConfig(competition: CompetitionType): void {
    const slug = this.getCompetitionSlug(competition);
    const baseConfig = structuredClone(COMPETITION_CONFIG[competition]);

    this.http
      .get<CompetitionBackgroundResponse>(`${this.apiUrl}/v1/cnh/competition-background/${slug}`)
      .subscribe({
        next: (response) => {
          const bg = response.backgroundImage ? this.apiUrl + response.backgroundImage : '/images/default-background.jpg';

          baseConfig.news.backgroundImage = bg;
          baseConfig.ranking.backgroundImage = bg;
          baseConfig.bonus.backgroundImage = bg;
          baseConfig.score.backgroundImage = bg;
          baseConfig.rules.backgroundImage = bg;
          baseConfig.travel.backgroundImage = bg;

          this._competitionConfig.set(baseConfig);
        },
        error: (error) => {
          console.error('Error loading competition background:', error);

          const fallback = '/images/default-background.jpg';
          baseConfig.news.backgroundImage = fallback;
          baseConfig.ranking.backgroundImage = fallback;
          baseConfig.bonus.backgroundImage = fallback;
          baseConfig.score.backgroundImage = fallback;
          baseConfig.rules.backgroundImage = fallback;
          baseConfig.travel.backgroundImage = fallback;

          this._competitionConfig.set(baseConfig);
        }
      });
  }

  private getCompetitionSlug(competition: CompetitionType): 'case-steyr' | 'new-holland' {
    switch (competition) {
      case COMPETITIONS.CASE_STEYR:
        return 'case-steyr';
      case COMPETITIONS.NEW_HOLLAND:
        return 'new-holland';
      default:
        return 'case-steyr';
    }
  }

  private getStoredCompetition(): CompetitionType | null {
    const value = localStorage.getItem(this.storageKey);

    if (
      value === COMPETITIONS.CASE_STEYR ||
      value === COMPETITIONS.NEW_HOLLAND
    ) {
      return value;
    }

    return null;
  }
}