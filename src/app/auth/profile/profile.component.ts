import { Component, OnInit } from "@angular/core";
import { AuthService } from "../auth.service";
import { FormControl, FormGroup, NgForm } from "@angular/forms";
import { catchError, of, switchMap, throwError } from "rxjs";
import { Router } from "@angular/router";
import { Avatar } from './avatar.model';



@Component({
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.css"],
})
export class ProfileComponent implements OnInit {

  user: any;
  profileInfo: any;
  fName: any;
  lName: any;
  avatar: any;
  firstName: any;
  lastName: any;
  fileName: any;
  currentAvatar: any;
  checked: boolean = false;

  constructor(private router: Router,
    private authService: AuthService) {}

  profileForm: FormGroup;

  ngOnInit(): void {


    try {
      this.user = this.authService.getUserData();
      const userId = this.authService.getId();

      this.authService.getProfile(userId).subscribe(
        (data) => {
          this.profileInfo = data; // Save the data to the component property
          if ( this.profileInfo.firstName ) {
            this.fName = this.profileInfo.firstName;
          }
          else {
            this.fName = 'No Name';
          }

          if ( this.profileInfo.lastName ) {
            this.lName = this.profileInfo.lastName;
          }
          else{
            this.lName = 'No Name';

          }

          if ( this.profileInfo.avatar ) {
            this.currentAvatar = this.profileInfo.avatar;
          }
          else{
            this.currentAvatar = 'default.jpg';
          }

        },
        (error) => {
          console.error('Error fetching profile:', error);
        }
      );


    } catch (error) {
      console.error('Error fetching profile:', error);
    }

    this.profileForm = new FormGroup({
      firstName: new FormControl(null),
      lastName: new FormControl(null),
      avatar: new FormControl(null),

  });


}



avatars: Avatar[] = [
  { id: 1, filename: 'girl1.png', checked: false },
  { id: 2, filename: 'girl2.png', checked: false },
  { id: 3, filename: 'boy1.jpg', checked: false },
  { id: 4, filename: 'boy2.png', checked: false },

];

selectedAvatarFile(): void {
  this.profileForm.patchValue({ avatar: this.profileForm.value.avatar });

  this.avatars.forEach(avatar => {
   if ( avatar === this.profileForm.value.avatar ) {
    avatar.checked = true;
    console.log(avatar.checked);

   }
  });




}



onUpdateProfile(profileForm): void {
  if (profileForm.invalid) {
    return;
  }

  if (profileForm.value.firstName){
    this.firstName = profileForm.value.firstName;
  }

  if (profileForm.value.lastName){
    this.lastName = profileForm.value.lastName;
  }
  if (profileForm.value.avatar){
    this.avatar = profileForm.value.avatar;
  }


  this.authService.updateProfile(this.firstName, this.lastName, this.avatar)
  .pipe(
    switchMap(response => {
      console.log('Profile updated successfully:', response);
      return this.router.navigate(['/']);
    }),
    catchError(error => {
      console.error('Error updating profile:', error);
      // Handle error response here
      return throwError(error); // Rethrow the error
    })
  )
  .subscribe();

  this.profileForm.reset();
}

onLogout() {
  this.authService.logout();
}

onDeleteAccount() {
  const userId = this.user.userId;
  if (confirm('Are you sure you want to delete your account? This action is irreversible.')) {
    this.authService.deleteAccount(userId);
}
}

}
