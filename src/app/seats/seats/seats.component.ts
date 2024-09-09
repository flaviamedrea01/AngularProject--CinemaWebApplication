import { Component, HostListener, OnInit } from '@angular/core';
import { SeatsService } from '../seats.service';
import { Seat } from '../seat.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PDFDocument } from 'pdf-lib';





interface S {
  name: string;
  booked: boolean;
}


@Component({
  selector: 'app-seats',
  templateUrl: './seats.component.html',
  styleUrls: ['./seats.component.css']
})
export class SeatsComponent implements OnInit {

  [x: string]: any;

  constructor(
    public seatsService: SeatsService,
    public route: ActivatedRoute,
  ) {}

  bookingForm: FormGroup;
  isLoading = false;
  private mode = 'create';

  selectedMovie: string;
  selectedDate: string;
  dates: string[];



  movieList = [
    { name: 'The Garfield Movie', value: 'The Garfield Movie' },
    { name: 'The Bikeriders', value: 'The Bikeriders' },
    { name: 'A Quiet Place: Day One', value: 'A Quiet Place: Day One' },
    { name: 'Mothers` Instinct', value: 'Mothers` Instinct' },
    { name: 'Inside Out 2', value: 'Inside Out 2' }
  ];

  dateListgarfield = [
    { date: 'Friday, 6:00pm', value: 'f6' },
    { date: 'Friday, 9:00pm', value: 'f9' },
    { date: 'Saturday, 6:30pm', value: 'sat63' },
    { date: 'Saturday, 8:00pm', value: 'sat8' }
  ];

  dateListbike = [
    { date: 'Tuesday, 5:30pm', value: 'tue53' },
    { date: 'Friday, 8:00pm', value: 'f8' },
    { date: 'Friday, 10:00pm', value: 'f10' },
    { date: 'Saturday, 4:30pm', value: 'sat43' },
    { date: 'Saturday, 7:00pm', value: 'sat7' }
  ];

  dateListquiet = [
    { date: 'Friday, 4:00pm', value: 'f4' },
    { date: 'Friday, 6:00pm', value: 'f6' },
    { date: 'Saturday, 5:30pm', value: 'sat53' },
    { date: 'Sunday, 3:00pm', value: 'sun3' },
    { date: 'Sunday, 5:00pm', value: 'sun5' }
  ];

  dateListmother = [
    { date: 'Monday, 7:30pm', value: 'm73' },
    { date: 'Monday, 9:00pm', value: 'm9' },
    { date: 'Wednesday, 5:30pm', value: 'w53' },
    { date: 'Thursday, 6:00pm', value: 'thu6' },
    { date: 'Thursday, 9:00pm', value: 'thu9' }
  ];

  dateListinsideout = [
    { date: 'Tuesday, 7:00pm', value: 'tue7' },
    { date: 'Thursday 5:00pm', value: 'thu5' },
    { date: 'Thursday 8:30pm', value: 'thu83' }
  ];

  getDatesForMovie() {
    switch (this.selectedMovie) {
      case 'The Garfield Movie':
        this.dates = this.dateListgarfield.map(item => item.date);
        break;
      case 'The Bikeriders':
        this.dates = this.dateListbike.map(item => item.date);
        break;
      case 'A Quiet Place: Day One':
        this.dates = this.dateListquiet.map(item => item.date);
        break;
      case 'Mothers` Instinct':
        this.dates = this.dateListmother.map(item => item.date);
        break;
      case 'Inside Out 2':
        this.dates = this.dateListinsideout.map(item => item.date);
        break;
      default:
        this.dates = [];
        break;
    }
  }

  rows: { seats: S[] }[] = [
    {
      seats: [
        { name: 'A1', booked: false },
        { name: 'A2', booked: false },
        { name: 'A3', booked: false },
        { name: 'A4', booked: false },
        { name: 'A5', booked: false },
        { name: 'A6', booked: false },
        { name: 'A7', booked: false },
        { name: 'A8', booked: false }
      ]
    },
    {
      seats: [
        { name: 'B1', booked: false },
        { name: 'B2', booked: false },
        { name: 'B3', booked: false },
        { name: 'B4', booked: false },
        { name: 'B5', booked: false },
        { name: 'B6', booked: false },
        { name: 'B7', booked: false },
        { name: 'B8', booked: false }
      ]
    },
    {
      seats: [
        { name: 'C1', booked: false },
        { name: 'C2', booked: false },
        { name: 'C3', booked: false },
        { name: 'C4', booked: false },
        { name: 'C5', booked: false },
        { name: 'C6', booked: false },
        { name: 'C7', booked: false },
        { name: 'C8', booked: false }
      ]
    },
    {
      seats: [
        { name: 'D1', booked: false },
        { name: 'D2', booked: false },
        { name: 'D3', booked: false },
        { name: 'D4', booked: false },
        { name: 'D5', booked: false },
        { name: 'D6', booked: false },
        { name: 'D7', booked: false },
        { name: 'D8', booked: false }
      ]
    },
    {
      seats: [
        { name: 'E1', booked: false },
        { name: 'E2', booked: false },
        { name: 'E3', booked: false },
        { name: 'E4', booked: false },
        { name: 'E5', booked: false },
        { name: 'E6', booked: false },
        { name: 'E7', booked: false },
        { name: 'E8', booked: false }
      ]
    },
    {
      seats: [
        { name: 'F1', booked: false },
        { name: 'F2', booked: false },
        { name: 'F3', booked: false },
        { name: 'F4', booked: false },
        { name: 'F5', booked: false },
        { name: 'F6', booked: false },
        { name: 'F7', booked: false },
        { name: 'F8', booked: false }
      ]
    }
  ];

  seatNumbers = this.rows.flatMap(row => row.seats.map(seat => seat.name));

  async ngOnInit(): Promise<void> {
    this.bookingForm = new FormGroup({
      name: new FormControl(null, { validators: [Validators.required, Validators.pattern(/^(?:[A-Z][a-zA-Z]+)(?:\s[A-Z][a-zA-Z]+)+$/)] }),
      movie: new FormControl(null, { validators: [Validators.required] }),
      date: new FormControl(null, { validators: [Validators.required] }),
      seatNumber: new FormControl(null, { validators: [Validators.required] }),
      email: new FormControl(null, { validators: [Validators.required, Validators.pattern(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)    ] })
    });

  }


  getCinemaSeats() {
    if (this.selectedDate) {
      this.seatsService.getSeats(this.selectedDate).subscribe((bookings) => {
        this.updateBookedSeats(bookings);
      });
    }
  }


  updateBookedSeats(bookings: Seat[]): void {
    this.rows.forEach(row => {
      row.seats.forEach(seat => {
        const isBooked = bookings.some(booking => booking.seatNumber === seat.name);
        seat.booked = isBooked;
      });
    });
  }


  selectedSeats: S[] = [];

onSeatButtonClick(seat: S) {
  if (!seat.booked) {
    // Check if the seat is already selected
    const index = this.selectedSeats.findIndex(selectedSeat => selectedSeat.name === seat.name);

    if (index === -1) {
      // Seat is not yet selected, add it to the selectedSeats array
      this.selectedSeats.push(seat);
    } else {
      // Seat is already selected, remove it from the selectedSeats array
      this.selectedSeats.splice(index, 1);
    }

    // Update the seatNumber form control with selected seat names
    this.bookingForm.get('seatNumber').setValue(this.selectedSeats.map(selectedSeat => selectedSeat.name).join(', '));

  }
}


isSeatClicked(seatName: string): boolean {
  return this.selectedSeats.some(selectedSeat => selectedSeat.name === seatName);
}


async onSaveBooking() {
  if (this.bookingForm.invalid || this.selectedSeats.length === 0) {
    return;
  }
  this.isLoading = true;


  const selectedSeatNumbers = this.selectedSeats.map(selectedSeat => selectedSeat.name);
  for (const seatNumber of selectedSeatNumbers) {
    this.seatsService.addBooking(
      this.bookingForm.value.name,
      this.bookingForm.value.movie,
      this.bookingForm.value.date,
      seatNumber,
      this.bookingForm.value.email
    );
  }


const bookingData = this.bookingForm.value;
  this.seatsService.sendEmail(bookingData.email, bookingData.movie, bookingData.date, selectedSeatNumbers);


    // Clear selected seats and reset the form
    this.selectedSeats = [];
    this.bookingForm.reset();

}



}
