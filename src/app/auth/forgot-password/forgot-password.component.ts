import { Component } from "@angular/core";
import { NgForm } from "@angular/forms";

import { AuthService } from "../auth.service";

@Component({
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.css"]
})
export class ForgotPasswordComponent {
  isLoading = false;

  constructor(public authService: AuthService) {}

  onForgotPassword(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    const email = form.value.email; // Assuming you have an input field with ngModel="email"
    this.authService.forgotPassword(email).subscribe(
      () => {
        // Success
        console.log("Password reset email sent successfully.");
        // Optionally, you can show a success message or navigate to another page.
      },
      (error) => {
        // Error
        console.error("Failed to send password reset email:", error);
        // Optionally, you can display an error message to the user.
      }
    ).add(() => {
      this.isLoading = false; // Set isLoading back to false after the request is completed.
    });
  }

}
