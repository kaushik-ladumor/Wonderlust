const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controller/listing.js");

const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });



router
  .route("/")
  .get(
    wrapAsync(listingController.index) // Handles GET requests
  )
  .post(
    isLoggedIn,                        // Authentication middleware
    upload.single("listing[image]"),
    validateListing,                   // Validation middleware
    wrapAsync(listingController.createListing) // Handles POST requests
  );

// Render form to create a new listing (this route is moved to the top)
router.get("/new", isLoggedIn, listingController.renderNewForm);

router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    upload.single("listing[image]"),
    isOwner,
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

// Render form to edit a listing
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;