const express = require('express');
const { PDFDocument, rgb } = require('pdf-lib', 'pdfkit');
const qrcode = require('qrcode');
const nodemailer = require('nodemailer');
const router = express.Router();
const fs = require('fs').promises;

const Seat = require('../models/seat');

async function generateQRCodeImage(data) {
  const qrCodeOptions = {
      type: 'png',
      quality: 1,
      margin: 1,
      color: {
          dark: '#000000', // Color of the QR code's dark modules (black)
          light: '#ffffff00', // Transparent white (RGBA with alpha = 0)
      },
  };

  const qrCodeImageBuffer = await qrcode.toBuffer(data, qrCodeOptions);
  return qrCodeImageBuffer;
}

router.post('/send-email', async (req, res) => {
  try {
    const { toEmail, movie, date, selectedSeatNumbers} = req.body;

        // Create a nodemailer transporter
        const transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: "flaviamedrea000@gmail.com",
            pass: "jjxcrdslltxhydxd",
          },
        });


    // Create a PDF
  const pdfDoc = await PDFDocument.create();


  for (const seat of selectedSeatNumbers) {
  const page = pdfDoc.addPage([400, 200]);
  const { width, height } = page.getSize();

  const imagePath = 'src/assets/img/opacity-popcorn.png';
  const imageBuffer = await fs.readFile(imagePath);
  const backgroundImage = await pdfDoc.embedPng(imageBuffer);
// Draw the background image
page.drawImage(backgroundImage, {
    x: 0,
    y: 0,
    width: width,
    height: height,
});



  // Draw "Cinema Ticket" heading
  page.drawText('Cinema Ticket', { x: 20, y: height - 30, size: 16 });

  // Draw line separator
  page.drawLine({
    start: { x: 20, y: height - 35 },
    end: { x: width - 20, y: height - 35 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  // Add movie details
  page.drawText(`Movie: ${movie}`, { x: 20, y: height - 60, size: 12 });
  page.drawText(`Date: ${date}`, { x: 20, y: height - 80, size: 12 });
  page.drawText(`Seat: ${seat}`, { x: 20, y: height - 100, size: 12 });

  // Draw line separator
  page.drawLine({
    start: { x: 20, y: height - 110 },
    end: { x: width - 20, y: height - 110 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  // Add purchase date & time
  const purchaseDateTime = new Date().toLocaleString();
  page.drawText(`Purchase Date & Time: ${purchaseDateTime}`, { x: 20, y: height - 130, size: 10 });

  const encodedTicketInfo = `Seat: ${seat}\nMovie: ${movie}\nDate: ${date}`;


  const qrCodeImageBuffer = await generateQRCodeImage(encodedTicketInfo);



// Embed the QR code image into the PDF
const qrCodeImage = await pdfDoc.embedPng(qrCodeImageBuffer);

// Draw the embedded image on the page
const qrCodeSize = 70;
page.drawImage(qrCodeImage, {
  x: width - qrCodeSize - 17,
  y: height - qrCodeSize - 115,
  width: qrCodeSize,
  height: qrCodeSize,
});

  const borderWidth = 2;
  const borderPatternLength = 3; // Adjust this to control the density of the dots
  const startX = 20;
  const endX = width - qrCodeSize - 20;
  const borderY = 18;
  const borderWidthWithPattern = borderPatternLength + borderWidth;

  for (let i = startX; i <= endX; i += borderWidthWithPattern) {
    page.drawLine({
        start: { x: i, y: borderY },
        end: { x: i + borderPatternLength, y: borderY },
        thickness: borderWidth,
        color: rgb(0, 0, 0), // Black line color
    });
}





  }

  const pdfBytes = await pdfDoc.save();
  const mailOptions = {
    from: "flaviamedrea000@gmail.com",
    to: toEmail,
    subject: 'Your Cinema Ticket',
    text: 'Enjoy your movie!',
    attachments: [
      {
        filename: 'ticket.pdf',
        content: pdfBytes,
      },
    ],
  };

  await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'An error occurred while sending the email' });
  }
});



router.post('/seats', (req, res, next) => {
  const { name, movie, date, seatNumber, email } = req.body;

  const newSeat = new Seat({
    name,
    movie,
    date,
    seatNumber,
    email,
  });

  newSeat.save()
    .then((createdSeat) => {
      res.status(201).json(createdSeat);
    })
    .catch((error) => {
      res.status(500).json({
        error: error.message,
      });
    });
});

router.get('/seats', (req, res, next) => {
  Seat.find()
    .then(seats => {
      res.json(seats);
    })
    .catch(error => {
      res.status(500).json({ error: 'Internal server error' });
    });
});

module.exports = router;
