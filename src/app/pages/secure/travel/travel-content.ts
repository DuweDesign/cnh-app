
export type TravelAudience = 'sales' | 'management' | 'warehouse';

interface TravelContent {
  destination: string;
  date: string;
  description: string[];
  paragraphs: string[];
}

// Sales and Management copy: 261005_CNH_Texte_Reiseziele.pages,
// sections “Kurzbeschreibung Bilder Portal” and “Newsseite Portal”.
// Warehouse copy will be supplied separately; retain the existing travel date.
export const TRAVEL_CONTENT: Record<TravelAudience, TravelContent> = {
  sales: {
    destination: 'Lofoten',
    date: '06. - 10. März 2027',
    description: [
      'Majestätische Berge. Tiefe Fjorde. Natur, die sprachlos macht. Polarlichter, kaltes Nordmeer und Abenteuer.',
      'Die Lofoten stehen für Weite und echte nordische Magie.',
      'Eine Reise für alle, die außergewöhnliche Landschaften und unvergessliche Erlebnisse lieben.',
    ],
    paragraphs: [
      'Das Reiseziel der Verkäufer-Challenge 2027 steht fest: die Besten der Besten fliegen vom 06. - 10. März nach Lofoten in Norwegen.',
      'Raue Küsten, spektakuläre Berglandschaften und kleine Fischerdörfer bilden die Kulisse für eine Reise, die man so schnell nicht vergisst.',
      'Die Lofoten stehen für eine spektakuläre Natur, Abenteuer und gemeinsame Erlebnisse. Mehr möchten wir heute noch gar nicht verraten – nur so viel: Freuen Sie sich auf ein Programm, das perfekt zu dieser einzigartigen Region passt.',
      'In den kommenden Wochen und Monaten geben wir hier nach und nach weitere Einblicke in die Reise und verraten Stück für Stück, was die Gewinner auf den Lofoten erwartet.',
      'Schauen Sie also regelmäßig vorbei – es gibt noch einiges zu entdecken.',
      'Jetzt liegt es an Ihnen: Nutzen Sie jede Chance, sammeln Sie Punkte und sichern Sie sich Ihren Platz auf den Lofoten.',
    ],
  },
  management: {
    destination: 'Mauritius',
    date: '12. - 19. März 2027',
    description: [
      'Türkisblaues Wasser. Tropische Natur. Momente, die lange in Erinnerung bleiben.',
      'Abenteuer, Genuss und Entspannung – Mauritius verbindet all das auf einzigartige Weise.',
      'Freuen Sie sich auf eine Reise voller Kontraste, besonderer Begegnungen und unvergesslicher Erlebnisse.',
    ],
    paragraphs: [
      'Jetzt dürfen wir es endlich verraten:',
      'Die Ertragsmacher 2027 reisen vom 12. - 19. März 2027 nach Mauritius.',
      'Eine Insel, die für türkisblaues Wasser, beeindruckende Natur und unvergessliche Erlebnisse steht. Genau der richtige Ort, um außergewöhnliche Leistungen gemeinsam zu feiern.',
      'So viel sei verraten: Es wird aktiv, abwechslungsreich und typisch für Mauritius. Freuen Sie sich auf besondere Begegnungen, freundliche Menschen und Erlebnisse, die weit über einen klassischen Hotelaufenthalt hinausgehen. In den kommenden Wochen und Monaten nehmen wir Sie Schritt für Schritt mit auf die Reise und geben immer wieder neue Einblicke in das Programm, das Hotel und die besonderen CNH Erlebnisse vor Ort.',
      'Es lohnt sich also, regelmäßig hier vorbeizuschauen. Bis dahin heißt es: Punkte sammeln, gemeinsam Gas geben und sich einen Platz auf dieser besonderen Reise sichern.',
      'Wir freuen uns darauf, Sie auf Mauritius willkommen zu heißen!',
    ],
  },
  warehouse: {
    destination: 'Irland',
    date: '07. - 11. April 2027',
    description: [],
    paragraphs: [],
  },
};
