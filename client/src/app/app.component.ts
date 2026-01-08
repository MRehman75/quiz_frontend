import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { AuthService } from './services/auth.service';
import { trigger, transition, style, animate, query, group } from '@angular/animations';
import { filter } from 'rxjs/operators';

export const routeTransitionAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        opacity: 0
      })
    ], { optional: true }),
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(10px)' })
    ], { optional: true }),
    group([
      query(':leave', [
        animate('200ms ease-out', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ], { optional: true }),
      query(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms 100ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ], { optional: true })
    ])
  ])
]);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [routeTransitionAnimations]
})
export class AppComponent implements OnInit {
  title = 'Quiz App';
  isLoggedIn = false;
  loading = true;
  currentYear = new Date().getFullYear();

  constructor(public authService: AuthService, private router: Router) {
    // Subscribe to authentication state changes
    this.authService.isLoggedIn$.subscribe((isLoggedIn: boolean) => {
      this.isLoggedIn = isLoggedIn;
      this.loading = false;
    });
  }

  ngOnInit() {
    // Handle page scroll position on route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Smooth scroll to top on route change
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      // Add fade-in animation to the main content
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.classList.add('fade-in');
      }
    });
  }

  logout(): void {
    this.loading = true;
    this.authService.logout();
    // No need to navigate here as the AuthService handles it
    this.loading = false;
  }

  navigateToQuizzes(): void {
    this.router.navigate(['/quizzes']);
  }

  // Animation callback for route changes
  prepareRoute(outlet: any): string {
    return outlet?.activatedRouteData?.['animation'] || 'none';
  }
}
