
const Listing = require("./models/listing");
const Review = require("./models/review.js");
const { listingSchema,reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
      req.session.redirectUrl = req.originalUrl; // Save the original URL before redirecting to login
      req.flash("error", "You must be logged in to perform this action.");
      return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
      res.locals.redirectUrl = req.session.redirectUrl; // Use res.locals instead of req.locals
      delete req.session.redirectUrl; // Clear it after setting in res.locals
  }
  next();
};

module.exports.isOwner = async(req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
      req.flash("error", "You are not the owner of this listing.");
      return res.redirect(`/listings/${id}`);
    }
    next();
}

// Middleware for body validation
module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    console.error("Validation Error:", error.details);
    const errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// Middleware to validate review data
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
      const errMsg = error.details.map((el) => el.message).join(", ");
      throw new ExpressError(400, errMsg); // 400 = Bad Request
  }
  next();
};

module.exports.isAuthor = async (req, res, next) => {
  try {
    const { id, reviewId } = req.params; // Ensure id and reviewId are destructured correctly
    const review = await Review.findById(reviewId); // Correct reference to 'review'

    // Check if the review exists
    if (!review) {
      req.flash("error", "Review not found.");
      return res.redirect(`/listings/${id}`); // Ensure id is used here
    }

    // Check if the current user is the author of the review
    if (!review.author._id.equals(res.locals.currUser._id)) {
      req.flash("error", "You are not the author of this review.");
      return res.redirect(`/listings/${id}`);
    }

    next();
  } catch (error) {
    console.error(error);
    req.flash("error", "An unexpected error occurred.");
    return res.redirect(`/listings/${id}`);
  }
};