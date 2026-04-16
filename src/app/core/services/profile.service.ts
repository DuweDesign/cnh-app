import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environments';
import { MyProfile } from '../models/profile.model';

@Injectable({
    providedIn: 'root'
})
export class ProfileService {
    private http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/v1/cnh`;

    getMyProfile(): Observable<MyProfile> {
        return this.http
            .get<{ user: MyProfile }>(`${this.apiUrl}/user/my-profile`)
            .pipe(map((response) => response.user));
    }
}