import { Component } from "@angular/core";
import { NgForm } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "../auth.service";

@Component({
  templateUrl: "./reset-password.component.html",
  styleUrls: ["./reset-password.component.css"]
})
export class ResetPasswordComponent {
  isLoading = false;
  resetToken: string;

  constructor(
    public authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.resetToken = params['token'];
    });
  }

  onResetPassword(form: NgForm) {
    if (form.invalid) {
      return;
    }
    const newPassword = form.value.password;
    this.isLoading = true;
    this.authService.resetPassword(this.resetToken, newPassword).subscribe(
      () => {
        // Success
        console.log("Password reset successfully.");
        // Optionally, you can show a success message or navigate to another page.
      },
      (error) => {
        // Error
        console.error("Failed to reset password:", error);
        // Optionally, you can display an error message to the user.
      }
    ).add(() => {
      this.isLoading = false; // Set isLoading back to false after the request is completed.
    });
  }
}
