import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { MyProfile } from '../models/profile.model';
import { BonusStatusResponse } from '../models/bonus.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/v1/cnh`;

  getMyProfile(dealernumber?: string): Observable<MyProfile> {
    let params = new HttpParams();

    if (dealernumber?.trim()) {
      params = params.set('dealernumber', dealernumber.trim());
    }

    return this.http
      .get<{
        user: MyProfile
      }>(`${this.apiUrl}/user/my-profile`, { params })
      .pipe(
        map((response) => response.user)
      );
  }

  getBonusStatus(dealernumber?: string): Observable<BonusStatusResponse> {
    let params = new HttpParams();

    if (dealernumber?.trim()) {
      params = params.set('dealernumber', dealernumber.trim());
    }

    return this.http.get<BonusStatusResponse>(`${this.apiUrl}/user/points/bonus-status`, { params });
  }
}