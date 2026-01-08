import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { QuizListComponent } from './components/quiz-list/quiz-list.component';
import { QuizPlayComponent } from './components/quiz-play/quiz-play.component';
import { QuizResultsComponent } from './components/quiz-results/quiz-results.component';
import { QuizManageComponent } from './components/quiz-manage/quiz-manage.component';
import { QuizDashboardComponent } from './components/quiz-dashboard/quiz-dashboard.component';
import { QuizPublicComponent } from './components/quiz-public/quiz-public.component';
import { QuizPublicResultsComponent } from './components/quiz-public-results/quiz-public-results.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/quizzes', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'quizzes/new', component: QuizManageComponent, canActivate: [AuthGuard] },
  { path: 'quizzes/:id/edit', component: QuizManageComponent, canActivate: [AuthGuard] },
  { path: 'quizzes/:id/dashboard', component: QuizDashboardComponent, canActivate: [AuthGuard] },
  { path: 'quizzes', component: QuizListComponent, canActivate: [AuthGuard] },
  { path: 'quiz/:id', component: QuizPlayComponent, canActivate: [AuthGuard] },
  { path: 'quiz/:id/results', component: QuizResultsComponent, canActivate: [AuthGuard] },
  { path: 'quiz/:id/public', component: QuizPublicComponent },
  { path: 'quiz/:id/public/results', component: QuizPublicResultsComponent },
  { path: '**', redirectTo: '/quizzes' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
