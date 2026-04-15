import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, throwError, map } from 'rxjs';

import {
  AuthUser,
  LoginPayload,
  LoginResponse,
  ForgotPasswordPayload,
  RegisterRequestPayload,
  SetPasswordPayload,
  UserRole,
} from '../models/auth.model';

import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly apiUrl = `${environment.apiUrl}/v1/cnh`;
  private readonly tokenKey = 'cnh_token';

  private readonly _user = signal<AuthUser | null>(null);
  private readonly _initialized = signal(false);

  readonly user = this._user.asReadonly();
  readonly initialized = this._initialized.asReadonly();
  readonly isAuthenticated = computed(() => !!this._user());

  constructor() {
    this.initializeAuth().subscribe();
  }

  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, payload).pipe(
      tap((response) => {

        if (response.token) {
          this.setToken(response.token);
        }

        if (response.user) {
          this._user.set(response.user);
        }
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  logout(redirect = true): void {
    this.removeToken();
    this._user.set(null);

    if (redirect) {
      this.router.navigate(['/login']);
    }
  }

  isLoggedIn(): boolean {
    return !!this._user() || !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): AuthUser | null {
    return this._user();
  }

  getUserRole(): UserRole | null {
    return this._user()?.role ?? null;
  }

  hasRole(role: UserRole): boolean {
    return this._user()?.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const userRole = this._user()?.role;
    return !!userRole && roles.includes(userRole);
  }

  isAdmin(): boolean {
    const userRole = this._user()?.role ?? null;
    return userRole === 'sysadmin' || userRole === 'vipp-admin' || userRole === 'cnh-admin';
  }

  canSelectCompetition(): boolean {
    const user = this._user();
    return !!user && this.isAdmin() && user.competition === null;
  }

  initializeAuth(): Observable<AuthUser | null> {
    const token = this.getToken();

    if (!token) {
      this._user.set(null);
      this._initialized.set(true);
      return of(null);
    }

    return this.http.get<{ user: AuthUser }>(`${this.apiUrl}/auth/me`).pipe(
      map((response) => response.user),
      tap((user) => {
        this._user.set(user);
        this._initialized.set(true);
      }),
      catchError(() => {
        this.removeToken();
        this._user.set(null);
        this._initialized.set(true);
        return of(null);
      })
    );
  }

  requestRegistration(payload: RegisterRequestPayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/auth/register-request`,
      payload
    );
  }

  validateRegistrationToken(token: string): Observable<{ valid: boolean; message: string }> {
    return this.http.get<{ valid: boolean; message: string }>(
      `${this.apiUrl}/auth/register-token/validate`,
      {
        params: { token }
      }
    );
  }

  setPassword(payload: SetPasswordPayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/auth/register-password`,
      payload
    );
  }

  forgotPassword(payload: ForgotPasswordPayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/auth/forgot-password`,
      payload
    );
  }

  fetchProfile(): Observable<AuthUser> {
    return this.http.get<{ user: AuthUser }>(`${this.apiUrl}/auth/me`).pipe(
      map((response) => response.user),
      tap((user) => this._user.set(user))
    );
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }
}