import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-quiz-public-results',
  templateUrl: './quiz-public-results.component.html',
  styleUrls: ['./quiz-public-results.component.scss']
})
export class QuizPublicResultsComponent implements OnInit {
  total: number = 0;
  correct: number = 0;
  score: number = 0;
  email: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.total = +params['total'] || 0;
      this.correct = +params['correct'] || 0;
      this.score = +params['score'] || 0;
      this.email = params['email'] || '';
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
}

