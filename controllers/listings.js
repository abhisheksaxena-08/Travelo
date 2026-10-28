const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
  const { q } = req.query;
  const filter = q
    ? { $or: [
        { title: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
        { country: { $regex: q, $options: "i" } },
      ] }
    : {};
  const allListing = await Listing.find(filter);
  res.render("listings/index.ejs", { allListing });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested does not exist");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  const newlisting = new Listing(req.body.listing);
  if (req.file) {
    newlisting.image = {
      url: req.file.path || req.file.location || req.file.url,
      filename: req.file.filename,
    };
  }
  newlisting.owner = req.user._id;
  await newlisting.save();
  req.flash("success", "New listing created");
  res.redirect("/listings");
};

module.exports.editListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  req.flash("success", "listing editted successful");
  if (!listing) {
    req.flash("error", "Listing you requested does not exist");
    return res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true, runValidators: true });
  if (req.file) {
    listing.image = {
      url: req.file.path || req.file.location || req.file.url,
      filename: req.file.filename,
    };
    await listing.save();
  }
  req.flash("success", "listing updated successfully");
  res.redirect(`/listings`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "listing delete succesfull");
  res.redirect("/listings");
};
