const { response } = require("express");
const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
let mapToken = process.env.MAP_TOKEN;

const geocodingClient = mbxGeocoding({ accessToken:mapToken });

module.exports.index = async (req, res) => {
    const listings = await Listing.find({});
    res.render("listings/index.ejs", { listings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new");
};  

module.exports.createListing = async (req, res, next) => {
    try {
        let response = await geocodingClient.forwardGeocode({
            query: req.body.listing.location,
            limit: 1
        }).send();

        if (!response.body.features || response.body.features.length === 0) {
            req.flash("error", "Unable to geocode the provided location.");
            return res.redirect("/listings/new");
        }

        console.log("Geocoding Response:", response.body);

        let { path: url, filename } = req.file; // File details
        console.log(req.body.listing); // Ensure this is defined

        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = { url, filename };
        newListing.geometry = response.body.features[0].geometry;

        let savedListing = await newListing.save();
        console.log(savedListing);

        req.flash("success", "New Listing Created");
        res.redirect("/listings");
    } catch (error) {
        console.error("Error creating listing:", error);
        req.flash("error", "Something went wrong while creating the listing.");
        res.redirect("/listings/new");
    }
};



module.exports.showListing = async (req, res, next) => {
    const listing = await Listing.findById(req.params.id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner");
    if (!listing) {
        // 
        req.flash("error", "Listing you requested for does not exist!!");
        res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        // 
        req.flash("error", "Listing you requested for does not exist!!");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
    res.render("listings/edit", { listing, originalImageUrl });

};

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (typeof req.file !== "undefined") {
        let { path: url, filename } = req.file;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`); // Redirect to updated listing's page
}

module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;
    const data = await Listing.findByIdAndDelete(id);
    console.log("Deleted Listing:", data);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}