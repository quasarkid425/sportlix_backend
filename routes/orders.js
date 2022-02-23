import express from "express";
import {
  submitOrder,
  giftCards,
  searchCardBalance,
  discountCodes,
  subscription,
  createSubscription,
  pay,
  successOrder,
  getAdminOrders,
  getOrder,
  deliverOrder,
  getOrders,
  getRepeatOrder,
  getShippingDetails,
  getSummary,
  orders,
  messageCustomer,
} from "../controllers/orders.js";
import { isAuth } from "../utils/isAuth.js";
import { isAdmin } from "../utils/isAdmin.js";

const orderRouter = express.Router();

orderRouter.get("/adminOrders", isAuth, isAdmin, getAdminOrders);

orderRouter.post("/", submitOrder);
orderRouter.post("/intents", pay);
orderRouter.post("/subscription", subscription);
orderRouter.post("/createSubscription", createSubscription);
orderRouter.post("/giftcards", giftCards);
orderRouter.get("/success/:orderId", successOrder);
orderRouter.get("/searchBalance/:card", searchCardBalance);
orderRouter.post("/redeem", discountCodes);

//Needs authentication
orderRouter.get("/summary", isAuth, isAdmin, getSummary);
orderRouter.get("/:id", getOrder);
orderRouter.put("/delivered", deliverOrder);
orderRouter.get("/mine/:id", isAuth, getOrders);
orderRouter.get("/repeat/:id", getRepeatOrder);

orderRouter.get("/shippingDetails/:id", getShippingDetails);

orderRouter.put("/delivered", isAuth, isAdmin, deliverOrder);

orderRouter.post("/allOrders", orders);
orderRouter.post("/sendCustomerMessage", isAuth, isAdmin, messageCustomer);

export default orderRouter;
