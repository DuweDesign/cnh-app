import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CompetitionService } from '../../../core/services/competition.service';
import { ProfileService } from '../../../core/services/profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { MyProfile } from '../../../core/models/profile.model';

type ScorePhase = {
  title: string;
  description: string;
}

@Component({
  selector: 'cnh-score',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './score.html',
  styleUrl: './score.scss',
})
export class Score {
  private competitionService = inject(CompetitionService);
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);

  readonly competition = this.competitionService.activeCompetition;
  readonly competitionConfig = this.competitionService.competitionConfig;

  readonly profile = signal<MyProfile | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  readonly dealerNumberInput = signal<string>('');

  readonly currentUser = this.authService.user;
  readonly isAdmin = computed(() => {
    const role = this.currentUser()?.role;
    return ['sysadmin', 'vipp-admin', 'cnh-admin'].includes(role ?? '');
  });

  readonly totalPoints = computed(() => this.profile()?.totalPoints ?? 0);
  readonly rank = computed(() => this.profile()?.rank ?? null);
  readonly isTop10 = computed(() => this.profile()?.isTop10);
  readonly pointsToTop10 = computed(() => this.profile()?.pointsToTop10 ?? 0);

  readonly rankingHeadline = computed(() => {
    const currentRank = this.rank();

    if (currentRank === null) {
      return 'Deine Platzierung wird aktuell berechnet.';
    }

    if (currentRank === 1) {
      return 'Stark! Du bist aktuell auf Platz 1.';
    }

    if (this.isTop10()) {
      return 'Top! Du bist derzeit unter den Gewinnern - jetzt heißt es dran zu bleiben!';
    }

    return `Bleib dran – dir fehlen noch ${this.pointsToTop10()} Punkte bis zu Rang 10!`;
  });

  private readonly phaseMap: Record<number, ScorePhase> = {
    3: {
      title: 'APRIL – Der Startschuss',
      description:
        'Mit der Aussaat von Mais, Zuckerrüben und Sommergetreide beginnt die neue Saison. Jetzt werden die Grundlagen für eine erfolgreiche Ernte gelegt – genau wie im Verkaufswettbewerb, bei dem ein starker Start entscheidend für den Gesamterfolg ist.',
    },
    4: {
      title: 'MAI – Wachstum und Pflege',
      description:
        'Die Kulturen werden gepflegt, gedüngt und geschützt. Aufmerksamkeit und Einsatz zahlen sich aus – so wie im Verkaufswettbewerb, bei dem konstante Aktivität und Kundenfokus den Unterschied machen.',
    },
    5: {
      title: 'JUNI – Volle Leistung',
      description:
        'Intensives Pflanzenwachstum und erste Grünfutterernte prägen den Monat. Höchstleistung auf dem Feld ist gefragt – vergleichbar mit der heißen Phase des Verkaufswettbewerbs, in der Engagement und Tempo zählen.',
    },
    6: {
      title: 'JULI – Erste Erfolge',
      description:
        'Die Getreideernte beginnt, Ergebnisse werden sichtbar. Ähnlich zeigen sich im Verkaufswettbewerb erste Erfolge und Zwischenstände, die zusätzlich motivieren.',
    },
    7: {
      title: 'AUGUST – Erntehochphase',
      description:
        'Haupterntezeit für Getreide und Raps. Jetzt zahlt sich die Arbeit der vergangenen Monate aus – wie im Verkaufswettbewerb, wenn Abschlüsse realisiert und Punkte gesammelt werden.',
    },
    8: {
      title: 'SEPTEMBER – Weichen für die Zukunft',
      description:
        'Aussaat von Wintergetreide und Ernte von Mais und Kartoffeln. Parallel dazu heißt es im Verkaufswettbewerb: Chancen nutzen und die Basis für den Endspurt legen.',
    },
    9: {
      title: 'OKTOBER – Abschluss und Vorbereitung',
      description:
        'Letzte Erntearbeiten und Bodenvorbereitung bestimmen den Monat. Im Verkaufswettbewerb geht es darum, offene Potenziale zu heben und sich auf das Finale vorzubereiten.',
    },
    10: {
      title: 'NOVEMBER – Zielgerade',
      description:
        'Die Felder kommen zur Ruhe, Planung und Wartung stehen im Mittelpunkt. Auch im Verkaufswettbewerb beginnt die Zielgerade: Jetzt entscheiden Fokus und Ausdauer über den Erfolg.',
    },
    11: {
      title: 'DEZEMBER – Ernte der Leistungen',
      description:
        'Winterruhe auf den Feldern, Rückblick und Planung für das neue Jahr. Zeit, im Verkaufswettbewerb die Leistungen zu feiern, Gewinner zu küren und Motivation für die nächste Saison zu schaffen.',
    },
  };

  readonly currentPhase = computed<ScorePhase>(() => {
    const month = new Date().getMonth();

    return (
      this.phaseMap[month] ?? { title: 'AKTUELLE PHASE', description: 'Die aktuelle Montasphase wird in Kürze angezeigt.' }
    )
  })

  constructor() {
    this.loadProfile();
  }

  loadProfile(dealernumber?: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.profileService.getMyProfile(dealernumber).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Fehler beim Laden des Profils:', err);
        this.error.set('Der Punktestand konnte nicht geladen werden.');
        this.isLoading.set(false);
      },
    });
  }

  onLoadAdminProfile(): void {
    const dealernumber = this.dealerNumberInput().trim();
    this.loadProfile(dealernumber || undefined);
  }

  onResetToOwnProfile(): void {
    this.dealerNumberInput.set('');
    this.loadProfile();
  }
}