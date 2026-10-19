import {
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompetitionService } from '../../../core/services/competition.service';
import { AuthService } from '../../../core/services/auth.service';
import { USER_ROLES } from '../../../core/models/auth.model';
import { TRAVEL_CONTENT, TravelAudience } from './travel-content';
import { selectTravelImages } from './travel-images';

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

  readonly competition = this.competitionService.activeCompetition;
  readonly competitionConfig = this.competitionService.competitionConfig;

  readonly canSwitchAudience = computed(() => this.authService.isAdmin());
  readonly selectedAudience = signal<TravelAudience | null>(null);
  readonly audienceOptions: { value: TravelAudience; label: string }[] = [
    { value: 'sales', label: 'Sales' },
    { value: 'management', label: 'Management' },
    { value: 'warehouse', label: 'Warehouse' },
  ];

  readonly audience = computed<TravelAudience>(() => {
    if (this.canSwitchAudience() && this.selectedAudience()) {
      return this.selectedAudience()!;
    }

    switch (this.authService.getUserRole()) {
      case USER_ROLES.CNH_MANAGEMENT:
        return 'management';
      case USER_ROLES.CNH_WAREHOUSE:
      case USER_ROLES.WAREHOUSE_ADMIN:
        return 'warehouse';
      case USER_ROLES.CNH_SALES:
        return 'sales';
      default:
        return this.competition() === 'warehouse' ? 'warehouse' : 'sales';
    }
  });
  readonly content = computed(() => TRAVEL_CONTENT[this.audience()]);
  private readonly imageSelections = {
    sales: selectTravelImages('sales'),
    management: selectTravelImages('management'),
    warehouse: selectTravelImages('warehouse'),
  };
  readonly images = computed(() => this.imageSelections[this.audience()]);
  readonly additionalImages = computed(() => this.images().slice(6));
  readonly openingParagraphs = computed(() => this.content().paragraphs.slice(0, 3));
  readonly closingParagraphs = computed(() => this.content().paragraphs.slice(3));
  readonly logoUrl = computed(() => this.audience() === 'warehouse'
    ? '/images/die_lagerchamps.png'
    : '/images/ertragsmacher_logo.png');

  setAudience(audience: TravelAudience): void {
    if (this.canSwitchAudience()) {
      this.selectedAudience.set(audience);
    }
  }

}
