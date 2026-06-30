import { Injectable, computed, inject, signal } from '@angular/core';

import { COMPETITIONS } from '../models/auth.model';
import { AuthService } from './auth.service';
import { CompetitionService } from './competition.service';

const CURRENT_NEWS_IDS = [
  'travel-date-announcement-2026-06-30',
  'harvest-contact-competition-2026-06-17',
  'yield-offensive-2026',
];

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
      competition === COMPETITIONS.NEW_HOLLAND ||
      competition === COMPETITIONS.WAREHOUSE
    );
  });

  readonly hasUnreadNews = computed(() => {
    this.readVersion();

    if (!this.currentStorageKey() || !this.isCurrentNewsRelevant()) {
      return false;
    }

    return CURRENT_NEWS_IDS.some((newsId) => !this.isNewsRead(newsId));
  });

  hasUnreadNewsById(newsId: string): boolean {
    this.readVersion();

    return this.isCurrentNewsRelevant() && !this.isNewsRead(newsId);
  }

  markCurrentNewsAsRead(newsId = CURRENT_NEWS_IDS[0]): void {
    const key = this.currentStorageKey();

    if (!key || !this.isCurrentNewsRelevant()) {
      return;
    }

    const readNewsIds = new Set(this.getReadNewsIds());
    readNewsIds.add(newsId);

    localStorage.setItem(key, JSON.stringify([...readNewsIds]));
    this.readVersion.update((version) => version + 1);
  }

  markAllCurrentNewsAsRead(): void {
    const key = this.currentStorageKey();

    if (!key || !this.isCurrentNewsRelevant()) {
      return;
    }

    localStorage.setItem(key, JSON.stringify(CURRENT_NEWS_IDS));
    this.readVersion.update((version) => version + 1);
  }

  private isNewsRead(newsId: string): boolean {
    return this.getReadNewsIds().includes(newsId);
  }

  private getReadNewsIds(): string[] {
    const key = this.currentStorageKey();

    if (!key) {
      return [];
    }

    const value = localStorage.getItem(key);

    if (!value) {
      return [];
    }

    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string');
      }
    } catch {
      return [value];
    }

    return [value];
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
