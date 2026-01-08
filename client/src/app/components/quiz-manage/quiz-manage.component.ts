import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { QuizService } from '../../services/quiz.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-quiz-manage',
  templateUrl: './quiz-manage.component.html',
  styleUrls: ['./quiz-manage.component.scss']
})
export class QuizManageComponent implements OnInit {
  quizForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  shareLink = '';
  validationErrors: string[] = [];
  quizId: string | null = null;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private quizService: QuizService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.quizForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.maxLength(300)]],
      questions: this.fb.array([this.createQuestionGroup()])
    });
  }

  ngOnInit() {
    this.quizId = this.route.snapshot.paramMap.get('id');
    if (this.quizId) {
      this.isEditMode = true;
      this.loadQuizForEdit();
    }
  }

  loadQuizForEdit() {
    this.quizService.getQuizById(this.quizId!).subscribe({
      next: (quiz) => {
        this.quizForm.patchValue({
          title: quiz.title,
          description: quiz.description || ''
        });
        this.loadQuestionsForEdit();
      },
      error: (error) => {
        console.error('Error loading quiz:', error);
        this.snackBar.open('Failed to load quiz', 'Dismiss', { duration: 3000 });
        this.router.navigate(['/quizzes']);
      }
    });
  }

  loadQuestionsForEdit() {
    this.quizService.getQuestions(this.quizId!).subscribe({
      next: (response: any) => {
        const questions = response.items || [];
        this.questions.clear();
        questions.forEach((q: any) => {
          const questionGroup = this.fb.group({
            text: [q.text, [Validators.required, Validators.minLength(3)]],
            options: this.fb.array(
              q.options.map((opt: string) => this.fb.control(opt, Validators.required))
            ),
            answerIndex: [q.answerIndex, [Validators.required, Validators.min(0), Validators.max(3)]],
            questionId: [q._id]
          });
          this.questions.push(questionGroup);
        });
      },
      error: (error) => {
        console.error('Error loading questions:', error);
      }
    });
  }

  get questions(): FormArray {
    return this.quizForm.get('questions') as FormArray;
  }

  createQuestionGroup(): FormGroup {
    return this.fb.group({
      text: ['', [Validators.required, Validators.minLength(3)]],
      options: this.fb.array([
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required)
      ]),
      answerIndex: [0, [Validators.required, Validators.min(0), Validators.max(3)]]
    });
  }

  addQuestion() {
    this.questions.push(this.createQuestionGroup());
  }

  removeQuestion(index: number) {
    if (this.questions.length > 1) {
      this.questions.removeAt(index);
    }
  }

  getOptionsArray(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('options') as FormArray;
  }

  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }

  copyLink() {
    if (!this.shareLink) return;
    navigator.clipboard?.writeText(this.shareLink).catch(() => {});
  }

  submit() {
    this.normalizeAndValidate();
    if (this.quizForm.invalid) {
      this.quizForm.markAllAsTouched();
      this.validationErrors = this.collectValidationErrors();
      this.snackBar.open('Please fix validation errors before submitting.', 'Dismiss', { duration: 2500 });
      return;
    }

    // Check if user is logged in
    if (!this.authService.isLoggedIn) {
      this.snackBar.open('You are not logged in. Please login first.', 'Dismiss', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }

    this.validationErrors = [];
    this.isSubmitting = true;
    this.errorMessage = '';
    this.shareLink = '';

    const { title, description, questions } = this.quizForm.value;
    
    console.log('Submitting quiz:', { title, description, questionsCount: questions.length });

    if (this.isEditMode && this.quizId) {
      this.updateQuiz();
    } else {
      this.createQuiz();
    }
  }

  createQuiz() {
    const { title, description, questions } = this.quizForm.value;
    this.quizService.createQuiz({ title, description }).subscribe({
      next: (resp: any) => {
        console.log('Quiz creation response:', resp);
        const quizId = resp.id || resp._id;
        if (!quizId) {
          console.error('No quiz ID in response:', resp);
          this.errorMessage = 'Quiz created but no ID returned. Please check the server response.';
          this.isSubmitting = false;
          this.snackBar.open(this.errorMessage, 'Dismiss', { duration: 3500 });
          return;
        }

        const questionRequests = questions.map((q: any) =>
          this.quizService.addQuestion(quizId, {
            text: q.text,
            options: q.options,
            answerIndex: Number(q.answerIndex)
          })
        );

        forkJoin(questionRequests).subscribe({
          next: () => {
            this.isSubmitting = false;
            const link = `${window.location.origin}/quiz/${quizId}`;
            this.router.navigate(['/quizzes'], {
              queryParams: { created: quizId, link }
            });
            this.snackBar.open('Quiz created successfully!', 'Dismiss', { duration: 2500 });
          },
          error: (err) => {
            console.error('Error adding questions:', err);
            this.errorMessage = 'Quiz created but adding questions failed. Please try editing.';
            this.isSubmitting = false;
            const errorMsg = err?.error?.message || 'Questions failed to save. Please edit and retry.';
            this.snackBar.open(errorMsg, 'Dismiss', { duration: 3500 });
          }
        });
      },
      error: (err) => {
        console.error('Error creating quiz:', err);
        console.error('Error status:', err.status);
        console.error('Error body:', err.error);
        
        let errorMsg = 'Failed to create quiz. Please try again.';
        
        if (err.status === 401) {
          errorMsg = 'You are not logged in. Please login and try again.';
        } else if (err.status === 400) {
          errorMsg = err?.error?.message || err?.error?.errors?.[0]?.msg || 'Validation error. Please check your input.';
        } else if (err.error?.message) {
          errorMsg = err.error.message;
        } else if (err.error?.errors && Array.isArray(err.error.errors)) {
          errorMsg = err.error.errors.map((e: any) => e.msg || e.message).join(', ');
        }
        
        this.errorMessage = errorMsg;
        this.isSubmitting = false;
        this.snackBar.open(errorMsg, 'Dismiss', { duration: 5000 });
      }
    });
  }

  updateQuiz() {
    if (!this.quizId) {
      return;
    }

    const { title, description, questions } = this.quizForm.value;

    // 1) Update basic quiz details
    this.quizService.updateQuiz(this.quizId, { title, description }).subscribe({
      next: () => {
        // 2) Load all existing questions for this quiz
        this.quizService.getQuestions(this.quizId!).subscribe({
          next: (response: any) => {
            const existingQuestions = response.items || [];

            // 3) Delete ALL existing questions (so removed ones are also deleted)
            const deleteRequests = existingQuestions.map((q: any) =>
              this.quizService.deleteQuestion(q._id)
            );

            const delete$ = deleteRequests.length ? forkJoin(deleteRequests) : forkJoin([]);

            delete$.subscribe({
              next: () => {
                // 4) Re-create questions from the current form state
                const addRequests = questions.map((q: any) =>
                  this.quizService.addQuestion(this.quizId!, {
                    text: q.text,
                    options: q.options,
                    answerIndex: Number(q.answerIndex)
                  })
                );

                if (!addRequests.length) {
                  // No questions left – still consider update successful
                  this.isSubmitting = false;
                  this.snackBar.open('Quiz updated successfully!', 'Dismiss', { duration: 2500 });
                  this.router.navigate(['/quizzes']);
                  return;
                }

                forkJoin(addRequests).subscribe({
                  next: () => {
                    this.isSubmitting = false;
                    this.snackBar.open('Quiz updated successfully!', 'Dismiss', { duration: 2500 });
                    this.router.navigate(['/quizzes']);
                  },
                  error: (err) => {
                    console.error('Error re-creating questions:', err);
                    this.isSubmitting = false;
                    this.snackBar.open('Quiz updated but questions failed to save.', 'Dismiss', {
                      duration: 3500
                    });
                  }
                });
              },
              error: (err) => {
                console.error('Error deleting existing questions:', err);
                this.isSubmitting = false;
                this.snackBar.open('Failed to update quiz questions.', 'Dismiss', { duration: 3500 });
              }
            });
          },
          error: (err) => {
            console.error('Error loading existing questions for update:', err);
            this.isSubmitting = false;
            this.snackBar.open('Failed to load quiz questions for update.', 'Dismiss', {
              duration: 3500
            });
          }
        });
      },
      error: (err) => {
        console.error('Error updating quiz:', err);
        this.isSubmitting = false;
        const errorMsg = err?.error?.message || 'Failed to update quiz. Please try again.';
        this.snackBar.open(errorMsg, 'Dismiss', { duration: 3500 });
      }
    });
  }

  goToList() {
    this.router.navigate(['/quizzes']);
  }

  private collectValidationErrors(): string[] {
    const errors: string[] = [];
    const titleCtrl = this.quizForm.get('title');
    const titleVal = (titleCtrl?.value || '').trim();
    if (!titleVal) {
      errors.push('Quiz title is required.');
    } else if (titleVal.length < 3) {
      errors.push('Quiz title must be at least 3 characters.');
    }

    this.questions.controls.forEach((qCtrl, idx) => {
      const qGroup = qCtrl as FormGroup;
      const qNum = idx + 1;
      const textCtrl = qGroup.get('text');
      const answerCtrl = qGroup.get('answerIndex');
      const options = qGroup.get('options') as FormArray;

      const textVal = (textCtrl?.value || '').trim();
      if (!textVal) {
        errors.push(`Question ${qNum}: text is required.`);
      } else if (textVal.length < 3) {
        errors.push(`Question ${qNum}: text must be at least 3 characters.`);
      }

      options.controls.forEach((optCtrl, optIdx) => {
        const optVal = optCtrl.value;
        const trimmedVal = typeof optVal === 'string' ? optVal.trim() : '';
        if (!trimmedVal || optCtrl.invalid) {
          errors.push(`Question ${qNum}: Option ${this.getOptionLabel(optIdx)} is required.`);
        }
      });

      if (answerCtrl?.invalid || answerCtrl?.value === null || answerCtrl?.value === undefined) {
        errors.push(`Question ${qNum}: select the correct answer.`);
      }
    });

    return errors;
  }

  /**
   * Trim values and re-apply validators so that filled inputs are recognized.
   */
  private normalizeAndValidate() {
    const titleCtrl = this.quizForm.get('title');
    if (titleCtrl) {
      const trimmed = (titleCtrl.value || '').trim();
      titleCtrl.setValue(trimmed, { emitEvent: false });
      titleCtrl.markAsTouched();
      titleCtrl.updateValueAndValidity();
    }

    this.questions.controls.forEach((qCtrl) => {
      const qGroup = qCtrl as FormGroup;
      
      // Trim and update question text
      const textCtrl = qGroup.get('text');
      if (textCtrl) {
        const trimmed = (textCtrl.value || '').trim();
        textCtrl.setValue(trimmed, { emitEvent: false });
        textCtrl.markAsTouched();
        textCtrl.updateValueAndValidity();
      }
      
      // Trim and update all options
      const options = qGroup.get('options') as FormArray;
      options.controls.forEach((optCtrl) => {
        const trimmed = (optCtrl.value || '').trim();
        optCtrl.setValue(trimmed, { emitEvent: false });
        optCtrl.markAsTouched();
        optCtrl.updateValueAndValidity();
      });
      
      // Update answer index
      const answerCtrl = qGroup.get('answerIndex');
      if (answerCtrl) {
        answerCtrl.markAsTouched();
        answerCtrl.updateValueAndValidity();
      }
      
      // Update the question group
      qGroup.updateValueAndValidity();
    });

    // Update the entire form
    this.quizForm.updateValueAndValidity();
  }
}

