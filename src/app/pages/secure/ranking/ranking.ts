import { Component, computed, inject } from '@angular/core';
import { CompetitionService } from '../../../core/services/competition.service';
import { COMPETITION_CONFIG } from '../../../core/config/competition.config';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'cnh-ranking',
  imports: [CommonModule],
  templateUrl: './ranking.html',
  styleUrl: './ranking.scss',
})
export class Ranking {

  private competitionService = inject(CompetitionService);

  readonly competition = this.competitionService.activeCompetition;

  readonly competitionConfig = computed(() => {
    const key = this.competition();
    return key ? COMPETITION_CONFIG[key] : null;
  });
}
