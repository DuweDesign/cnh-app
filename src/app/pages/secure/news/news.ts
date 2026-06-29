import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { CompetitionService } from '../../../core/services/competition.service';
import { AuthService } from '../../../core/services/auth.service';
import { COMPETITIONS, CompetitionType, USER_ROLES } from '../../../core/models/auth.model';
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
  roleSections?: NewsSection[];
}

const LATEST_NEWS_ID = 'harvest-contact-competition-2026-06-17';
const DEFAULT_NEWS_ID = 'yield-offensive-2026';

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
        Vorteil im Wettbewerb.`,
      ],
    },
  ],
};

const DEFAULT_NEWS_CONTENT: NewsContent = {
  headline: 'Eine Herausforderung, ein Ziel = Der höchste Ertrag!',
  intro: [
    `Wenn Sie zu den echten <strong>Ertragsmachern der CNH Verkaufsoffensive 2026</strong> gehören,
    werden Sie Anfang 2027 eine Reise erleben, die Sie nicht mehr vergessen. Aufregend,
    atemberaubend und wunderschön. Freuen Sie sich auf eine Destination, die viele auf der
    Wunschliste haben. Erleben Sie atemberaubende Landschaften, tolle Menschen und
    Kulturen und die Gemeinschaft der CNH Gewinner 2026.`,

    `Kämpfen Sie für eine Reise, die Ihnen lange in Erinnerung bleiben wird. Das ist unser
    Versprechen.`,
  ],
  sections: [
    {
      title: 'Ertrag',
      paragraphs: [
        `Ohne Einsatz kein Ertrag. Ohne den Verkauf der richtigen Maschinen keine gute Ernte,
        keine Punkte und damit kein Gewinn. Nur Ihr Verkaufsgeschick bringt Sie vorwärts und ist
        bei dieser Challenge ein absolutes Muss.`,

        `Nur wer es im Ranking unter den Besten 10 schafft, zählt zum Kreis der Gewinner.`,

        `Sie haben 8 Monate Zeit - geben Sie jeden Monat richtig Gas, achten Sie auf
        Sonderaktionen und belohnen Sie sich zwischendurch mit Mission 15 Punkten. Sie sind
        maßgeblich im Rennen um den Gewinn.`,
      ],
    },
    {
      title: 'Wertungssystem',
      paragraphs: [
        `Unter der Rubrik Regeln erfahren Sie detailliert, was Sie tun müssen. Unter Punktestand
        sehen Sie Ihre aktuellen Werte und Ihre Platzierung sowie die Ihres nächstbesseren
        Mitbewerbers.`,

        `Jetzt aber los - es gilt eine reiche Ernte einzufahren!`,
      ],
    },
  ],
};

const MANAGEMENT_NEWS_SECTIONS: NewsSection[] = [
  {
    paragraphs: [
      `Als Geschäftsführer sehen Sie in der Rubrik „Ranking“ genau, wo Ihr Unternehmen und
      die Mitbewerber stehen. Und damit wissen Sie genau, was zu tun ist. Sie nehmen als
      Unternehmen an der Challenge teil, also motivieren Sie Ihr Team und bestimmen Sie so
      am Ende mit, das gleich zwei Gewinner Ihrer Mannschaft an der Reise teilnehmen dürfen.`,

      `Aber damit nicht genug: Ist Ihr Unternehmen unter den 10 Besten der Branche, dürfen
      auch Sie mit 2 Personen den Koffer packen in der <strong>„CNH Ertragsmacher Reise 2026“</strong>
      einchecken.`,

      `Wir drücken die Daumen! Motivieren Sie Ihr Team! Stellen Sie Ihre Top 10 Platzierung zum
      Ende des Jahres 2026 sicher.`,
    ],
  },
];

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

  readonly isManagementUser = computed(() =>
    this.currentRole() === USER_ROLES.CNH_MANAGEMENT
  );

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

    return {
      ...DEFAULT_NEWS_CONTENT,
      roleSections: this.isManagementUser() ? MANAGEMENT_NEWS_SECTIONS : [],
    };
  });

  readonly latestNewsContent = computed<NewsContent | null>(() => {
    if (this.isWarehouseNews()) {
      return null;
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

  readonly isLatestNewsUnread = computed(() =>
    this.newsStatusService.hasUnreadNewsById(LATEST_NEWS_ID)
  );

  readonly isDefaultNewsUnread = computed(() =>
    this.newsStatusService.hasUnreadNewsById(DEFAULT_NEWS_ID)
  );

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
    this.newsStatusService.markCurrentNewsAsRead(LATEST_NEWS_ID);
  }

  markDefaultNewsAsRead(): void {
    this.newsStatusService.markCurrentNewsAsRead(DEFAULT_NEWS_ID);
  }

  markAllNewsAsRead(): void {
    this.newsStatusService.markAllCurrentNewsAsRead();
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
