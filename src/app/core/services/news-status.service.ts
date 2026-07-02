import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { COMPETITIONS, CompetitionType } from '../models/auth.model';
import { AuthService } from './auth.service';
import { CompetitionService } from './competition.service';
import { environment } from '../../../environments/environments';

export interface NewsSection {
  title?: string;
  paragraphs: string[];
}

export interface NewsContentItem {
  _id: string;
  title: string;
  slug: string;
  intro: string[];
  sections: NewsSection[];
  cta?: {
    label: string;
    route: string;
  } | null;
  publishedAt: string;
  expiresAt?: string | null;
  isRead: boolean;
}

interface NewsResponse {
  success: boolean;
  items: NewsContentItem[];
  nextCursor: string | null;
  unreadCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class NewsStatusService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly competitionService = inject(CompetitionService);
  private readonly apiUrl = `${environment.apiUrl}/v1/cnh`;

  private readonly _items = signal<NewsContentItem[]>([]);
  private readonly _nextCursor = signal<string | null>(null);
  private readonly _unreadCount = signal(0);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly nextCursor = this._nextCursor.asReadonly();
  readonly unreadCount = this._unreadCount.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly isCurrentNewsRelevant = computed(() => {
    const competition = this.competitionService.activeCompetition();

    return (
      competition === COMPETITIONS.CASE_STEYR ||
      competition === COMPETITIONS.NEW_HOLLAND ||
      competition === COMPETITIONS.WAREHOUSE
    );
  });

  readonly hasUnreadNews = computed(() =>
    this.isCurrentNewsRelevant() && this._unreadCount() > 0
  );

  constructor() {
    effect(() => {
      const user = this.authService.getCurrentUser();
      const competition = this.competitionService.activeCompetition();

      if (!user || !competition || !this.isCurrentNewsRelevant()) {
        this.resetState();
        return;
      }

      this._items.set([]);
      this._nextCursor.set(null);
      this._error.set(null);

      this.refreshUnreadCount().subscribe({
        error: () => this._unreadCount.set(0),
      });
    });
  }

  loadNews(reset = true, limit = 10): Observable<NewsResponse> {
    const competition = this.competitionService.activeCompetition();

    if (!competition) {
      this.resetState();
      throw new Error('Kein Wettbewerb ausgewaehlt');
    }

    this._isLoading.set(true);
    this._error.set(null);

    let params = new HttpParams()
      .set('competition', competition)
      .set('limit', String(limit));

    if (!reset && this._nextCursor()) {
      params = params.set('cursor', this._nextCursor() ?? '');
    }

    return this.http.get<NewsResponse>(`${this.apiUrl}/news`, { params }).pipe(
      tap({
        next: (response) => {
          this._items.set(reset ? response.items : [...this._items(), ...response.items]);
          this._nextCursor.set(response.nextCursor);
          this._unreadCount.set(response.unreadCount);
          this._isLoading.set(false);
        },
        error: () => {
          this._error.set('News konnten nicht geladen werden.');
          this._isLoading.set(false);
        },
      })
    );
  }

  refreshUnreadCount(): Observable<NewsResponse> {
    const competition = this.competitionService.activeCompetition();

    if (!competition) {
      this.resetState();
      throw new Error('Kein Wettbewerb ausgewaehlt');
    }

    const params = new HttpParams()
      .set('competition', competition)
      .set('limit', '1');

    return this.http.get<NewsResponse>(`${this.apiUrl}/news`, { params }).pipe(
      tap((response) => this._unreadCount.set(response.unreadCount))
    );
  }

  hasUnreadNewsById(newsId: string): boolean {
    const item = this._items().find((news) => news._id === newsId || news.slug === newsId);

    return this.isCurrentNewsRelevant() && !!item && !item.isRead;
  }

  markCurrentNewsAsRead(newsId: string): Observable<{ success: boolean; newsId: string }> {
    const competition = this.requireCompetition();
    const params = new HttpParams().set('competition', competition);

    return this.http
      .post<{ success: boolean; newsId: string }>(
        `${this.apiUrl}/news/${newsId}/read`,
        {},
        { params }
      )
      .pipe(
        tap(() => {
          this._items.update((items) =>
            items.map((item) => item._id === newsId ? { ...item, isRead: true } : item)
          );
          this._unreadCount.update((count) => Math.max(0, count - 1));
        })
      );
  }

  markAllCurrentNewsAsRead(): Observable<{ success: boolean; readCount: number }> {
    const competition = this.requireCompetition();
    const params = new HttpParams().set('competition', competition);

    return this.http
      .post<{ success: boolean; readCount: number }>(
        `${this.apiUrl}/news/read-all`,
        {},
        { params }
      )
      .pipe(
        tap(() => {
          this._items.update((items) => items.map((item) => ({ ...item, isRead: true })));
          this._unreadCount.set(0);
        })
      );
  }

  private requireCompetition(): CompetitionType {
    const competition = this.competitionService.activeCompetition();

    if (!competition) {
      throw new Error('Kein Wettbewerb ausgewaehlt');
    }

    return competition;
  }

  private resetState(): void {
    this._items.set([]);
    this._nextCursor.set(null);
    this._unreadCount.set(0);
    this._isLoading.set(false);
    this._error.set(null);
  }
}
