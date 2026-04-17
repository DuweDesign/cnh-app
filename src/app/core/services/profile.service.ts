import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environments';
import { ChangePasswordPayload, MyProfile, UpdateProfilePayload } from '../models/profile.model';
import { BonusStatusResponse } from '../models/bonus.model';
import { AuthUser } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private http = inject(HttpClient);
  
  private readonly apiUrl = `${environment.apiUrl}/v1/cnh`;
  private readonly _user = signal<AuthUser | null>(null);

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this._user());


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

  updateProfile(payload: UpdateProfilePayload): Observable<{ success: boolean; user: AuthUser; message?: string }> {
    return this.http.patch<{ success: boolean; user: AuthUser; message?: string }>(
      `${this.apiUrl}/user/my-profile`,
      payload
    ).pipe(
      tap((response) => {
        if (response?.user) {
          this._user.set(response.user);
        }
      })
    );
  }

  changePassword(payload: ChangePasswordPayload): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(
      `${this.apiUrl}/auth/change-password`,
      payload
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