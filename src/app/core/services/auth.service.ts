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

import { MOCK_USERS } from '../mock/users.mock';

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

    const { dealernumber, email, password } = payload;

    const user = MOCK_USERS.find(
      u => u.dealernumber === dealernumber && u.email === email && u.password === password
    );

    if (!user) {
      return of({
        success: false,
        message: 'Ungültige Zugangsdaten',
        token: '',
        user: null as any
      });
    }

    const mockToken = 'mock-jwt-token';

    const response: LoginResponse = {
      success: true,
      message: 'Login erfolgreich',
      token: mockToken,
      user
    };

    this.setToken(mockToken);
    localStorage.setItem('user', JSON.stringify(user));
    this._user.set(user);

    return of(response);

    // return this.http.post<LoginResponse>(`${this.apiUrl}/login`, payload).pipe(
    //   tap((response) => {
    //     this.setToken(response.token);
    //     this._user.set(response.user);
    //   })
    // );
  }

  logout(): void {
    this.removeToken();
    localStorage.removeItem('user');
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

  isAdmin(): boolean {
    const userRole = this._user()?.role ?? null;

    if ((userRole && userRole === 'sysadmin') || (userRole && userRole === 'vipp-admin') || (userRole && userRole === 'cnh-admin')) {
      return true;
    }

    return false;
  }

  canSelectCompetition(): boolean {
    const user = this._user();
    return !!user && this.isAdmin() && user.competition === null;
  }

  initializeAuth(): Observable<AuthUser | null> {
    const token = this.getToken();
    const storedUser = localStorage.getItem('user');

    // Kein Token oder kein User → ausgeloggt
    if (!token || !storedUser) {
      this._user.set(null);
      this._initialized.set(true);
      return of(null);
    }

    try {
      const user: AuthUser = JSON.parse(storedUser);

      this._user.set(user);
      this._initialized.set(true);

      return of(user);
    } catch (error) {
      // Falls JSON kaputt ist → cleanup
      this.removeToken();
      localStorage.removeItem('user');

      this._user.set(null);
      this._initialized.set(true);

      return of(null);
    }

    // 🔁 SPÄTER: API-Version
    /*
    return this.http.get<AuthUser>(`${this.apiUrl}/me`).pipe(
      tap((user) => {
        this._user.set(user);
        this._initialized.set(true);
      }),
      catchError(() => {
        this.removeToken();
        localStorage.removeItem('user');
  
        this._user.set(null);
        this._initialized.set(true);
  
        return of(null);
      })
    );
    */
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