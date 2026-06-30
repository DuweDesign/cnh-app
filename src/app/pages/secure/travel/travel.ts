import {
  Component,
  HostListener,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CompetitionService } from '../../../core/services/competition.service';
import { environment } from '../../../../environments/environments';
import { AuthService } from '../../../core/services/auth.service';
import { USER_ROLES, UserRole } from '../../../core/models/auth.model';

type TravelTileType = 'small' | 'wide' | 'tall' | 'large';
type TravelLayoutMode = 'desktop' | 'tablet' | 'mobile';

interface TravelImage {
  name: string;
  url: string;
}

interface TravelTile extends TravelImage {
  id: string;
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
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  readonly competition = this.competitionService.activeCompetition;
  readonly competitionConfig = this.competitionService.competitionConfig;

  readonly images = signal<TravelImage[]>([]);
  readonly viewportWidth = signal(window.innerWidth);
  readonly travelDates = computed<string[]>(() => {
    const role = this.authService.getUserRole();

    if (this.isFullAdminRole(role)) {
      return [
        this.managementTravelDate,
        this.salesTravelDate,
        this.warehouseTravelDate,
      ];
    }

    switch (role) {
      case USER_ROLES.CNH_MANAGEMENT:
        return [this.managementTravelDate];
      case USER_ROLES.CNH_SALES:
        return [this.salesTravelDate];
      case USER_ROLES.CNH_WAREHOUSE:
      case USER_ROLES.WAREHOUSE_ADMIN:
        return [this.warehouseTravelDate];
      default:
        return [];
    }
  });

  private readonly managementTravelDate = '12. - 19. März 2027';
  private readonly salesTravelDate = '06. - 10. März 2027';
  private readonly warehouseTravelDate = '07. - 11. April 2027';

  private readonly desktopPattern: TravelTileType[] = [
    'large',
    'small',
    'small',
    'small',
    'small',
    'large'
  ];

  private readonly tabletPattern: TravelTileType[] = [
    'large',
    'small',
    'small',
    'large'
  ];

  private readonly mobilePattern: TravelTileType[] = [
    'large',
    'small',
    'small',
    'large',
    'small',
    'small'
  ];

  readonly layoutMode = computed<TravelLayoutMode>(() => {
    const width = this.viewportWidth();

    if (width <= 560) {
      return 'mobile';
    }

    if (width <= 1100) {
      return 'tablet';
    }

    return 'desktop';
  });

  readonly activePattern = computed<TravelTileType[]>(() => {
    switch (this.layoutMode()) {
      case 'mobile':
        return this.mobilePattern;
      case 'tablet':
        return this.tabletPattern;
      default:
        return this.desktopPattern;
    }
  });

  readonly imageTiles = computed<TravelTile[]>(() => {
    const pattern = this.activePattern();

    return this.images().map((image, index) => ({
      ...image,
      id: `${index}-${image.url}`,
      type: pattern[index % pattern.length],
    }));
  });

  readonly firstTiles = computed(() => {
    const splitIndex = this.layoutMode() === 'tablet' ? 4 : this.layoutMode() === 'mobile' ? 3 : 3;
    return this.imageTiles().slice(0, splitIndex);
  });

  readonly remainingTiles = computed(() => {
    const splitIndex = this.layoutMode() === 'tablet' ? 4 : this.layoutMode() === 'mobile' ? 3 : 3
    return this.imageTiles().slice(splitIndex);
  });

  ngOnInit(): void {
    this.loadTravelImages();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.viewportWidth.set(window.innerWidth);
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

  trackByTile(_: number, item: TravelTile): string {
    return item.id;
  }

  private isFullAdminRole(role: UserRole | null): boolean {
    return [
      USER_ROLES.SYSADMIN,
      USER_ROLES.VIPP_ADMIN,
      USER_ROLES.CNH_ADMIN,
    ].includes(role as never);
  }
}
