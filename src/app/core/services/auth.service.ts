import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import {
  AuthUser,
  LoginPayload,
  LoginResponse,
  ForgotPasswordPayload,
  RegisterRequestPayload,
  SetPasswordPayload,
  UserRole
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  private readonly apiUrl = 'https://api.deinedomain.de/api/auth';
  private readonly tokenKey = 'cnh_token';

  private readonly _user = signal<AuthUser | null>(null);
  private readonly _initialized = signal(false);

  readonly user = this._user.asReadonly();
  readonly initialized = this._initialized.asReadonly();
  readonly isAuthenticated = computed(() => !!this.getToken());

  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap((response) => {
        this.setToken(response.token);
        this._user.set(response.user);
      })
    );
  }

  logout(): void {
    this.removeToken();
    this._user.set(null);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
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

  initializeAuth(): Observable<AuthUser | null> {
    const token = this.getToken();

    if (!token) {
      this._user.set(null);
      this._initialized.set(true);
      return of(null);
    }

    return this.http.get<AuthUser>(`${this.apiUrl}/me`).pipe(
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
    return this.http.post<{ message: string }>(`${this.apiUrl}/register`, payload);
  }

  forgotPassword(payload: ForgotPasswordPayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/forgot-password`, payload);
  }

  setPassword(payload: SetPasswordPayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/set-password`, payload);
  }

  fetchProfile(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.apiUrl}/me`).pipe(
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