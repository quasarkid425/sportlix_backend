import slugify from "slugify";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import cloudinary from "../utils/cloudinary.js";

export const createProduct = async (req, res) => {
  const {
    name,
    desc,
    price,
    inStock,
    qty,
    category,
    type,
    bestseller,
    featured,
    image,
  } = req.body;

  const slug = slugify(name).toLowerCase();
  const result = await cloudinary.uploader.upload(req.file.path);

  try {
    const product = await Product.create({
      name,
      slug,
      desc,
      price,
      inStock,
      qty,
      category,
      type,
      bestseller,
      featured,
      image: result.secure_url,
      cloudinaryId: result.public_id,
    });

    const productId = product._id;

    await Category.updateOne(
      { _id: category },
      { $addToSet: { products: productId } }
    );

    res.status(200).json("Product created");
  } catch (error) {
    console.log(error);
  }
};

export const getAddOns = async (req, res) => {
  try {
    const addOns = await Product.find({ type: "Add on" });
    res.status(200).json(addOns);
  } catch (error) {
    console.log(error);
  }
};

export const getOfferProducts = async (req, res) => {
  try {
    const offerProducts = await Product.find({ type: "Food" });

    res.status(200).json(offerProducts);
  } catch (error) {
    console.log(error);
  }
};

export const getBestsellerFeatured = async (req, res) => {
  try {
    const bestSeller = await Product.findOne({ bestseller: true });
    const featured = await Product.findOne({ featured: true });

    res.status(200).json({
      bestSeller,
      featured,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getTotalProducts = async (req, res) => {
  const PAGE_SIZE = 20;
  const page = parseInt(req.query.page || "0");

  try {
    const total = await Product.countDocuments({});
    const totalProducts = await Product.find({});
    const products = await Product.find()
      .limit(PAGE_SIZE)
      .skip(PAGE_SIZE * page)
      .sort({ updatedAt: -1 });

    res.status(200).json({
      totalPages: Math.ceil(total / PAGE_SIZE),
      totalProducts: totalProducts.length,
      products,
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const stockController = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, {
      inStock: req.body.status ? false : true,
    });
    const totalUpdatedProducts = await Product.find({});
    res.status(200).json(totalUpdatedProducts);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const relatedProducts = async (req, res) => {
  const slug = req.params.productId;
  const { category } = await Product.findOne({ slug }).select("category");
  const { name: relatedName } = await Product.findOne({ slug }).select("name");
  const products = await Category.findOne({ _id: category })
    .populate("products")
    .select("products");

  const related = products.products.filter((prod) => prod.name !== relatedName);

  const shuffled = related.sort(() => 0.5 - Math.random());

  let selected = shuffled.slice(0, 3);

  res.json(selected);
};

export const getInfo = async (req, res) => {
  try {
    const productTypes = await Product.distinct("type");

    const categoryTypes = await Category.find().select("name");

    res.status(200).json({ productTypes, categoryTypes });
  } catch (error) {
    console.log(error);
  }
};
