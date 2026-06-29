import { Injectable, computed, inject, signal } from '@angular/core';

import { COMPETITIONS } from '../models/auth.model';
import { AuthService } from './auth.service';
import { CompetitionService } from './competition.service';

const CURRENT_NEWS_ID = 'harvest-contact-competition-2026-06-17';

@Injectable({
  providedIn: 'root',
})
export class NewsStatusService {
  private readonly authService = inject(AuthService);
  private readonly competitionService = inject(CompetitionService);
  private readonly storagePrefix = 'cnh_read_news';
  private readonly readVersion = signal(0);

  readonly isCurrentNewsRelevant = computed(() => {
    const competition = this.competitionService.activeCompetition();

    return (
      competition === COMPETITIONS.CASE_STEYR ||
      competition === COMPETITIONS.NEW_HOLLAND
    );
  });

  readonly hasUnreadNews = computed(() => {
    this.readVersion();

    const key = this.currentStorageKey();

    if (!key || !this.isCurrentNewsRelevant()) {
      return false;
    }

    return localStorage.getItem(key) !== CURRENT_NEWS_ID;
  });

  markCurrentNewsAsRead(): void {
    const key = this.currentStorageKey();

    if (!key || !this.isCurrentNewsRelevant()) {
      return;
    }

    localStorage.setItem(key, CURRENT_NEWS_ID);
    this.readVersion.update((version) => version + 1);
  }

  private currentStorageKey(): string | null {
    const user = this.authService.getCurrentUser();
    const competition = this.competitionService.activeCompetition();

    if (!user || !competition) {
      return null;
    }

    const userKey = user._id || user.dealernumber || user.email || user.role;

    return `${this.storagePrefix}:${userKey}:${competition}`;
  }
}
