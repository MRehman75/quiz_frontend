import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-quiz-results',
  templateUrl: './quiz-results.component.html',
  styleUrls: ['./quiz-results.component.scss']
})
export class QuizResultsComponent implements OnInit {
  total: number = 0;
  correct: number = 0;
  score: number = 0;
  quizId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.quizId = this.route.snapshot.paramMap.get('id') || '';
    this.route.queryParams.subscribe(params => {
      this.total = +params['total'] || 0;
      this.correct = +params['correct'] || 0;
      this.score = +params['score'] || 0;
    });
  }

  getScoreColor(): string {
    if (this.score >= 80) return 'primary';
    if (this.score >= 60) return 'accent';
    return 'warn';
  }

  getScoreMessage(): string {
    if (this.score >= 90) return 'Excellent! Outstanding performance!';
    if (this.score >= 80) return 'Great job! Well done!';
    if (this.score >= 70) return 'Good work! Keep it up!';
    if (this.score >= 60) return 'Not bad! Practice more!';
    return 'Keep practicing! You can do better!';
  }

  goToQuizzes() {
    this.router.navigate(['/quizzes']);
  }

  retakeQuiz() {
    this.router.navigate(['/quiz', this.quizId]);
  }
}

