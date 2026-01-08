import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QuizService } from '../../services/quiz.service';

@Component({
  selector: 'app-quiz-list',
  templateUrl: './quiz-list.component.html',
  styleUrls: ['./quiz-list.component.scss']
})
export class QuizListComponent implements OnInit {
  quizzes: any[] = [];
  loading: boolean = true;
  errorMessage: string = '';
  shareLink: string = '';

  constructor(
    private quizService: QuizService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const created = params['created'];
      const link = params['link'];
      if (created && link) {
        this.shareLink = link;
        this.snackBar.open('Quiz created successfully!', 'Dismiss', { duration: 3000 });
      } else {
        this.shareLink = '';
      }
    });
    this.loadQuizzes();
  }

  loadQuizzes() {
    this.loading = true;
    this.quizService.getAllQuizzes().subscribe({
      next: (response: any) => {
        this.quizzes = response.items || [];
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Failed to load quizzes. Please try again.';
        console.error('Error loading quizzes:', error);
      }
    });
  }

  startQuiz(quizId: string) {
    this.router.navigate(['/quiz', quizId]);
  }

  copyCreatedQuizLink() {
    if (!this.shareLink) return;
    navigator.clipboard?.writeText(this.shareLink).then(() => {
      this.snackBar.open('Share link copied', 'Dismiss', { duration: 2000 });
    }).catch(() => {
      this.snackBar.open('Could not copy link', 'Dismiss', { duration: 2000 });
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  editQuiz(quizId: string, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/quizzes', quizId, 'edit']);
  }

  deleteQuiz(quizId: string, event: Event) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      this.quizService.deleteQuiz(quizId).subscribe({
        next: () => {
          this.snackBar.open('Quiz deleted successfully', 'Dismiss', { duration: 2000 });
          this.loadQuizzes();
        },
        error: (error) => {
          console.error('Error deleting quiz:', error);
          this.snackBar.open('Failed to delete quiz', 'Dismiss', { duration: 2000 });
        }
      });
    }
  }

  viewDashboard(quizId: string, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/quizzes', quizId, 'dashboard']);
  }

  getShareLink(quizId: string): string {
    return `${window.location.origin}/quiz/${quizId}/public`;
  }

  copyShareLink(quizId: string, event: Event) {
    event.stopPropagation();
    const link = this.getShareLink(quizId);
    navigator.clipboard?.writeText(link).then(() => {
      this.snackBar.open('Share link copied!', 'Dismiss', { duration: 2000 });
    }).catch(() => {
      this.snackBar.open('Could not copy link', 'Dismiss', { duration: 2000 });
    });
  }
}

