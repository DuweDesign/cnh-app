import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompetitionService } from '../../../core/services/competition.service';
import { AuthService } from '../../../core/services/auth.service';
import { USER_ROLES } from '../../../core/models/auth.model';

type RuleRow = {
  label: string;
  points: number;
};

type SeasonalRow = {
  label: string;
  period: string;
  points: number;
};

type RuleExample = {
  title: string;
  text: string;
  result: string;
};

type RulesTab = 'sales' | 'management';

type RulesConfig = {
  theme: 'case' | 'new-holland';
  eyebrow: string;
  title: string;
  intro: string;
  howItWorks: {
    text1: string;
    text2: string;
  };
  mission15: {
    subtitle: string;
    text1: string;
    text2: string;
    text3: string;
  };
  monthlyReward: {
    text1: string;
    cardText1: string;
    cardText2: string;
    cardNote: string;
    text2: string;
  };
  mainTable: {
    pointsLabel: string;
    rows: RuleRow[];
  };
  seasonalPush: SeasonalRow[];
  extraPoints: {
    label: string;
    points: number;
  };
  ceLightTable?: {
    title: string;
    labelColumn: string;
    pointsLabel: string;
    rows: RuleRow[];
  } | null;
  examples: RuleExample[];
  duration: {
    text1: string;
    text2: string;
  };
  conditions: string[];
  administration: {
    text1: string;
    text2: string;
    email: string;
  };
  additionalConditions: string[];
  closing: {
    text: string;
    highlight: string;
  };
};

type ManagementRulesConfig = {
  theme: 'case' | 'new-holland';
  eyebrow: string;
  title: string;
  intro: string;
  overview: string[];
  systemIntro: string;
  pillars: {
    title: string;
    text: string;
    example?: string;
  }[];
  marketShareTable: {
    title: string;
    rows: {
      targetAchievement: string;
      points: number;
    }[];
  };
  websiteNote: string;
};

@Component({
  selector: 'cnh-rules',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rules.html',
  styleUrl: './rules.scss',
})
export class Rules {
  private competitionService = inject(CompetitionService);

  readonly competition = this.competitionService.activeCompetition;
  readonly competitionConfig = this.competitionService.competitionConfig;

  readonly activeTab = signal<RulesTab>('sales');

  private authService = inject(AuthService);

  readonly isSaleUser = computed(() =>
    this.authService.getUserRole() === USER_ROLES.CNH_SALES
  );

  setTab(tab: RulesTab): void {
    this.activeTab.set(tab);
  }

  readonly rulesConfig = computed<RulesConfig | null>(() => {
    const competition = this.competition();

    if (competition === 'new-holland') {
      return {
        theme: 'new-holland',
        eyebrow: 'Verkaufs-Offensive 2026',
        title: 'Die Regeln für NEW HOLLAND',
        intro:
          '2026 wird unser Jahr. Mit der Verkaufs-Offensive motivieren wir alle Verkäuferinnen und Verkäufer, aktiv am Wettbewerb teilzunehmen, Verkaufszahlen zu steigern und neue Kunden zu gewinnen.',
        howItWorks: {
          text1:
            'Für jede verkaufte New Holland Maschine gibt es Punkte. Bei ausgewählten Produktgruppen sorgt ein saisonaler Push im Aktionszeitraum für zusätzliche Punkte.',
          text2:
            'Die Endverkaufsmeldungen pro Verkäufer werden monatlich ausgewertet. Die erreichten Punkte werden ermittelt und zusammengezählt. Über die Aktion Mission 15 können zusätzlich bis zu 10 EXTRA-Punkte gesammelt werden.',
        },
        mission15: {
          subtitle: 'Neue Kunden gewinnen. Chancen nutzen. Erfolge feiern.',
          text1:
            'Jeder Verkäufer analysiert und definiert 15 potenzielle Kunden aus dem Verkaufsgebiet, die bisher keine CNH-Maschinen besitzen oder zuletzt Wettbewerbsprodukte gekauft haben.',
          text2:
            'Diese Kunden werden in der SalesApp inklusive einer SalesApp-Aktivität mit dem Namen „Mission 15“ hinterlegt.',
          text3:
            'Kommt es zu einem erfolgreichen Abschluss, gibt es für diese Endverkaufsmeldung zusätzlich zu den Punkten des verkauften Produkts 10 EXTRA-Punkte.',
        },
        monthlyReward: {
          text1:
            'Jeden Monat werden die Ergebnisse neu ausgewertet. Jeden Monat startet das Rennen wieder neu. Jeder hat die Chance, sich an die Spitze zu setzen und bis zum Jahresende kontinuierlich Punkte zu sammeln.',
          cardText1:
            'Die Top Ten Verkäuferinnen und Verkäufer erhalten pro Monat einen <strong>Amazon-Gutschein in Höhe von 175,00&nbsp;€</strong>.',
          cardText2:
            'Die Gutscheine werden monatlich nach der Auswertung im Folgemonat verschickt.',
          cardNote:
            'Die erforderliche Pauschalversteuerung wird zusätzlich von CNH übernommen.',
          text2:
            'Darüber hinaus wird es für die besten Verkäufer und deren Geschäftsführer zum Abschluss der Verkaufs-Offensive noch zwei weitere Highlights geben.',
        },
        mainTable: {
          pointsLabel: 'Punkte pro RC-Meldung',
          rows: [
            { label: 'Mähdrescher / Feldhäcksler / Traubenvollernter', points: 6 },
            { label: 'Traktoren High Horse Power (HHP) ab T5 DCT', points: 4 },
            { label: 'Traktoren Low Horse Power (LHP)', points: 2 },
            { label: 'Pressen & Teleskoplader', points: 2 },
            { label: 'Boomer', points: 1 },
          ],
        },
        seasonalPush: [
          { label: 'Pressen', period: 'April / Juli / August / September', points: 8 },
          { label: 'Mähdrescher', period: 'Juli / August / September', points: 10 },
          { label: 'Feldhäcksler', period: 'November / Dezember', points: 8 },
        ],
        extraPoints: {
          label: 'Endverkauf an einen Kunden aus der Aktion Mission 15',
          points: 10,
        },
        ceLightTable: {
          title: 'Produktgruppe CE Light',
          labelColumn: 'Produktgruppe CE Light',
          pointsLabel: 'Punkte pro RC-Meldung',
          rows: [
            { label: 'Radlader W110D - W190D', points: 4 },
            { label: 'Kompakt Radlader W50 – W100', points: 2 },
            { label: 'Midibagger E70D - E100D', points: 2 },
            {
              label: 'Baggerlader B100C-B115C / Kompaktlader L313-L334 / Minibagger / Skid Steer Lader',
              points: 1,
            },
          ],
        },
        examples: [
          {
            title: 'Beispiel 1',
            text: 'Verkäufer 1 hat im März folgende Maschinen verkauft: 3× HHP + 2× LHP',
            result: 'Punkte nach RC: 3×4 + 2×2 = 16 Punkte',
          },
          {
            title: 'Beispiel 2',
            text: 'Verkäufer 2 hat im März folgende Maschinen verkauft: 1× LHP + 1× HHP + 1× Pressen. Ein Endverkauf wurde außerdem bei einem Mission 15-Kunden getätigt.',
            result: 'Punkte nach RC: 1×2 + 1×4 + 1×2 + 10 = 18 Punkte',
          },
        ],
        duration: {
          text1:
            'Die Verkaufs-Offensive beginnt rückwirkend am 1. März 2026 und läuft bis zum 31. Dezember 2026.',
          text2:
            'Gewertet werden alle Endverkaufsmeldungen in eQuipment mit Verkäuferzuordnung.',
        },
        conditions: [
          'Alle Verkäuferinnen und Verkäufer nehmen automatisch teil, inklusive Partnerbetriebe, sofern diese korrekt im Händlerportal angelegt sind.',
          'Voraussetzung ist ein aktiver SalesApp-Zugang.',
          'Die Angebotserstellung muss über die SalesApp erfolgen, inklusive der Meldung, dass das Projekt gewonnen ist.',
          'Zur Auswertung muss die Verkaufsperson in eQuipment dem Endverkauf zugeordnet sein.',
          'Endverkäufe ohne Zuordnung werden nicht gewertet.',
        ],
        administration: {
          text1:
            'Um das Ergebnis pro Verkäufer auszuwerten, ist es notwendig, die jeweilige Person bei der Verkaufsmeldung in eQuipment aus der Drop-down-Liste auszuwählen.',
          text2:
            'Bitte prüfen Sie, ob alle Verkäufer hinterlegt und aktuell sind. Sollten Namen fehlen oder Personen, die dort aufgeführt sind, nicht mehr im Unternehmen sein, kann eine Aktualisierung durchgeführt werden.',
          email: 'lesyaleonidivna.trynchuk@external.cnh.com',
        },
        additionalConditions: [
          'Die Namen der nachzutragenden Händlerverkäufer müssen bis Freitag, den 13. März 2026, gemeldet werden.',
          'Bitte geben Sie Händlername, Vorname und Nachname des Verkäufers an.',
          'Der Versand der Gutscheine erfolgt über die Geschäfts-E-Mail-Adresse an die Top Ten Verkäuferinnen und Verkäufer.',
          'Die Verkaufs-Offensive ist gültig für in eQuipment eingegebene endverkaufte Maschinen im Zeitraum vom 01. März 2026 bis 31. Dezember 2026.',
          'Berücksichtigt werden: Traktoren, Mähdrescher, Feldhäcksler, Traubenvollernter, Pressen, Teleskoplader und CE Light Produkte.',
          'Die Anleitung für die Zuordnung „Maschine – Verkäufer“ befindet sich im eQuipment-System in der Anlage.',
          'Die Verkaufs-Offensive 2026 wird seitens CNH Industrial Deutschland GmbH pauschal versteuert.',
          'Die Ergebnisse werden monatlich bekanntgegeben, die Gutscheine im Folgemonat verschickt.',
          'Eine konsequente Nutzung der SalesApp zur Angebotserstellung wird vorausgesetzt und ist für die Teilnahme notwendig.',
          'Alle SalesApp-User werden über den SalesApp-Newsletter über die Verkaufs-Offensive inklusive Mission 15 informiert.',
          'Vertriebspartner, die nicht teilnehmen möchten, müssen dies an Frau Bierling und Herrn Dr. Fischer kommunizieren. In diesem Fall kann auch die gesamte Verkaufsmannschaft sowie gegebenenfalls Verkäufer von Partnerbetrieben nicht teilnehmen.',
          'Bitte leiten Sie diese Information auch an teilnehmende Partnerhändler weiter.',
        ],
        closing: {
          text: 'Wir wünschen Ihnen viel Erfolg beim Verkauf. Das gesamte New Holland Team steht für Rückfragen jederzeit zur Verfügung.',
          highlight: 'Greifen wir GEMEINSAM im Jahr 2026 an!',
        },
      };
    }

    return {
      theme: 'case',
      eyebrow: 'Verkaufs-Offensive 2026',
      title: 'Die Regeln für CASE IH & STEYR',
      intro:
        '2026 wird unser Jahr. Mit der Verkaufs-Offensive motivieren wir alle Verkäuferinnen und Verkäufer, aktiv am Wettbewerb teilzunehmen, Verkaufszahlen zu steigern und neue Kunden zu gewinnen.',
      howItWorks: {
        text1:
          'Für jede verkaufte CASE IH- oder STEYR-Maschine gibt es Punkte. Bei ausgewählten Produktgruppen sorgt ein saisonaler Push im Aktionszeitraum für zusätzliche Punkte.',
        text2:
          'Die Endverkaufsmeldungen pro Verkäufer werden monatlich ausgewertet. Die erreichten Punkte werden ermittelt und zusammengezählt. Über die Aktion Mission 15 können zusätzlich bis zu 10 EXTRA-Punkte gesammelt werden.',
      },
      mission15: {
        subtitle: 'Neue Kunden gewinnen. Chancen nutzen. Erfolge feiern.',
        text1:
          'Jeder Verkäufer analysiert und definiert 15 potenzielle Kunden aus dem Verkaufsgebiet, die bisher keine CNH-Maschinen besitzen oder zuletzt Wettbewerbsprodukte gekauft haben.',
        text2:
          'Diese Kunden werden in der SalesApp inklusive einer SalesApp-Aktivität mit dem Namen „Mission 15“ hinterlegt.',
        text3:
          'Kommt es zu einem erfolgreichen Abschluss, gibt es für diese Endverkaufsmeldung zusätzlich zu den Punkten des verkauften Produkts 10 EXTRA-Punkte.',
      },
      monthlyReward: {
        text1:
          'Jeden Monat werden die Ergebnisse neu ausgewertet. Jeden Monat startet das Rennen wieder neu. Jeder hat die Chance, sich an die Spitze zu setzen und bis zum Jahresende kontinuierlich Punkte zu sammeln.',
        cardText1:
          'Die Top Ten Verkäuferinnen und Verkäufer erhalten pro Monat einen <strong>Amazon-Gutschein in Höhe von 175,00&nbsp;€</strong>.',
        cardText2:
          'Die Gutscheine werden monatlich nach der Auswertung im Folgemonat verschickt.',
        cardNote:
          'Die erforderliche Pauschalversteuerung wird zusätzlich von CNH übernommen.',
        text2:
          'Darüber hinaus wird es für die besten Verkäufer und deren Geschäftsführer zum Abschluss der Verkaufs-Offensive noch zwei weitere Highlights geben.',
      },
      mainTable: {
        pointsLabel: 'Punkte pro Endverkaufsmeldung',
        rows: [
          { label: 'Mähdrescher / Quadtrac', points: 6 },
          { label: 'Traktoren High Horse Power (HHP) ab Expert / Vestrum', points: 4 },
          { label: 'Traktoren Low Horse Power (LHP)', points: 2 },
          { label: 'Pressen & Teleskoplader / Telehandlers', points: 2 },
        ],
      },
      seasonalPush: [
        { label: 'Pressen', period: 'April', points: 8 },
        { label: 'Mähdrescher', period: 'Juli / August', points: 10 },
        { label: 'Großtraktoren Quadtrac', period: 'September / Oktober', points: 8 },
      ],
      extraPoints: {
        label: 'Endverkauf an einen Kunden aus der Aktion Mission 15',
        points: 10,
      },
      ceLightTable: null,
      examples: [
        {
          title: 'Beispiel 1',
          text: 'Verkäufer 1 hat im März folgende Maschinen verkauft: 3× HHP + 2× LHP',
          result: 'Punkte nach RC: 3×4 + 2×2 = 16 Punkte',
        },
        {
          title: 'Beispiel 2',
          text: 'Verkäufer 2 hat im März folgende Maschinen verkauft: 1× LHP + 1× HHP + 1× Pressen. Ein Endverkauf wurde außerdem bei einem Mission 15-Kunden getätigt.',
          result: 'Punkte nach RC: 1×2 + 1×4 + 1×2 + 10 = 18 Punkte',
        },
      ],
      duration: {
        text1:
          'Die Verkaufs-Offensive beginnt rückwirkend am 1. März 2026 und läuft bis zum 31. Dezember 2026.',
        text2:
          'Gewertet werden alle Endverkaufsmeldungen in eQuipment mit Verkäuferzuordnung.',
      },
      conditions: [
        'Alle Verkäuferinnen und Verkäufer nehmen automatisch teil, inklusive Partnerbetriebe, sofern diese korrekt im Händlerportal angelegt sind.',
        'Voraussetzung ist ein aktiver SalesApp-Zugang.',
        'Die Angebotserstellung muss über die SalesApp erfolgen, inklusive der Meldung, dass das Projekt gewonnen ist.',
        'Zur Auswertung muss die Verkaufsperson in eQuipment dem Endverkauf zugeordnet sein.',
        'Endverkäufe ohne Zuordnung werden nicht gewertet.',
      ],
      administration: {
        text1:
          'Um das Ergebnis pro Verkäufer auszuwerten, ist es notwendig, die jeweilige Person bei der Verkaufsmeldung in eQuipment aus der Drop-down-Liste auszuwählen.',
        text2:
          'Bitte prüfen Sie, ob alle Verkäufer hinterlegt und aktuell sind. Sollten Namen fehlen oder Personen, die dort aufgeführt sind, nicht mehr im Unternehmen sein, kann eine Aktualisierung durchgeführt werden.',
        email: 'elisabetta.sagona@cnh.com',
      },
      additionalConditions: [
        'Die Namen der nachzutragenden Händlerverkäufer müssen bis Freitag, den 13. März 2026, gemeldet werden.',
        'Bitte geben Sie Händlername, Vorname und Nachname des Verkäufers an.',
        'Der Versand der Gutscheine erfolgt über die Geschäfts-E-Mail-Adresse an die Top Ten Verkäuferinnen und Verkäufer.',
        'Die Verkaufs-Offensive ist gültig für in eQuipment eingegebene endverkaufte Maschinen im Zeitraum vom 01. März 2026 bis 31. Dezember 2026.',
        'Berücksichtigt werden: Traktoren, Mähdrescher, Pressen und Teleskoplader.',
        'Die Anleitung für die Zuordnung „Maschine – Verkäufer“ befindet sich im eQuipment-System in der Anlage.',
        'Die Verkaufs-Offensive 2026 wird seitens CNH Industrial Deutschland GmbH pauschal versteuert.',
        'Die Ergebnisse werden monatlich bekanntgegeben, die Gutscheine im Folgemonat verschickt.',
        'Eine konsequente Nutzung der SalesApp zur Angebotserstellung wird vorausgesetzt und ist für die Teilnahme notwendig.',
        'Alle SalesApp-User werden über den SalesApp-Newsletter über die Verkaufs-Offensive inklusive Mission 15 informiert.',
        'Vertriebspartner, die nicht teilnehmen möchten, müssen dies an Herrn Dr. Fischer und Frau Bierling kommunizieren. In diesem Fall kann auch die gesamte Verkaufsmannschaft sowie gegebenenfalls Verkäufer von Partnerbetrieben nicht teilnehmen.',
        'Bitte leiten Sie diese Information auch an teilnehmende Partnerhändler weiter.',
      ],
      closing: {
        text: 'Wir wünschen Ihnen viel Erfolg beim Verkauf. Das gesamte CASE IH & STEYR Team steht für Rückfragen jederzeit zur Verfügung.',
        highlight: 'Jetzt heißt es: Angriff – und gemeinsam gewinnen.',
      },
    };
  });

  readonly managementRulesConfig = computed<ManagementRulesConfig | null>(() => {
    const competition = this.competition();

    return {
      theme: competition === 'new-holland' ? 'new-holland' : 'case',
      eyebrow: 'Geschäftsführer Incentive 2026',
      title: 'Die Regeln für Geschäftsführer',
      intro:
        'Das Geschäftsführer Incentive 2026 belohnt die erfolgreichsten Händler des Jahres. Die 20 Händler mit den meisten Punkten erhalten jeweils zwei Plätze für die Incentive-Reise.',
      overview: [
        'Alle Händler haben die gleichen Chancen auf eine Platzierung.',
        'Die Wertung basiert auf drei Bereichen, die zu einer Gesamtpunktzahl zusammengeführt werden.',
        'Ihre aktuelle Punktzahl und Platzierung können Sie auf der eigenen Wettbewerbs-Webseite einsehen.',
      ],
      systemIntro:
        'Das Punktesystem setzt sich aus drei Bereichen zusammen:',
      pillars: [
        {
          title: '1. Vertriebsleistung Ihres Teams',
          text:
            'Alle Punkte Ihrer Verkäufer, die am Verkäufer-Wettbewerb teilnehmen, werden summiert und anschließend durch die Anzahl Ihrer Verkäufer geteilt.',
          example:
            'Beispiel: Sie haben 3 Verkäufer. Verkäufer A hat 100 Punkte, Verkäufer B 150 Punkte und Verkäufer C 110 Punkte. Daraus ergibt sich ein Mittelwert von 120 Punkten für das Geschäftsführer Incentive.',
        },
        {
          title: '2. Marktanteil',
          text:
            'Der Marktanteil zeigt, wie erfolgreich Sie mit Ihrem Team die Marktbearbeitung umgesetzt haben. Grundlage ist das in der Jahreszielvereinbarung festgelegte Marktanteilsziel. Bei Zielerreichung oder Übererfüllung erhalten Sie zusätzliche Punkte.',
          example:
            'Beispiel: Ihr Marktanteilsziel liegt bei 10 %. Sie erreichen 11,2 %. Damit erhalten Sie 120 Punkte für das Geschäftsführer Incentive.',
        },
        {
          title: '3. Ersatzteile',
          text:
            'Parallel zum Verkäufer-Wettbewerb läuft ein Incentive im Bereich Ersatzteile. Die dort erreichten Punkte Ihres Ersatzteilleiters werden ebenfalls für das Geschäftsführer Incentive angerechnet.',
          example:
            'Beispiel: Erreicht Ihr Ersatzteilleiter 90 Punkte, werden diese zu den Punkten aus den anderen beiden Bereichen addiert.',
        },
      ],
      marketShareTable: {
        title: 'Punkte für Zielerreichung beim Marktanteil',
        rows: [
          { targetAchievement: '90 % des JZV-Ziels', points: 80 },
          { targetAchievement: '100 % des JZV-Ziels', points: 100 },
          { targetAchievement: '110 % des JZV-Ziels', points: 120 },
        ],
      },
      websiteNote:
        'Für diesen Wettbewerb steht eine eigene Webseite zur Verfügung. Dort sehen Sie jederzeit Ihre Punkte und Ihre aktuelle Platzierung.',
    };
  });
}