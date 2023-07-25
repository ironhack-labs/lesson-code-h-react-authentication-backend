const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const Therapist = require("../models/Therapist.model");

const secretKey = process.env.TOKEN_SECRET;


function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user; // Store the user information in the request object for further use if needed.
    next();
  });
}

//GET - Retrieves a list of all therapists
router.get("/therapists", authenticateToken, (req, res, next) => {
  Therapist.find()
  .then((allTherapists) => res.json(allTherapists))

  .catch((err) => res.status(500).json({ error: "Server error" }))
})

//GET - Retrieves specific therapist information for user using therapist ._id
router.get("/:therapistId", authenticateToken, (req, res, next) => {
  const therapistId = req.params.therapistId;
  Therapist.findById(therapistId)
  .then((therapist) => res.json(therapist))
  .catch((err) => res.status(500).json({ error: "Server error" }))
})



// Route to get therapist information based on the authenticated request.
router.get("/therapistInfo", authenticateToken, (req, res, next) => {
  // Assuming the user information is stored in req.user.
  const therapistId = req.user._id;

  Therapist.findById(therapistId)
    .then((therapist) => {
      if (!therapist) {
        return res.status(404).json({ error: "Therapist not found" });
      }
      res.json(therapist);
    })
    .catch((err) => res.status(500).json({ error: "Server error" }));
});


//PUT update therapist profile details
router.put("/updateProfile", authenticateToken, async (req, res, next) => {
  try {
    const { email, name, introduction, location, price, languages, availability, approach } = req.body;

    const therapistId = req.user._id;
    console.log(req.body);

    if (!mongoose.Types.ObjectId.isValid(therapistId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

    // Find the therapist by ID and update the information.
    const updatedTherapist = await Therapist.findByIdAndUpdate(
      therapistId,
      {
        email,
        name,
        introduction,
        location,
        price,
        languages,
        availability,
        approach,
      },
      { new: true } // Return the updated document.
    );

    res.json(updatedTherapist);
    console.log(updatedTherapist)
  } catch (error) {
    console.error("Error updating therapist:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE  /api/projects/:projectId  -  Deletes a specific project by id
router.delete("/deleteTherapist", authenticateToken, (req, res, next) => {
  const therapistId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(therapistId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Therapist.findByIdAndRemove(therapistId)
    .then(() =>
      res.json({
        message: `Therapist with ${therapistId} is removed successfully.`,
      })
    )
    .catch((error) => res.json(error));
});

module.exports = router;
