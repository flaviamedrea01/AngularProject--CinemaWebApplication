import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { PostListComponent } from "./posts/post-list/post-list.component";
import { PostCreateComponent } from "./posts/post-create/post-create.component";
import { LoginComponent } from "./auth/login/login.component";
import { SignupComponent } from "./auth/signup/signup.component";
import { ScheduleComponent } from "./schedule/schedule.component";
import { SeatsComponent } from "./seats/seats/seats.component";
import { ActivationComponent } from './auth/activation/activation.component';
import { AuthGuard } from "./auth/auth.guard";
import { ProfileComponent } from "./auth/profile/profile.component";
import { ForgotPasswordComponent } from "./auth/forgot-password/forgot-password.component";
import { ResetPasswordComponent } from "./auth/reset-password/reset-password.component";
import { MyPostsComponent } from "./posts/my-posts/my-posts.component";

const routes: Routes = [
  { path: "", component: PostListComponent },
  { path: "create", component: PostCreateComponent, canActivate: [AuthGuard] },
  { path: "edit/:postId", component: PostCreateComponent, canActivate: [AuthGuard] },
  { path: "login", component: LoginComponent },
  { path: "signup", component: SignupComponent },
  { path: "forgot-password", component: ForgotPasswordComponent },
  { path: "reset-password/:token", component: ResetPasswordComponent },
  { path: "schedule", component: ScheduleComponent },
  { path: "seats", component: SeatsComponent },
  { path: 'activate/:userId', component: ActivationComponent },
  { path: "profile", component: ProfileComponent },
  { path: "my-posts", component: MyPostsComponent },



];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule {}
