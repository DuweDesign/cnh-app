import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environments';
import {
  SalesRankingResponse,
  ManagementRankingResponse,
  MyTeamResponse,
} from '../models/ranking.model';
import { CompetitionType } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class RankingService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/v1/cnh`;

  getSalesRanking(
    competition: CompetitionType,
    limit: number = 100
  ): Observable<SalesRankingResponse> {
    const params = new HttpParams()
      .set('competition', competition)
      .set('limit', limit);

    return this.http.get<SalesRankingResponse>(
      `${this.apiUrl}/user/ranking/sales`,
      { params }
    );
  }

  getManagementRanking(
    competition: CompetitionType,
    dealerGroupId: string
  ): Observable<ManagementRankingResponse> {
    const params = new HttpParams()
      .set('competition', competition)
      .set('dealerGroupId', dealerGroupId);

    return this.http.get<ManagementRankingResponse>(
      `${this.apiUrl}/user/ranking/management-view`,
      { params }
    );
  }

  getMyTeam(
    competition?: CompetitionType,
    dealerGroupId?: string
  ): Observable<MyTeamResponse> {
    let params = new HttpParams();

    if (competition) {
      params = params.set('competition', competition);
    }

    if (dealerGroupId) {
      params = params.set('dealerGroupId', dealerGroupId);
    }

    return this.http.get<MyTeamResponse>(`${this.apiUrl}/user/my-team`, {
      params,
    });
  }
}