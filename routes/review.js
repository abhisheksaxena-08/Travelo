const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");

const Review = require("../models/reviews.js");
const Listing = require("../models/listing.js");
const reviewController = require("../controllers/review.js");

const {
  validateReview,
  isloggedIn,
  isReviewAuthor,
} = require("../middleware.js");

//review  post  route
router.post(
  "/",
  isloggedIn,
  validateReview,
  wrapAsync(reviewController.addReview),
);

// delete review route
router.delete(
  "/:reviewId",
  isloggedIn,
  isReviewAuthor,
  wrapAsync(reviewController.deleteReview),
);
module.exports = router;
