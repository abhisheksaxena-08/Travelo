require("dotenv").config();
const mongoose = require("mongoose");
const dns = require("dns");
try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch (_) {}
const initdata = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

async function main() {
  const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/travelo";
  await mongoose.connect(dbUrl, { serverSelectionTimeoutMS: 10000 });

  let owner = await User.findOne({ username: "travelo-demo" });
  if (!owner) {
    owner = new User({ username: "travelo-demo", email: "demo@travelo.app" });
    await User.register(owner, process.env.SEED_PASSWORD || "TraveloDemo123!");
  }

  await Listing.deleteMany({});
  const listings = initdata.data.map((listing) => ({ ...listing, owner: owner._id }));
  await Listing.insertMany(listings);
  console.log(`Database updated: ${listings.length} listings added`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("Database update failed:", err.message);
  await mongoose.disconnect();
  process.exit(1);
});
