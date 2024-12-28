const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");

// Correct the path to middleware.js
const { saveRedirectUrl } = require("../middleware"); 

const userController = require("../controller/user.js");

router.route("/signup")
.get((req, res) => {
    res.render("users/signup.ejs")  
})
.post(wrapAsync(userController.signUpUser))

router.route("/login")
.get((req, res) => {
    res.render("users/login.ejs")
})
.post(
    saveRedirectUrl, // Ensure this middleware runs after session setup
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }),
    wrapAsync(userController.loginUser)
)

router.get("/logout",userController.logoutUser);

module.exports = router;
