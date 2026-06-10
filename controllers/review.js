const Review = require("../models/reviews.js");
const Listing = require("../models/listing.js");

module.exports.addReview = async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  let newRev = new Review(req.body.review);
  newRev.author = req.user._id;
  listing.reviews.push(newRev);

  await newRev.save();
  await listing.save();
  req.flash("success", "new review added");
  res.redirect("/listings");
};

module.exports.deleteReview = async (req, res) => {
  let { id, reviewId } = req.params;
  id = id.trim();
  reviewId = reviewId.trim();
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "review deleted");
  res.redirect(`/listings/${id}`);
};
