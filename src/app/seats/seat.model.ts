export interface Seat {
  name: string;
  movie: string;
  date: string;
  seatNumber: string | string[];
  email: string;
  booked: true | boolean[];
}
