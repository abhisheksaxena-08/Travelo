if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

console.log(process.env.SECRET);

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const dns = require("dns");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default || require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const Localstrategy = require("passport-local");
const User = require("./models/user.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// let MONGO_URL = "mongodb://127.0.0.1:27017/travelo";
const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/travelo";

// Force Node's DNS resolver to use reliable public servers to avoid
// `querySrv ECONNREFUSED` errors when resolving mongodb+srv hostnames.
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  console.warn("dns.setServers failed:", e);
}

async function main() {
  try {
    await mongoose.connect(dbUrl, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("Connected to database");
    app.listen(8080, () => {
      console.log("app is listening to port 8080");
    });
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }
}
main();

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: Process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

const sessionOptions = {
  store: store,
  secret: Process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 3,
    maxAge: +1000 * 60 * 60 * 24 * 3,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new Localstrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// app.get("/demo", async (req, res) => {
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username: "bhanu",
//   });
//   let registeruser = await User.register(fakeUser, "helloworld");
//   res.send(registeruser);
// });

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

app.use("/listings", listingRouter);

app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
  console.log(err);
});

// server is started after DB connection in main()
