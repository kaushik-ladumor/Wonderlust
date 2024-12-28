const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  comment: {
    type: String,
    required: true
  },
  rating: {  // Corrected field name from "reting" to "rating"
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  createdAt: {  // Corrected typo: 'createAt' to 'createdAt'
    type: Date,
    default: Date.now
  },
  author:{
    type: Schema.Types.ObjectId,
    ref: "User",
  }
});

module.exports = mongoose.model("Review", reviewSchema);
