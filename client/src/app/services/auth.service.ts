import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

interface User {
  token: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  public isLoggedIn$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const storedUser = localStorage.getItem('currentUser');
    const user = storedUser ? JSON.parse(storedUser) : null;
    this.currentUserSubject = new BehaviorSubject<User | null>(user);
    this.currentUser = this.currentUserSubject.asObservable();
    this.isLoggedIn$.next(!!(user && user.token));
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }


  login(email: string, password: string): Observable<User> {
    return this.http.post<{token: string}>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((response: { token: string }) => {
          const user: User = { token: response.token, email: email };
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          this.isLoggedIn$.next(true);
        })
      ) as Observable<User>;
  }

  register(name: string, email: string, password: string): Observable<User> {
    return this.http.post<{token: string}>(`${this.apiUrl}/register`, { name, email, password })
      .pipe(
        tap((response: { token: string }) => {
          const user: User = { token: response.token, email: email };
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          this.isLoggedIn$.next(true);
        })
      ) as Observable<User>;
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isLoggedIn$.next(false);
    this.router.navigate(['/login']);
  }

  get isLoggedIn(): boolean {
    const user = this.currentUserValue;
    return !!(user && user.token);
  }

  getToken() {
    const user = this.currentUserValue;
    return user?.token;
  }
}
