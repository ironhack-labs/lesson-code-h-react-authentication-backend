const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const therapistSchema = new Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  languages: { type: String, required: true },
  style: { type: String, required: true },
  specialization: { type: String, required: true },
  appointments: { type: Schema.Types.ObjectId, ref: "Appointment" }
});

module.exports = model("Therapist", therapistSchema);