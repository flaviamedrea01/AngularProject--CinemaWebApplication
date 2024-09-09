import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, Subject, catchError, map, throwError } from "rxjs";


import { Seat } from "./seat.model";
import { IntegerType } from "mongodb";



@Injectable({ providedIn: "root" })
export class SeatsService {


 constructor(private http: HttpClient, private router: Router) {

 }


 addBooking(name: string, movie: string, date: string, seatNumber: string | string[], email: string) {
  const seatData:  Seat = { name: name, movie: movie, date: date, seatNumber: seatNumber, email: email, booked: true };

  this.http.post<{ message: string; post: Seat }>(
      "http://localhost:3000/api/seats/seats",
      seatData).subscribe(responseData => {
        this.router.navigate(["/"]);
      });

}


getSeats(date: string): Observable<Seat[]> {
  return this.http.get<Seat[]>( "http://localhost:3000/api/seats/seats").pipe(
    map(seats => seats.filter(seat => seat.date === date))
  );
}

sendEmail(toEmail: string, movie: string, date: string, selectedSeatNumbers: string[]) {
  const payload = { toEmail: toEmail, movie: movie, date: date, selectedSeatNumbers: selectedSeatNumbers };


  this.http.post('http://localhost:3000/api/seats/send-email', payload).subscribe(responseData => {
    this.router.navigate(["/"]);
  });
}

}
