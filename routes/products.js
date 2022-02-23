import express from "express";
import {
  createProduct,
  getAddOns,
  getOfferProducts,
  getBestsellerFeatured,
  getInfo,
  getTotalProducts,
  stockController,
  relatedProducts,
} from "../controllers/product.js";
import fileUpload from "../utils/multer.js";
import { isAuth } from "../utils/isAuth.js";
import { isAdmin } from "../utils/isAdmin.js";

const productRouter = express.Router();

productRouter.post(
  "/",
  isAuth,
  isAdmin,
  fileUpload.single("image"),
  createProduct
);
productRouter.get("/addons", getAddOns);
productRouter.get("/offer", getOfferProducts);
productRouter.get("/getInfo", isAuth, isAdmin, getInfo);
productRouter.get("/bestsellerFeatured", getBestsellerFeatured);
productRouter.get("/related/:productId", relatedProducts);
productRouter.put("/status/:id", stockController);

//needs authentication
productRouter.get("/totalProducts", isAuth, isAdmin, getTotalProducts);

export default productRouter;
