const Listing = require("../models/listing");
const Review = require("../models/review.js");


module.exports.createReview = async (req, res) => {
    let { id } = req.params; // Now we can access :id because we use mergeParams: true
    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "New Review Created!");
    console.log(`New review added to listing ${id}`);
    res.redirect(`/listings/${listing._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params; // Access both listing id and review id
    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    // Remove the review from the listing's reviews array
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    // Delete the review from the database
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted!");
    console.log(`Deleted review ${reviewId} from listing ${id}`);
    res.redirect(`/listings/${id}`); // Redirect back to the listing page
}