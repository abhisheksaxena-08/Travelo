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

  const destinations = [
    ["Jaipur", "India"], ["Goa", "India"], ["Manali", "India"], ["Udaipur", "India"], ["Kerala", "India"],
    ["Dubai", "United Arab Emirates"], ["Paris", "France"], ["Rome", "Italy"], ["Lisbon", "Portugal"], ["Barcelona", "Spain"],
    ["Bali", "Indonesia"], ["Phuket", "Thailand"], ["Singapore", "Singapore"], ["Tokyo", "Japan"], ["Seoul", "South Korea"],
    ["London", "United Kingdom"], ["Amsterdam", "Netherlands"], ["Sydney", "Australia"], ["Cape Town", "South Africa"], ["Reykjavik", "Iceland"],
  ];
  const styles = ["Skyline Villa", "Private Pool Retreat", "Designer Apartment", "Forest Cabin", "Luxury Beach House", "Modern Studio", "Heritage Haveli", "Alpine Chalet"];
  const images = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2",
    "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8",
  ];

  const baseListings = initdata.data.map((listing) => ({ ...listing, owner: owner._id }));
  const generatedListings = [];
  while (baseListings.length + generatedListings.length < 100) {
    const number = baseListings.length + generatedListings.length + 1;
    const [location, country] = destinations[number % destinations.length];
    const style = styles[number % styles.length];
    generatedListings.push({
      title: `${style} in ${location}`,
      description: `A beautifully curated ${style.toLowerCase()} offering comfort, modern amenities and an unforgettable stay in ${location}.`,
      image: { filename: `travelo-fake-${number}`, url: `${images[number % images.length]}?auto=format&fit=crop&w=800&q=75` },
      price: 1100 + ((number * 137) % 3900),
      location,
      country,
      owner: owner._id,
    });
  }
  const listings = [...baseListings, ...generatedListings];
  console.log(`Database updated: ${listings.length} listings added`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("Database update failed:", err.message);
  await mongoose.disconnect();
  process.exit(1);
});
