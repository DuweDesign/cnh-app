import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CompetitionService } from '../../../core/services/competition.service';
import { environment } from '../../../../environments/environments';

type TravelTileType = 'small' | 'wide' | 'tall' | 'large';

interface TravelImage {
  name: string;
  url: string;
}

interface TravelTile extends TravelImage {
  type: TravelTileType;
}

@Component({
  selector: 'cnh-travel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './travel.html',
  styleUrl: './travel.scss',
})
export class Travel {
  private competitionService = inject(CompetitionService);
  private http = inject(HttpClient);

  readonly competition = this.competitionService.activeCompetition;
  readonly competitionConfig = this.competitionService.competitionConfig;

  readonly images = signal<TravelImage[]>([]);

  /**
   * Wiederholendes, lockeres Muster.
   * So funktioniert die Seite mit beliebig vielen Bildern.
   */
  private readonly tilePattern: TravelTileType[] = [
    'large',
    'small',
    'tall',
    'large',
    'small',
    'large',
    'large',
    'small',
    'tall',
    'large',
    'small',
  ];

  readonly imageTiles = computed<TravelTile[]>(() => {
    return this.images().map((image, index) => ({
      ...image,
      type: this.tilePattern[index % this.tilePattern.length],
    }));
  });

  ngOnInit(): void {
    this.loadTravelImages();
  }

  loadTravelImages(): void {
    this.http
      .get<{ success: boolean; images: TravelImage[] }>(
        `${environment.apiUrl}/v1/cnh/travel/images`
      )
      .subscribe({
        next: (response) => {
          this.images.set(response.images ?? []);
        },
        error: (error) => {
          console.error('Fehler beim Laden der Reise-Bilder:', error);
          this.images.set([]);
        },
      });
  }

  trackByName(_: number, item: TravelTile): string {
    return item.name;
  }
}