import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrl = `${environment.apiUrl}/quizzes`;

  constructor(private http: HttpClient) {}

  createQuiz(quizData: any): Observable<any> {
    return this.http.post(this.apiUrl, quizData);
  }

  getQuizzes(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getQuiz(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
}
