const mongoose = require('mongoose');

const seatSchema = mongoose.Schema({
  name: { type: String, required: true },
  movie: { type: String, required: true },
  date: { type: String, required: true },
  seatNumber: { type: String, required: true },
  email: { type: String, required: true },
});
module.exports = mongoose.model('Seat', seatSchema);
