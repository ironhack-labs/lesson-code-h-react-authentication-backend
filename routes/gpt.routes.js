const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const chatAPIKey = process.env.OPENAI_API_KEY;

router.post("/completions", async (req, res, next) => {
    const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${chatAPIKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an empathetic companion on an emotional wellbeing app. You offer mental health tips and advice to users based on their prompts. Do not assume the role of a professional and remind them of that.",
        },
        { role: "user", content: req.body.message }],
      max_tokens: 500,
    }),
  };
  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      options
    );
    const data = await response.json();
    res.send(data);
  } catch (error) {
    console.log(error);
  }
});


module.exports = router;