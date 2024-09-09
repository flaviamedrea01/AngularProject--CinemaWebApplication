const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const multer = require("multer");

const User = require("../models/user");

const router = express.Router();

const uuid = require('uuid');

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "@gmail.com",
    pass: "x",
  },
});

const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/; // Password regex pattern

router.post("/signup", async (req, res) => {
  try {
    const password = req.body.password;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must include at least one capital letter, one number, and be at least 8 characters long.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      userId: uuid.v4(),
      email: req.body.email,
      password: hashedPassword,
      isActive: false,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      activationLink: new Date().toISOString(),
    });

    const savedUser = await user.save();

    const activationLink = `http://localhost:4200/activate/${savedUser._id}`;
    const mailOptions = {
      from: "flaviamedrea000@gmail.com",
      to: req.body.email,
      subject: "Account Activation",
      text: `Click the following link to activate your account: ${activationLink}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          message: "Failed to send the activation email.",
        });
      } else {
        console.log("Email sent: " + info.response);
        return res.status(201).json({
          message: "User created! Activation email sent successfully.",
          user: savedUser,
        });
      }
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
});



router.post("/login", async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      // User not found
      return res.status(401).json({
        message: "Login failed. Incorrect e-mail."
      });
    }

    const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);

    if (!isPasswordCorrect) {
      // Incorrect password
      return res.status(401).json({
        message: "Login failed. Incorrect password."
      });
    }

    if (!user.isActive) {
      // Account not activated
      return res.status(403).json({
        message: "Account not activated. Please check your email for the activation link."
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { email: user.email, userId: user._id },
      "secret_this_should_be_longer",
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      token: token,
      expiresIn: 3600,
      userId: user._id,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Login failed. An unexpected error occurred."
    });
  }
});


router.post("/activate/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.isActive) {
      return res.status(200).json({
        message: "Account already activated",
      });
    }

    user.isActive = true;
    user.activationLink = null;

    const updatedUser = await user.save();

    res.status(200).json({
      message: "Account activated successfully",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Generate password reset token
    const resetToken = jwt.sign(
      { userId: user._id },
      "secret_for_password_reset",
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    // Save the reset token to the user object
    user.resetToken = resetToken;
    await user.save();

    // Send email with password reset link
    const resetLink = `http://localhost:4200/reset-password/${resetToken}`;
    const mailOptions = {
      from: "flaviamedrea000@gmail.com",
      to: req.body.email,
      subject: "Password Reset",
      text: `Click the following link to reset your password: ${resetLink}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          message: "Failed to send the password reset email.",
        });
      } else {
        console.log("Email sent: " + info.response);
        return res.status(200).json({
          message: "Password reset email sent successfully.",
        });
      }
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  const resetToken = req.params.token;
  const newPassword = req.body.newPassword;

  try {
    const decodedToken = jwt.verify(resetToken, "secret_for_password_reset");

    const user = await User.findById(decodedToken.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Update user's password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = undefined; // Clear the reset token
    await user.save();

    return res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
});

router.patch("/update/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);
    const updatedFields = {};

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (req.body.firstName !== undefined && req.body.firstName !== user.firstName) {
      updatedFields.firstName = req.body.firstName;
    }

    if (req.body.lastName !== undefined && req.body.lastName !== user.lastName) {
      updatedFields.lastName = req.body.lastName;
    }

    if (req.body.avatar !== undefined && req.body.avatar !== user.avatar) {
      updatedFields.avatar = req.body.avatar;
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $set: updatedFields },
      { new: true } // Return the updated user in the response
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});



router.delete("/delete/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      message: "Account deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});


router.get('/:userId', (req, res, next) => {
  const userId = req.params.userId;

  User.findById(userId)
    .then(user => {
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    })
    .catch(error => {
      res.status(500).json({ error: 'Internal server error' });
    });
});


module.exports = router;
