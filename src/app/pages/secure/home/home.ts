import { Component, computed, inject } from '@angular/core';
import { CompetitionService } from '../../../core/services/competition.service';
import { COMPETITION_CONFIG } from '../../../core/config/competition.config';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'cnh-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private competitionService = inject(CompetitionService);

  readonly competition = this.competitionService.activeCompetition;

  readonly competitionConfig = computed(() => {
    const key = this.competition();
    return key ? COMPETITION_CONFIG[key] : null;
  });
}
