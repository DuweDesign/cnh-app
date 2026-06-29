import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { CompetitionService } from '../../../core/services/competition.service';
import { AuthService } from '../../../core/services/auth.service';
import { COMPETITIONS, CompetitionType } from '../../../core/models/auth.model';
import { NewsStatusService } from '../../../core/services/news-status.service';
import { environment } from '../../../../environments/environments';

interface NewsImage {
  name: string;
  url: string;
}

interface NewsSection {
  title?: string;
  paragraphs: string[];
}

interface NewsContent {
  headline: string;
  intro: string[];
  sections: NewsSection[];
}

const WAREHOUSE_COMPETITION_KEY = 'warehouse';

const WAREHOUSE_ROLES = [
  'cnh-warehouse',
  'warehouse-admin',
] as const;

const HARVEST_NEWS_CONTENT: NewsContent = {
  headline: 'Jetzt zählt jeder Kontakt - der Wettbewerb zur heißesten Phase des Jahres',
  intro: [
    `Die Ernte steht vor der Tür - für viele Betriebe die intensivste und zugleich entscheidendste
    Zeit des Jahres. Genau jetzt entstehen die besten Gespräche, die ehrlichsten Eindrücke und die
    wertvollsten Verkaufschancen. Vorführungen werden zum Schlüsselmoment: Hier wird Leistung
    erlebbar, Vertrauen aufgebaut und der Grundstein für erfolgreiche Abschlüsse gelegt.`,
  ],
  sections: [
    {
      paragraphs: [
        `Um diesen entscheidenden Zeitraum noch aktiver zu nutzen, starten wir einen zusätzlichen
        Wettbewerb: Wer es schafft, seine Vorführungen konsequent zu dokumentieren,
        Kundenbedürfnisse gezielt zu erfassen und diese in konkrete Angebote zu überführen,
        positioniert sich nicht nur erfolgreich im Markt - sondern sichert sich auch einen klaren
        Vorteil im Wettbewerb.<br><br>Jetzt ist die Zeit, sichtbar zu werden, Chancen zu nutzen und aus jedem Kontakt das Maximum
        herauszuholen.`,
      ],
    },
  ],
};

const WAREHOUSE_NEWS_CONTENT: NewsContent = {
  headline: 'Ihre Challenge für 2026: Werden Sie LAGERCHAMP!',
  intro: [
    `Für einen echten Lagerchamp legen wir uns richtig ins Zeug. Kämpfen Sie um den Titel und
    gewinnen Sie eine unvergessliche Reise Anfang 2027. Aufregend, atemberaubend und wunderschön.
    Freuen Sie sich auf eine Destination, die viele auf der Wunschliste haben. Erleben Sie
    atemberaubende Landschaften, tolle Menschen und Kulturen und die Gemeinschaft der
    CNH Lagerchamps 2026.`,

    `Kämpfen Sie für eine Reise, die Ihnen lange in Erinnerung bleiben wird. Das ist unser
    Versprechen.`,
  ],
  sections: [
    {
      title: 'Alles vorrätig!',
      paragraphs: [
        `Der beste Rat ist der Vorrat. Das ganze Jahr über brauchen Ihre Kunden hochwertige
        Ersatzteile, um ihre Maschinen am Laufen zu halten. Sie unterstützen, indem Sie dafür
        sorgen, dass alles, was dringend gebraucht wird, immer auf Lager ist.`,

        `Nur wer im Ranking unter den besten Lagerleitern ist, kommt mit auf die Reise.`,
      ],
    },
    {
      title: 'Wertungssystem',
      paragraphs: [
        `Unter der Rubrik Regeln erfahren Sie detailliert, was Sie tun müssen. Unter Punktestand
        sehen Sie Ihre aktuellen Werte und Ihre Platzierung sowie die Ihres nächstbesseren
        Mitbewerbers.`,
      ],
    },
  ],
};

@Component({
  selector: 'cnh-news',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news.html',
  styleUrl: './news.scss',
})
export class News {
  private readonly competitionService = inject(CompetitionService);
  private readonly authService = inject(AuthService);
  private readonly newsStatusService = inject(NewsStatusService);
  private readonly http = inject(HttpClient);

  readonly competition = this.competitionService.activeCompetition;
  readonly competitionConfig = this.competitionService.competitionConfig;

  readonly newsImages = signal<NewsImage[]>([]);
  readonly hasUnreadNews = this.newsStatusService.hasUnreadNews;

  readonly currentRole = computed(() => this.authService.getUserRole());

  readonly activeCompetitionKey = computed(() => {
    const config = this.competitionConfig() as { key?: string } | null;
    const competition = this.competition();

    if (config?.key) {
      return config.key;
    }

    return typeof competition === 'string' ? competition : '';
  });

  readonly isWarehouseNews = computed(() => {
    const role = String(this.currentRole() ?? '');
    const competitionKey = this.activeCompetitionKey();

    return (
      competitionKey === WAREHOUSE_COMPETITION_KEY ||
      WAREHOUSE_ROLES.includes(role as typeof WAREHOUSE_ROLES[number])
    );
  });

  readonly newsContent = computed<NewsContent>(() => {
    if (this.isWarehouseNews()) {
      return WAREHOUSE_NEWS_CONTENT;
    }

    const competition = this.competition();
    const brandParagraph = this.getBrandParagraph(competition);

    return {
      ...HARVEST_NEWS_CONTENT,
      sections: [
        {
          paragraphs: [
            [
              HARVEST_NEWS_CONTENT.sections[0].paragraphs[0],
              brandParagraph,
              `Jetzt ist die Zeit, sichtbar zu werden, Chancen zu nutzen und aus jedem Kontakt das Maximum
              herauszuholen.`,
            ].filter(Boolean).join('<br><br>'),
          ],
        },
      ],
    };
  });

  readonly newsImageGroups = computed(() => {
    const images = this.newsImages();
    const groups: NewsImage[][] = [];

    for (let i = 0; i < images.length; i += 6) {
      groups.push(images.slice(i, i + 6));
    }

    return groups;
  });

  ngOnInit(): void {
    this.loadNewsImages();
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

  markNewsAsRead(): void {
    this.newsStatusService.markCurrentNewsAsRead();
  }

  private getBrandParagraph(competition: CompetitionType | null): string {
    if (competition === COMPETITIONS.NEW_HOLLAND) {
      return `<strong>Alle weiteren Bedingungen sind dem Rundschreiben Erntetechnik 07/2026 vom 17.06.2026
      zu entnehmen.</strong>`;
    }

    if (competition === COMPETITIONS.CASE_STEYR) {
      return `<strong>Alle weiteren Bedingungen sind dem Rundschreiben Erntetechnik 06/2026 vom 17.06.2026
      zu entnehmen.</strong>`;
    }

    return '';
  }
}
