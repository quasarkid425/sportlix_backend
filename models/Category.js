import mongoose from "mongoose";

const Schema = mongoose.Schema;

const CategorySchema = new Schema(
  {
    name: {
      type: String,
    },
    slug: {
      type: String,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    image: {
      type: String,
    },
    cloudinaryId: {
      type: String,
    },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", CategorySchema);

export default Category;
