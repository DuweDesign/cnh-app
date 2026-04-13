import { Component, computed, DestroyRef, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { CompetitionService } from '../../../core/services/competition.service';
import { COMPETITION_CONFIG } from '../../../core/config/competition.config';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { USER_ROLES } from '../../../core/models/auth.model';

@Component({
  selector: 'cnh-news',
  imports: [CommonModule, RouterLink],
  templateUrl: './news.html',
  styleUrl: './news.scss',
})
export class News {
  private competitionService = inject(CompetitionService);
  private destroyRef = inject(DestroyRef);

  @ViewChild('pageContent') pageContentRef?: ElementRef<HTMLElement>;
  @ViewChild('timeline') timelineRef?: ElementRef<HTMLElement>;

  readonly competition = this.competitionService.activeCompetition;
  readonly competitionConfig = this.competitionService.competitionConfig;

  readonly isTimelineSlider = signal(false);

  private authService = inject(AuthService);

  readonly isSaleUser = computed(() =>
    this.authService.getUserRole() === USER_ROLES.CNH_SALES
  );


  // data = [
  //   {
  //     month: 'April',
  //     label: 'Der Startschuss',
  //     description: 'Mit der Aussaat von Mais, Zuckerrüben und Sommergetreide beginnt die neue Saison. Jetzt werden die Grundlagen für eine erfolgreiche Ernte gelegt – genau wie im Verkaufswettbewerb, bei dem ein starker Start entscheidend für den Gesamterfolg ist.',
  //     active: true
  //   },
  //   {
  //     month: 'Mai',
  //     label: 'Wachstum und Pflege',
  //     description: 'Die Kulturen werden gepflegt, gedüngt und geschützt. Aufmerksamkeit und Einsatz zahlen sich aus – so wie im Verkaufswettbewerb, bei dem konstante Aktivität und Kundenfokus den Unterschied machen.',
  //     active: false
  //   },
  //   {
  //     month: 'Juni',
  //     label: 'Volle Leistung',
  //     description: 'Intensives Pflanzenwachstum und erste Grünfutterernte prägen den Monat. Höchstleistung auf dem Feld ist gefragt – vergleichbar mit der heißen Phase des Verkaufswettbewerbs, in der Engagement und Tempo zählen.',
  //     active: false
  //   },
  //   {
  //     month: 'Juli',
  //     label: 'Erste Erfolge',
  //     description: 'Die Getreideernte beginnt, Ergebnisse werden sichtbar. Ähnlich zeigen sich im Verkaufswettbewerb erste Erfolge und Zwischenstände, die zusätzlich motivieren.',
  //     active: false
  //   },
  //   {
  //     month: 'August',
  //     label: 'Erntehochphase',
  //     description: 'Haupterntezeit für Getreide und Raps. Jetzt zahlt sich die Arbeit der vergangenen Monate aus – wie im Verkaufswettbewerb, wenn Abschlüsse realisiert und Punkte gesammelt werden.',
  //     active: false
  //   },
  //   {
  //     month: 'September',
  //     label: 'Weichen für die Zukunft',
  //     description: 'Aussaat von Wintergetreide und Ernte von Mais und Kartoffeln. Parallel dazu heißt es im Verkaufswettbewerb: Chancen nutzen und die Basis für den Endspurt legen.',
  //     active: false
  //   },
  //   {
  //     month: 'Oktober',
  //     label: 'Abschluss und Vorbereitung',
  //     description: 'Letzte Erntearbeiten und Bodenvorbereitung bestimmen den Monat. Im Verkaufswettbewerb geht es darum, offene Potenziale zu heben und sich auf das Finale vorzubereiten.',
  //     active: false
  //   },
  //   {
  //     month: 'November',
  //     label: 'Zielgerade',
  //     description: 'Die Felder kommen zur Ruhe, Planung und Wartung stehen im Mittelpunkt. Auch im Verkaufswettbewerb beginnt die Zielgerade: Jetzt entscheiden Fokus und Ausdauer über den Erfolg.',
  //     active: false
  //   },
  //   {
  //     month: 'Dezember',
  //     label: 'Ernte der Leistungen',
  //     description: 'Winterruhe auf den Feldern, Rückblick und Planung für das neue Jahr. Zeit, im Verkaufswettbewerb die Leistungen zu feiern, Gewinner zu küren und Motivation für die nächste Saison zu schaffen.',
  //     active: false
  //   }
  // ];

  // ngAfterViewInit(): void {
  //   const pageContentEl = this.pageContentRef?.nativeElement;
  //   const timelineEl = this.timelineRef?.nativeElement;

  //   if (!pageContentEl || !timelineEl) return;

  //   const checkLayout = () => {
  //     const containerWidth = pageContentEl.clientWidth;
  //     this.isTimelineSlider.set(containerWidth < 1440);
  //   };

  //   const resizeObserver = new ResizeObserver(() => {
  //     checkLayout();
  //   });

  //   resizeObserver.observe(pageContentEl);
  //   checkLayout();

  //   this.destroyRef.onDestroy(() => {
  //     resizeObserver.disconnect();
  //   });
  // }

  // scrollTimeline(direction: 'prev' | 'next'): void {
  //   const timelineEl = this.timelineRef?.nativeElement;
  //   if (!timelineEl) return;

  //   const card = timelineEl.querySelector('.timeline__item') as HTMLElement | null;
  //   const cardWidth = card?.offsetWidth ?? 280;
  //   const gap = 16;

  //   timelineEl.scrollBy({
  //     left: direction === 'next' ? cardWidth + gap : -(cardWidth + gap),
  //     behavior: 'smooth',
  //   });
  // }
}
