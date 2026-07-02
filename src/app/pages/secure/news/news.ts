import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { CompetitionService } from '../../../core/services/competition.service';
import { AuthService } from '../../../core/services/auth.service';
import { NewsContentItem, NewsStatusService } from '../../../core/services/news-status.service';
import { environment } from '../../../../environments/environments';

interface NewsImage {
  name: string;
  url: string;
}

interface AdminNewsItem {
  _id: string;
  title: string;
  intro: string[];
  sections: { title?: string; paragraphs: string[] }[];
  cta?: { label: string; route: string } | null;
  images?: NewsImage[];
  competitions: string[];
  roles: string[];
  isPublished: boolean;
  readVersion: number;
  publishedAt: string;
  expiresAt?: string | null;
}

interface AdminNewsForm {
  id: string | null;
  title: string;
  introText: string;
  bodyText: string;
  ctaLabel: string;
  ctaRoute: string;
  images: NewsImage[];
  competitions: string[];
  roles: string[];
  isPublished: boolean;
  publishedAt: string;
  expiresAt: string;
  treatAsNew: boolean;
}

const NEWS_PAGE_SIZE = 10;
const EMPTY_ADMIN_FORM: AdminNewsForm = {
  id: null,
  title: '',
  introText: '',
  bodyText: '',
  ctaLabel: '',
  ctaRoute: '',
  images: [],
  competitions: ['case-steyr', 'new-holland'],
  roles: [],
  isPublished: true,
  publishedAt: '',
  expiresAt: '',
  treatAsNew: false,
};

@Component({
  selector: 'cnh-news',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './news.html',
  styleUrl: './news.scss',
})
export class News {
  private readonly competitionService = inject(CompetitionService);
  private readonly authService = inject(AuthService);
  private readonly newsStatusService = inject(NewsStatusService);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/v1/cnh`;

  readonly competition = this.competitionService.activeCompetition;
  readonly competitionConfig = this.competitionService.competitionConfig;

  readonly newsItems = this.newsStatusService.items;
  readonly isLoadingNews = this.newsStatusService.isLoading;
  readonly newsError = this.newsStatusService.error;
  readonly hasNextPage = computed(() => !!this.newsStatusService.nextCursor());
  readonly hasUnreadNews = this.newsStatusService.hasUnreadNews;
  readonly canManageNews = computed(() => ['sysadmin', 'vipp-admin'].includes(this.authService.getUserRole() ?? ''));

  readonly isAdminPanelOpen = signal(false);
  readonly adminNews = signal<AdminNewsItem[]>([]);
  readonly adminForm = signal<AdminNewsForm>({ ...EMPTY_ADMIN_FORM });
  readonly adminLoading = signal(false);
  readonly adminSaving = signal(false);
  readonly adminUploading = signal(false);
  readonly adminError = signal<string | null>(null);
  readonly adminSuccess = signal<string | null>(null);
  readonly competitionOptions = [
    { value: 'case-steyr', label: 'Case/Steyr' },
    { value: 'new-holland', label: 'New Holland' },
    { value: 'warehouse', label: 'Warehouse' },
  ];
  readonly roleOptions = [
    { value: 'cnh-sales', label: 'Verkauf' },
    { value: 'cnh-management', label: 'Geschäftsführung' },
    { value: 'cnh-warehouse', label: 'Lager' },
    { value: 'cnh-admin', label: 'CNH Admin' },
    { value: 'warehouse-admin', label: 'Warehouse Admin' },
  ];

  constructor() {
    effect(() => {
      if (this.competition()) {
        queueMicrotask(() => this.loadNews());
      }
    });
  }

  ngOnInit(): void {
  }

  loadNews(reset = true): void {
    this.newsStatusService.loadNews(reset, NEWS_PAGE_SIZE).subscribe({
      error: () => {},
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

  toggleAdminPanel(): void {
    this.isAdminPanelOpen.update((isOpen) => !isOpen);

    if (this.isAdminPanelOpen() && this.adminNews().length === 0) {
      this.resetAdminForm();
      this.loadAdminNews();
    }
  }

  loadAdminNews(): void {
    this.adminLoading.set(true);
    this.adminError.set(null);

    this.http.get<{ success: boolean; items: AdminNewsItem[] }>(`${this.apiUrl}/news/admin`).subscribe({
      next: (response) => {
        this.adminNews.set(response.items ?? []);
        this.adminLoading.set(false);
      },
      error: (error) => {
        this.adminError.set(error?.error?.message || 'News konnten nicht geladen werden.');
        this.adminLoading.set(false);
      },
    });
  }

  updateAdminForm(patch: Partial<AdminNewsForm>): void {
    this.adminForm.update((form) => ({ ...form, ...patch }));
  }

  toggleFormValue(field: 'competitions' | 'roles', value: string, checked: boolean): void {
    this.adminForm.update((form) => {
      const values = new Set(form[field]);

      if (checked) {
        values.add(value);
      } else {
        values.delete(value);
      }

      return { ...form, [field]: [...values] };
    });
  }

  resetAdminForm(): void {
    this.adminForm.set({
      ...EMPTY_ADMIN_FORM,
      competitions: [...EMPTY_ADMIN_FORM.competitions],
      roles: [...EMPTY_ADMIN_FORM.roles],
      images: [],
      publishedAt: this.toDateTimeLocal(new Date().toISOString()),
    });
    this.adminError.set(null);
    this.adminSuccess.set(null);
  }

  editAdminNews(news: AdminNewsItem): void {
    this.adminForm.set({
      id: news._id,
      title: news.title,
      introText: news.intro.join('\n\n'),
      bodyText: (news.sections?.[0]?.paragraphs ?? []).join('\n\n'),
      ctaLabel: news.cta?.label ?? '',
      ctaRoute: news.cta?.route ?? '',
      images: [...(news.images ?? [])],
      competitions: [...news.competitions],
      roles: [...news.roles],
      isPublished: news.isPublished,
      publishedAt: this.toDateTimeLocal(news.publishedAt),
      expiresAt: news.expiresAt ? this.toDateTimeLocal(news.expiresAt) : '',
      treatAsNew: false,
    });
    this.adminError.set(null);
    this.adminSuccess.set(null);
  }

  saveAdminNews(): void {
    const form = this.adminForm();
    const payload = {
      title: form.title,
      intro: this.splitParagraphs(form.introText),
      sections: this.splitParagraphs(form.bodyText).length > 0
        ? [{ paragraphs: this.splitParagraphs(form.bodyText) }]
        : [],
      cta: {
        label: form.ctaLabel,
        route: form.ctaRoute,
      },
      images: form.images,
      competitions: form.competitions,
      roles: form.roles,
      isPublished: form.isPublished,
      publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : new Date().toISOString(),
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      treatAsNew: form.treatAsNew,
    };

    this.adminSaving.set(true);
    this.adminError.set(null);
    this.adminSuccess.set(null);

    const request = form.id
      ? this.http.patch<{ success: boolean; item: AdminNewsItem }>(`${this.apiUrl}/news/admin/${form.id}`, payload)
      : this.http.post<{ success: boolean; item: AdminNewsItem }>(`${this.apiUrl}/news/admin`, payload);

    request.subscribe({
      next: () => {
        this.adminSaving.set(false);
        this.resetAdminForm();
        this.adminSuccess.set(form.id ? 'News wurde aktualisiert.' : 'News wurde angelegt.');
        this.loadAdminNews();
        this.loadNews();
      },
      error: (error) => {
        this.adminSaving.set(false);
        this.adminError.set(error?.error?.message || 'News konnte nicht gespeichert werden.');
      },
    });
  }

  deleteAdminNews(news: AdminNewsItem): void {
    this.adminSaving.set(true);
    this.adminError.set(null);
    this.adminSuccess.set(null);

    this.http.delete<{ success: boolean }>(`${this.apiUrl}/news/admin/${news._id}`).subscribe({
      next: () => {
        this.adminSaving.set(false);
        this.adminSuccess.set('News wurde entfernt.');
        this.loadAdminNews();
        this.loadNews();
      },
      error: (error) => {
        this.adminSaving.set(false);
        this.adminError.set(error?.error?.message || 'News konnte nicht entfernt werden.');
      },
    });
  }

  uploadAdminImages(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];

    if (files.length === 0) {
      return;
    }

    const data = new FormData();
    files.forEach((file) => data.append('images', file));

    this.adminUploading.set(true);
    this.adminError.set(null);
    this.adminSuccess.set(null);

    this.http.post<{ success: boolean; images: NewsImage[] }>(`${this.apiUrl}/news/admin/images`, data).subscribe({
      next: (response) => {
        this.adminUploading.set(false);
        this.adminForm.update((form) => ({
          ...form,
          images: [...form.images, ...(response.images ?? [])],
        }));
        input.value = '';
      },
      error: (error) => {
        this.adminUploading.set(false);
        this.adminError.set(error?.error?.message || 'Bilder konnten nicht hochgeladen werden.');
        input.value = '';
      },
    });
  }

  removeAdminImage(image: NewsImage): void {
    this.adminForm.update((form) => ({
      ...form,
      images: form.images.filter((item) => item.url !== image.url),
    }));
  }

  getNewsImageGroups(news: NewsContentItem): NewsImage[][] {
    const images = news.images ?? [];
    const groups: NewsImage[][] = [];

    for (let i = 0; i < images.length; i += 6) {
      groups.push(images.slice(i, i + 6));
    }

    return groups;
  }

  isChecked(values: string[], value: string): boolean {
    return values.includes(value);
  }

  private splitParagraphs(value: string): string[] {
    return value
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }

  private toDateTimeLocal(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);

    return localDate.toISOString().slice(0, 16);
  }
}
