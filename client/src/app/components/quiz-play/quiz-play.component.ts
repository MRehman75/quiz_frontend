import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from '../../services/quiz.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-quiz-play',
  templateUrl: './quiz-play.component.html',
  styleUrls: ['./quiz-play.component.scss']
})
export class QuizPlayComponent implements OnInit, OnDestroy {
  quizId: string = '';
  quiz: any = null;
  questions: any[] = [];
  currentQuestionIndex: number = 0;
  selectedAnswers: number[] = [];
  timeRemaining: number = 600; // 10 minutes in seconds
  timerSubscription?: Subscription;
  loading: boolean = true;
  errorMessage: string = '';
  submitted: boolean = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private quizService: QuizService
  ) {}

  ngOnInit() {
    this.quizId = this.route.snapshot.paramMap.get('id') || '';
    if (this.quizId) {
      this.loadQuiz();
      this.startTimer();
    }
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  loadQuiz() {
    this.loading = true;
    this.quizService.getQuizById(this.quizId).subscribe({
      next: (quiz) => {
        this.quiz = quiz;
        this.loadQuestions();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Failed to load quiz. Please try again.';
        console.error('Error loading quiz:', error);
      }
    });
  }

  loadQuestions() {
    this.quizService.getQuestions(this.quizId).subscribe({
      next: (response: any) => {
        this.questions = response.items || [];
        this.selectedAnswers = new Array(this.questions.length).fill(-1);
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Failed to load questions. Please try again.';
        console.error('Error loading questions:', error);
      }
    });
  }

  startTimer() {
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.timeRemaining > 0 && !this.submitted) {
        this.timeRemaining--;
      } else if (this.timeRemaining === 0 && !this.submitted) {
        this.submitQuiz();
      }
    });
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  selectAnswer(optionIndex: number) {
    if (!this.submitted) {
      this.selectedAnswers[this.currentQuestionIndex] = optionIndex;
    }
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  goToQuestion(index: number) {
    this.currentQuestionIndex = index;
  }

  submitQuiz() {
    if (this.submitted) return;

    const unanswered = this.selectedAnswers.filter((ans, idx) => ans === -1).length;
    if (unanswered > 0) {
      if (!confirm(`You have ${unanswered} unanswered question(s). Are you sure you want to submit?`)) {
        return;
      }
    }

    this.submitted = true;
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }

    this.quizService.submitAttempt(this.quizId, this.selectedAnswers).subscribe({
      next: (result: any) => {
        this.router.navigate(['/quiz', this.quizId, 'results'], {
          queryParams: {
            total: result.total,
            correct: result.correct,
            score: Math.round((result.correct / result.total) * 100)
          }
        });
      },
      error: (error) => {
        this.errorMessage = 'Failed to submit quiz. Please try again.';
        console.error('Error submitting quiz:', error);
        this.submitted = false;
      }
    });
  }

  getProgress(): number {
    return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
  }

  isAnswered(questionIndex: number): boolean {
    return this.selectedAnswers[questionIndex] !== -1;
  }

  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }
}

