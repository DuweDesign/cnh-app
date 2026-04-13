import { Component, computed, inject } from '@angular/core';
import { CompetitionService } from '../../../core/services/competition.service';
import { COMPETITION_CONFIG } from '../../../core/config/competition.config';
import { CommonModule } from '@angular/common';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'cnh-score',
  imports: [CommonModule, RouterLink],
  templateUrl: './score.html',
  styleUrl: './score.scss',
})
export class Score {
  private competitionService = inject(CompetitionService);

  readonly competition = this.competitionService.activeCompetition;

  readonly competitionConfig = computed(() => {
    const key = this.competition();
    return key ? COMPETITION_CONFIG[key] : null;
  });
}
