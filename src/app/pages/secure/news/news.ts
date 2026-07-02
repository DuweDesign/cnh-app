import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

import { CompetitionService } from '../../../core/services/competition.service';
import { NewsContentItem, NewsStatusService } from '../../../core/services/news-status.service';
import { environment } from '../../../../environments/environments';

interface NewsImage {
  name: string;
  url: string;
}

const NEWS_PAGE_SIZE = 10;

@Component({
  selector: 'cnh-news',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './news.html',
  styleUrl: './news.scss',
})
export class News {
  private readonly competitionService = inject(CompetitionService);
  private readonly newsStatusService = inject(NewsStatusService);
  private readonly http = inject(HttpClient);

  readonly competition = this.competitionService.activeCompetition;
  readonly competitionConfig = this.competitionService.competitionConfig;

  readonly newsImages = signal<NewsImage[]>([]);
  readonly newsItems = this.newsStatusService.items;
  readonly isLoadingNews = this.newsStatusService.isLoading;
  readonly newsError = this.newsStatusService.error;
  readonly hasNextPage = computed(() => !!this.newsStatusService.nextCursor());
  readonly hasUnreadNews = this.newsStatusService.hasUnreadNews;

  readonly newsImageGroups = computed(() => {
    const images = this.newsImages();
    const groups: NewsImage[][] = [];

    for (let i = 0; i < images.length; i += 6) {
      groups.push(images.slice(i, i + 6));
    }

    return groups;
  });

  constructor() {
    effect(() => {
      if (this.competition()) {
        queueMicrotask(() => this.loadNews());
      }
    });
  }

  ngOnInit(): void {
    this.loadNewsImages();
  }

  loadNews(reset = true): void {
    this.newsStatusService.loadNews(reset, NEWS_PAGE_SIZE).subscribe({
      error: () => {},
    });
  }

  loadNewsImages(): void {
    this.http
      .get<{ success: boolean; images: NewsImage[] }>(
        `${environment.apiUrl}/v1/cnh/news/images`
      )
      .subscribe({
        next: (response) => {
          this.newsImages.set(response.images ?? []);
        },
        error: (error) => {
          console.error('Fehler beim Laden der News-Bilder:', error);
          this.newsImages.set([]);
        },
      });
  }

  markNewsAsRead(news: NewsContentItem): void {
    if (news.isRead) {
      return;
    }

    this.newsStatusService.markCurrentNewsAsRead(news._id).subscribe({
      error: () => {},
    });
  }

  markAllNewsAsRead(): void {
    this.newsStatusService.markAllCurrentNewsAsRead().subscribe({
      error: () => {},
    });
  }
}
