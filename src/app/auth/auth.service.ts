import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, Subject, catchError, map, of, tap, throwError } from "rxjs";


import { AuthData } from "./auth-data.model";


@Injectable({ providedIn: "root" })
export class AuthService {
  private isAuthenticated = false;
  private token: string;
  private tokenTimer: any;
  private authStatusListener = new Subject<boolean>();
  private errorListener = new Subject<string>();

  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getErrorListener() {
    return this.errorListener.asObservable();
  }

  async createUser(email: string, password: string, firstName: string, lastName: string) {
    const authData: AuthData = { email: email, password: password,  firstName: firstName, lastName: lastName };
    try {
      const response = await this.http
        .post("http://localhost:3000/api/user/signup", authData)
        .toPromise();

      console.log(response);
      this.router.navigate(["/login"]);
    } catch (error) {
      console.log(error);
      this.authStatusListener.next(false);
    }
  }

  async login(email: string, password: string) {
    const authData: AuthData = { email: email, password: password };
    try {
      const response = await this.http
        .post<{ token: string; expiresIn: number }>(
          "http://localhost:3000/api/user/login",
          authData
        )
        .toPromise();

      const token = response.token;
      this.token = token;

      if (token) {
        const expiresInDuration = response.expiresIn;
        this.setAuthTimer(expiresInDuration);
        this.isAuthenticated = true;
        this.authStatusListener.next(true);
        const now = new Date();
        const expirationDate = new Date(
          now.getTime() + expiresInDuration * 1000
        );
        console.log(expirationDate);
        this.saveAuthData(token, expirationDate);
        this.router.navigate(["/"]);
      }
    } catch (error) {
      this.authStatusListener.next(false);
        this.errorListener.next(error.error.message);
        return throwError(error);

    }
  }
  // Add the activation function
  activateAccount(userId: string) {
    this.http
      .post("http://localhost:3000/api/user/activate/" + userId, {})
      .subscribe(
        (response) => {
          console.log(response);
          this.router.navigate(["/login"]);
        },
        (error) => {
          console.log(error);
          // Optionally, you can redirect to an error page if the activation fails
        }
      );
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }


  forgotPassword(email: string): Observable<any> {
    return this.http.post("http://localhost:3000/api/user/forgot-password", { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post("http://localhost:3000/api/user/reset-password/" + token, { newPassword });
  }


  updateProfile(firstName: string, lastName: string, avatar: string): Observable<any> {
    const userId = this.getUserData().userId; // Assuming you have this function

    let profileData: any = { firstName: firstName, lastName: lastName, avatar: avatar };

    return this.http.patch("http://localhost:3000/api/user/update/" + userId, profileData).pipe(
      map((response: any) => {
        console.log(response);

      }),
      catchError((error: any) => {
        console.log(error);
        throw error;
      })
    );
  }




  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(["/"]);
  }

  getUserData(): any {
    const token = this.getToken();
    if (token) {
      const tokenPayload = token.split('.')[1];
      const decodedToken = JSON.parse(atob(tokenPayload));
      return decodedToken; // Assuming user data is stored in the JWT payload
    }
    return null;
  }

  getId(): any{
    const token = this.getToken();
    if (token) {
      const tokenPayload = token.split('.')[1];
      const decodedToken = JSON.parse(atob(tokenPayload));
      const userId = decodedToken.userId; // Assuming "userId" is the field name in the JWT payload
      return userId;    }
    return null;
  }

  async deleteAccount(userId: string) {
    try {
      await this.http
        .delete("http://localhost:3000/api/user/delete/" + userId)
        .toPromise();

      this.logout(); // Logout the user after deleting the account
    } catch (error) {
      console.log(error);
    }
  }

  getProfile(userId: string){
    return this.http.get("http://localhost:3000/api/user/" + userId);
  }

  private setAuthTimer(duration: number) {
    console.log("Setting timer: " + duration);
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date) {
    localStorage.setItem("token", token);
    localStorage.setItem("expiration", expirationDate.toISOString());
  }

  private clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("expiration");
  }

  private getAuthData() {
    const token = localStorage.getItem("token");
    const expirationDate = localStorage.getItem("expiration");
    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate)
    }
  }
}
