import { Component, inject } from '@angular/core';
import { CompetitionService } from '../../../core/services/competition.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'cnh-score',
  imports: [CommonModule],
  templateUrl: './score.html',
  styleUrl: './score.scss',
})
export class Score {
  private competitionService = inject(CompetitionService);

  readonly competition = this.competitionService.activeCompetition;
  readonly competitionConfig = this.competitionService.competitionConfig;

}
