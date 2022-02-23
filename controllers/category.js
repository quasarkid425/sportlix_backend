import slugify from "slugify";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import cloudinary from "../utils/cloudinary.js";
export const createCategory = async (req, res) => {
  const { name } = req.body;
  const slug = slugify(name).toLowerCase();
  const result = await cloudinary.uploader.upload(req.file.path);

  try {
    const category = await Category.create({
      name,
      slug,
      image: result.secure_url,
      cloudinaryId: result.public_id,
    });

    res.status(200).json("Category Created");
  } catch (error) {
    console.log(error);
  }
};

export const updateCategory = async (req, res) => {
  try {
    const healthyCategory = await Category.findOne({
      _id: "61d351ebea9f5f098f3d3e3c",
    }).populate({
      path: "products",
    });
  } catch (error) {
    console.log(error);
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    console.log(error);
  }
};

export const getCategoryProducts = async (req, res) => {
  const slug = req.params.slug;

  try {
    const categoryProducts = await Category.findOne({ slug }).populate({
      path: "products",
    });

    res.status(200).json(categoryProducts);
  } catch (error) {
    console.log(error);
  }
};
export const getProduct = async (req, res) => {
  const slug = req.params.slug;
  try {
    const product = await Product.findOne({ slug }).populate({
      path: "category",
      select: "slug",
    });

    res.status(200).json(product);
  } catch (error) {
    console.log(error);
  }
};

export const getCombos = async (req, res) => {
  let juiceCombo = [];
  let smoothieCombo = [];
  let comboProduct = [];
  try {
    const combos = await Category.findOne({
      name: "Baby / Toddler Combo Pack",
    }).populate("products");
    const { products } = combos;

    for (let i = 0; i < products.length; i++) {
      if (products[i].type === "Juice Combo Pack") {
        juiceCombo.push(products[i]);
      } else if (products[i].type === "Smoothie Combo Pack") {
        smoothieCombo.push(products[i]);
      } else {
        comboProduct.push(products[i]);
      }
    }

    const foodCombo = await Category.findOne({
      name: "Baby / Toddler Nutrition",
    }).populate("products");

    const { products: babyFoodCombo } = foodCombo;

    res
      .status(200)
      .json({ juiceCombo, smoothieCombo, babyFoodCombo, comboProduct });
  } catch (error) {
    console.log(error);
  }
};
