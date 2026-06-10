const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isloggedIn, isOwner, validatelisitng } = require("../middleware.js");
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const ListingController = require("../controllers/listings.js");

const { storage } = require("../cloud.config.js");
const upload = multer({ storage });

router
  .route("/")
  //index route
  .get(wrapAsync(ListingController.index))
  //create route
  .post(
    isloggedIn,
    upload.single("listing[image]"),
    validatelisitng,
    wrapAsync(ListingController.createListing),
  );

// new route
router.get("/new", isloggedIn, ListingController.renderNewForm);

router
  .route("/:id")
  // find by id route show route
  .get(wrapAsync(ListingController.showListing))
  // update route
  .put(
    isloggedIn,
    isOwner,
    upload.single("listing[image]"),
    validatelisitng,
    wrapAsync(ListingController.updateListing),
  )
  //delete route
  .delete(isloggedIn, isOwner, wrapAsync(ListingController.deleteListing));

// edit route
router.get(
  "/:id/edit",
  isloggedIn,
  isOwner,
  wrapAsync(ListingController.editListing),
);

module.exports = router;
