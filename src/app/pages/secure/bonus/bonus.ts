import { Component, computed, inject } from '@angular/core';
import { CompetitionService } from '../../../core/services/competition.service';
import { AuthService } from '../../../core/services/auth.service';
import { USER_ROLES } from '../../../core/models/auth.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'cnh-bonus',
  imports: [CommonModule],
  templateUrl: './bonus.html',
  styleUrl: './bonus.scss',
})
export class Bonus {
  private competitionService = inject(CompetitionService);

  readonly competition = this.competitionService.activeCompetition;
  readonly competitionConfig = this.competitionService.competitionConfig;

  private authService = inject(AuthService);

  readonly isSaleUser = computed(() =>
    this.authService.getUserRole() === USER_ROLES.CNH_SALES
  );
}
