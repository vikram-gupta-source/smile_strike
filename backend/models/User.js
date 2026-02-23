const mongoose = require('mongoose');

const User = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  points: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastBrushed: { type: Date },
  // Store history as an array of objects
  profilePic: { type: String, default: "" },
  brushingHistory: [
    {
      date: String,
      time: String,
      status: String,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  // Store IDs of items bought from the shop
  inventory: [String]
});

module.exports = mongoose.model('User', User);