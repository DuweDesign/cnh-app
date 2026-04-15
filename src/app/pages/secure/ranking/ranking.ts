import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { CompetitionService } from '../../../core/services/competition.service';
import { USER_ROLES } from '../../../core/models/auth.model';

type RankingParticipant = {
  id: number;
  dealerNumber: string;
  name: string;
  role: 'sales' | 'management';
  company: string;
  points: number;
};

@Component({
  selector: 'cnh-ranking',
  imports: [CommonModule],
  templateUrl: './ranking.html',
  styleUrl: './ranking.scss',
})
export class Ranking {
  private competitionService = inject(CompetitionService);

  readonly competition = this.competitionService.activeCompetition;
  readonly competitionConfig = this.competitionService.competitionConfig;

  private authService = inject(AuthService);

  readonly isSaleUser = computed(() =>
    this.authService.getUserRole() === USER_ROLES.CNH_SALES
  );

  // Dummy-Daten – später durch API ersetzen
  readonly participants = computed<RankingParticipant[]>(() => [
    {
      id: 1,
      dealerNumber: '1001',
      name: 'Max Mustermann',
      role: 'sales',
      company: 'Musterhaus Berlin',
      points: 245,
    },
    {
      id: 2,
      dealerNumber: '1002',
      name: 'Julia Schneider',
      role: 'management',
      company: 'Agrartechnik Nord',
      points: 220,
    },
    {
      id: 3,
      dealerNumber: '1003',
      name: 'Tobias Fischer',
      role: 'sales',
      company: 'Landtechnik West',
      points: 198,
    },
    {
      id: 4,
      dealerNumber: '1004',
      name: 'Sarah Klein',
      role: 'management',
      company: 'Hof & Technik Süd',
      points: 176,
    },
  ]);

  readonly sortedParticipants = computed(() =>
    [...this.participants()].sort((a, b) => b.points - a.points)
  );

  getRoleLabel(role: 'sales' | 'management'): string {
    return role === 'sales' ? 'Verkäufer' : 'Geschäftsführung';
  }
}