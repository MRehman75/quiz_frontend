import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrl = `${environment.apiUrl}/quizzes`;

  constructor(private http: HttpClient) { }

  getAllQuizzes() {
    return this.http.get<any>(`${this.apiUrl}`);
  }

  getQuizById(id: string) {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createQuiz(quiz: any) {
    return this.http.post<any>(this.apiUrl, quiz);
  }

  updateQuiz(id: string, quiz: any) {
    return this.http.put<any>(`${this.apiUrl}/${id}`, quiz);
  }

  deleteQuiz(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getQuestions(quizId: string) {
    return this.http.get<any>(`${environment.apiUrl}/quizzes/${quizId}/questions`);
  }

  submitAttempt(quizId: string, answers: number[]) {
    return this.http.post<any>(`${environment.apiUrl}/quizzes/${quizId}/attempts`, { answers });
  }

  addQuestion(quizId: string, question: { text: string; options: string[]; answerIndex: number }) {
    return this.http.post<any>(`${environment.apiUrl}/quizzes/${quizId}/questions`, question);
  }

  getQuizAnalytics(quizId: string) {
    return this.http.get<any>(`${environment.apiUrl}/quizzes/${quizId}/analytics`);
  }

  submitPublicAttempt(quizId: string, email: string, answers: number[]) {
    return this.http.post<any>(`${environment.apiUrl}/quizzes/${quizId}/attempts`, { 
      answers, 
      email 
    });
  }

  deleteQuestion(questionId: string) {
    return this.http.delete(`${environment.apiUrl}/questions/${questionId}`);
  }
}
