import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../models/product.model.js";

dotenv.config();

const sampleProducts = [
  {
    name: "Everyday Cotton Shirt",
    description: "A breathable cotton shirt designed for comfortable everyday wear.",
    price: 1299,
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80",
    stock: 20,
  },
  {
    name: "Chelsea Boots",
    description: "Classic ankle-high Chelsea boots with elastic side panels for an easy, comfortable fit.",
    price: 2499,
    category: "Fashion",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Chelsea_boot%2C_brown_suede.jpg/960px-Chelsea_boot%2C_brown_suede.jpg",
    stock: 10,
  },
  {
    name: "Minimal Ceramic Table Lamp",
    description: "A warm, understated table lamp to bring a softer glow to your space.",
    price: 1899,
    category: "Home",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80",
    stock: 12,
  },
  {
    name: "Linen Blend Curtains",
    description: "Soft grey linen-blend curtains that frame an open window and bring a bright, airy feel to your room.",
    price: 1599,
    category: "Home",
    image:
      "https://images.unsplash.com/photo-1617596225496-1d9da33a144b?auto=format&fit=crop&w=1000&q=80",
    stock: 15,
  },
  {
    name: "Atomic Habits",
    description: "James Clear's practical guide to building good habits and breaking bad ones.",
    price: 499,
    category: "Books",
    image:
      "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg?default=false",
    stock: 25,
  },
];

const seedProducts = async () => {
  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL is not configured.");
  }

  await mongoose.connect(process.env.MONGO_URL);

  for (const product of sampleProducts) {
    await Product.findOneAndUpdate(
      { name: product.name, category: product.category },
      { $set: product },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );
  }

  console.log(`Seeded ${sampleProducts.length} sample products.`);
};

try {
  await seedProducts();
} catch (error) {
  console.error("Product seeding failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
