import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { CompetitionService } from '../../../core/services/competition.service';
import { COMPETITION_CONFIG } from '../../../core/config/competition.config';

@Component({
  selector: 'cnh-prizes',
  imports: [CommonModule],
  templateUrl: './prizes.html',
  styleUrl: './prizes.scss',
})
export class Prizes {
 private competitionService = inject(CompetitionService);

  readonly competition = this.competitionService.activeCompetition;
  readonly competitionConfig = this.competitionService.competitionConfig;

}
