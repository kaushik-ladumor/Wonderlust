
const User = require("../models/user.js");

module.exports.signUpUser = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registerUser = await User.register(newUser, password);
        req.login(registerUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Register Successfully complete!");
            res.redirect("/listings");
        })
    }
    catch (err) {
        req.flash("error", "User was already exist.");
        res.redirect("/signup");
    }
}

module.exports.loginUser = async (req, res) => {
    req.flash("success", "Login successfully.");
    const redirectUrl = res.locals.redirectUrl || "/listings"; // Default to "/listings" if no redirect URL
    res.redirect(redirectUrl);
}

module.exports.logoutUser =  (req, res, next) => {
    req.logOut((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are Logged out!");
        res.redirect("/listings");
    });
}