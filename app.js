if (process.env.NODE_ENV != "production") {
  require('dotenv').config()
}


const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");

// Routers
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const user = require("./routes/user.js");

// App Configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// MongoDB Connection


const dburl = process.env.ATLASDB_URL;

async function main() {
  await mongoose.connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // 30 seconds timeout
  });
}

main()
  .then(() => {
    console.log("MongoDB connected successfully on traveller DB");
  })
  .catch((e) => {
    console.error("Failed to connect to MongoDB:", e);
  });

  const store = MongoStore.create({
    mongoUrl : dburl,
    crypto : {
      secret : process.env.SECRET
    },
    touchAfter: 24 * 3600
  });

  store.on("error", (err) =>{
    console.log("ERROR IN MONGO SESSION STORE", err);
  });

// Session Configuration
const sessionOption = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// Routes
// app.get("/", (req, res) => {
//   res.send("Root is Working");
// });



app.use(session(sessionOption));
app.use(flash());

// Passport Authentication Setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash messages & current user middleware
app.use((req, res, next) => {
  console.log("Current User:", req.user);
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});


// Use Routes
app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews); // This connects reviews to listings
app.use("/", user);

// Catch-all for 404 errors
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// Global Error Handler
app.use((err, req, res, next) => {
  const { status = 500, message = "Something went wrong" } = err;
  res.status(status).render("error", { message, status });
});

// Server Listener
const PORT = process.env.PORT || 8081; // Change to 8081 or another port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
