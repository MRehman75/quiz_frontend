// quiz-create.component.ts
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { QuizService } from '../../services/quiz.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quiz-create',
  templateUrl: './quiz-create.component.html',
  styleUrls: ['./quiz-create.component.css']
})
export class QuizCreateComponent {
  quizForm: FormGroup;
  submitted = false;
  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private quizService: QuizService,
    private router: Router
  ) {
    this.quizForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      questions: this.formBuilder.array([this.createQuestion()])
    });
  }

  get questions() {
    return this.quizForm.get('questions') as FormArray;
  }

  createQuestion(): FormGroup {
    return this.formBuilder.group({
      text: ['', [Validators.required, Validators.minLength(5)]],
      options: this.formBuilder.array([
        this.createOption('A'),
        this.createOption('B'),
        this.createOption('C'),
        this.createOption('D')
      ], { validators: this.atLeastOneOptionRequired() }),
      correctAnswer: ['', Validators.required]
    });
  }

  private atLeastOneOptionRequired(): ValidatorFn {
    return (formArray: AbstractControl): ValidationErrors | null => {
      const options = formArray as FormArray;
      const hasValue = options.controls.some(control => {
        return control.get('text')?.value?.trim() !== '';
      });
      return hasValue ? null : { atLeastOneOptionRequired: true };
    };
  }

  createOption(optionLabel: string) {
    return this.formBuilder.group({
      label: [optionLabel],
      text: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  addQuestion() {
    this.questions.push(this.createQuestion());
  }

  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

  onSubmit() {
    this.submitted = true;
    
    if (this.quizForm.invalid) {
      this.markFormGroupTouched(this.quizForm);
      return;
    }

    this.loading = true;
    
    const formData = {
      ...this.quizForm.value,
      questions: this.quizForm.value.questions.map((q: any) => ({
        text: q.text,
        options: q.options
          .filter((opt: any) => opt.text?.trim() !== '')
          .map((opt: any) => opt.text),
        correctAnswer: q.correctAnswer
      }))
    };

    this.quizService.createQuiz(formData).subscribe({
      next: () => {
        this.router.navigate(['/quizzes']);
      },
      error: (error) => {
        console.error('Error creating quiz', error);
        this.loading = false;
      }
    });
  }

  onCancel() {
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      this.router.navigate(['/quizzes']);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }
}