import mongoose from "mongoose";

const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    name: { type: String, unique: true },
    slug: { type: String, unique: true },
    desc: { type: String },
    price: { type: Number },
    inStock: { type: Boolean },
    qty: { type: Number },
    type: { type: String },
    bestseller: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    image: { type: String },
    cloudinaryId: { type: String },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);

export default Product;
