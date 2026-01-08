import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuizService } from '../../services/quiz.service';

@Component({
  selector: 'app-quiz-dashboard',
  templateUrl: './quiz-dashboard.component.html',
  styleUrls: ['./quiz-dashboard.component.scss']
})
export class QuizDashboardComponent implements OnInit {
  quizId: string = '';
  quiz: any = null;
  analytics: any = null;
  loading: boolean = true;
  shareLink: string = '';

  constructor(
    private route: ActivatedRoute,
    private quizService: QuizService
  ) {}

  ngOnInit() {
    this.quizId = this.route.snapshot.paramMap.get('id') || '';
    if (this.quizId) {
      this.loadQuiz();
      this.loadAnalytics();
      this.shareLink = `${window.location.origin}/quiz/${this.quizId}/public`;
    }
  }

  loadQuiz() {
    this.quizService.getQuizById(this.quizId).subscribe({
      next: (quiz) => {
        this.quiz = quiz;
      },
      error: (error) => {
        console.error('Error loading quiz:', error);
      }
    });
  }

  loadAnalytics() {
    this.loading = true;
    this.quizService.getQuizAnalytics(this.quizId).subscribe({
      next: (data) => {
        this.analytics = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
        this.loading = false;
      }
    });
  }

  copyShareLink() {
    navigator.clipboard?.writeText(this.shareLink).then(() => {
      alert('Share link copied to clipboard!');
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getScoreClass(percentage: number): string {
    if (percentage >= 80) return 'excellent';
    if (percentage >= 60) return 'good';
    return 'poor';
  }
}

