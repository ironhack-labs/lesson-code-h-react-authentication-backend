const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const Therapist = require("../models/Therapist.model");

const { isAuthenticated } = require('../middleware/jwt.middleware.js');

const router = express.Router();
const saltRounds = 10;

// POST /auth/therapist-signup - Creates a new therapist in the database
  router.post('/signup', (req, res, next) => {
  const { email, password, name, location, price, languages, availability, approach } = req.body;
console.log("hello", req.body);
  // Check if email or password or name are provided as empty string 
  if (email === '' || password === '' || name === '' || location === '' || price === '' || languages === '' || availability === '' || approach === '') {
    res.status(400).json({ message: "Please fill out all required fields" });
    return;
  }

  // Use regex to validate the email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: 'Provide a valid email address.' });
    return;
  }
  
  // Use regex to validate the password format
  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({ message: 'Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.' });
    return;
  }

  // Check the therapist's collection if a therapist with the same email already exists
  Therapist.findOne({ email })
    .then((foundTherapist) => {
      // If the therapist with the same email already exists, send an error response
      if (foundTherapist) {
        res.status(400).json({ message: "This account already exists." });
        return;
      }

      // If email is unique, proceed to hash the password
      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);

      // Create the new therapist in the database
      // We return a pending promise, which allows us to chain another `then` 
      return Therapist.create({ email, password: hashedPassword, name, location, price, languages, availability, approach });
    })
    .then((createdTherapist) => {
      // Deconstruct the newly created therapist object to omit the password
      // We should never expose passwords publicly
      const { email, name, location, price, languages, availability, approach, _id } = createdTherapist;
    
      // Create a new object that doesn't expose the password
      const payload = { email, name, location, price, languages, availability, approach, _id };

      // Create and sign the token
      const authToken = jwt.sign( 
        payload,
        process.env.TOKEN_SECRET,
        { algorithm: 'HS256', expiresIn: "6h" }
      );

      // Send a json response containing the therapist object
      res.status(201).json({ authToken: authToken });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: "Internal Server Error" })
    });
});


// POST  /auth/login - Verifies email and password and returns a JWT
router.post('/login', (req, res, next) => {
  const { email, password } = req.body;

  // Check if email or password are provided as empty string 
  if (email === '' || password === '') {
    res.status(400).json({ message: "Provide email and password." });
    return;
  }

  // Check the therapist's collection if a therapist with the same email exists
  Therapist.findOne({ email })
    .then((foundTherapist) => {
    
      if (!foundTherapist) {
        // If the therapist is not found, send an error response
        res.status(401).json({ message: "Account not found." })
        return;
      }

      // Compare the provided password with the one saved in the database
      const passwordCorrect = bcrypt.compareSync(password, foundTherapist.password);

      if (passwordCorrect) {
        // Deconstruct the therapist object to omit the password
        const { email, name, location, price, languages, availability, approach, _id } = foundTherapist;
        
        // Create an object that will be set as the token payload
        const payload = { email, name, location, price, languages, availability, approach, _id };

        // Create and sign the token
        const authToken = jwt.sign( 
          payload,
          process.env.TOKEN_SECRET,
          { algorithm: 'HS256', expiresIn: "6h" }
        );

        // Send the token as the response
        res.status(200).json({ authToken: authToken });
      }
      else {
        res.status(401).json({ message: "Unable to authenticate account" });
      }

    })
    .catch(err => res.status(500).json({ message: "Internal Server Error" }));
});


// GET  /auth/verify  -  Used to verify JWT stored on the client
router.get('/verify', isAuthenticated, (req, res, next) => {

  // If JWT token is valid the payload gets decoded by the
  // isAuthenticated middleware and made available on `req.payload`
  console.log(`req.payload`, req.payload);

  // Send back the object with therapist data
  // previously set as the token payload
  res.status(200).json(req.payload);
});


module.exports = router;