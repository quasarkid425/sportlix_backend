import express from "express";
import {
  createCategory,
  updateCategory,
  getCategories,
  getCategoryProducts,
  getProduct,
  getCombos,
} from "../controllers/category.js";
import fileUpload from "../utils/multer.js";
import { isAuth } from "../utils/isAuth.js";

const categoryRouter = express.Router();

categoryRouter.post("/", isAuth, fileUpload.single("image"), createCategory);
categoryRouter.put("/", updateCategory);
categoryRouter.get("/", getCategories);
categoryRouter.get("/combo", getCombos);
categoryRouter.get("/:slug", getCategoryProducts);
categoryRouter.get("/product/:slug", getProduct);

export default categoryRouter;
