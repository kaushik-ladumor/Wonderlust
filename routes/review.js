// review.js
const express = require("express");
const router = express.Router({ mergeParams: true });  // Ensures we can access :id from the parent route
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing");
const Review = require("../models/review");
const { validateReview, isLoggedIn, isAuthor } = require("../middleware.js");

const reviewController = require("../controller/review.js")


// Add a new review to a listing
router.post(
    "/",
    validateReview,
    wrapAsync(reviewController.createReview)
);
// Delete a review from a listing
router.delete(
    "/:reviewId",  // Correct route for deleting a specific review
    isLoggedIn,
    isAuthor,
    wrapAsync(reviewController.deleteReview)
);


module.exports = router;
