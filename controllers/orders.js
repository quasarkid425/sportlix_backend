import Order from "../models/Order.js";
import User from "../models/User.js";
import GiftCard from "../models/GiftCard.js";
import Product from "../models/Product.js";
import Stripe from "stripe";
import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_KEY);

export const pay = async (req, res) => {
  try {
    const { amount } = req.body;

    // Psst. For production-ready applications we recommend not using the
    // amount directly from the client without verifying it first. This is to
    // prevent bad actors from changing the total amount on the client before
    // it gets sent to the server. A good approach is to send the quantity of
    // a uniquely identifiable product and calculate the total price server-side.
    // Then, you would only fulfill orders using the quantity you charged for.

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
    });

    res.status(200).json(paymentIntent.client_secret);
  } catch (err) {
    res.status(500).json({ statusCode: 500, message: err.message });
  }
};

export const submitOrder = async (req, res) => {
  try {
    const order = await Order.create({
      orderItems: req.body.cartItems,
      shippingAddress: req.body.shippingDetails,
      deliveryInstructions: req.body.deliveryInstructions,
      itemsPrice: req.body.priceOfItems,
      shippingPrice: req.body.shippingPrice,
      taxPrice: req.body.taxPrice,
      totalPrice: req.body.totalPrice,
      user: req.body.user,
      registeredUser: req.body.registeredUser
        ? req.body.registeredUser
        : "61d5882b5c35cec41b298fcb",
      isPaid: req.body.isPaid,
    });
    res.status(200).json(order);
    const newOrder = await Order.findOne({ _id: order._id });
    let today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    const yyyy = today.getFullYear();
    today = mm + "/" + dd + "/" + yyyy;
    const orderLink = `${process.env.URL_CLIENT}/success/${order._id}`;
    const emailOrder = newOrder.orderItems.map((item) => ({
      name: item.name,
      qty: item.qty,
      image: item.image,
      price: item.price,
      type: item.type,
      total: item.qty * item.price,
      cloudinaryId: item.cloudinaryId,
    }));
    const instructions =
      newOrder.shippingAddress.deliveryInstructions === ""
        ? "None"
        : newOrder.shippingAddress.deliveryInstructions;
    const msg = {
      to: `${newOrder.shippingAddress.email}`,
      subject: "Thank you for your order!",
      from: "quasarkid339203@gmail.com", //This will need to change
      templateId: "d-a18d7283c496454986cec05d4e83637d",
      dynamicTemplateData: {
        firstName: `${newOrder.shippingAddress.firstName}`,
        orderId: `${order._id}`,
        orderLink: `${orderLink}`,
        today: `${today}`,
        items: emailOrder,
        itemsPrice: `${newOrder.itemsPrice}`,
        shippingPrice: `${newOrder.shippingPrice}`,
        taxPrice: `${newOrder.taxPrice}`,
        totalPrice: `${newOrder.totalPrice}`,
        address: `${newOrder.shippingAddress.address}`,
        city: `${newOrder.shippingAddress.state}`,
        state: `${newOrder.shippingAddress.postalCode}`,
        postalCode: `${newOrder.shippingAddress.postalCode}`,
        country: `${newOrder.shippingAddress.country}`,
        deliveryInstructions: instructions,
      },
      asm: {
        group_id: 16687,
        groups_to_display: [16687],
      },
    };
    sgMail.send(msg, (error, result) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Successfully sent..");
      }
    });

    let giftCardArr = [];
    for (let i = 0; i < req.body.cartItems.length; i++) {
      if (req.body.cartItems[i].name.includes("Gift Card")) {
        giftCardArr.push(...req.body.cartItems[i].giftCardUids);
      }
    }
    if (giftCardArr.length === 0) {
      return;
    } else {
      for (let i = 0; i < giftCardArr.length; i++) {
        const msg = {
          to: req.body.user,
          subject: "From My Roots E Gift Card",
          from: "quasarkid339203@gmail.com", //This will need to change
          templateId: "d-b17b2a87208047368d066421b7dd26a9",
          dynamicTemplateData: {
            firstName: req.body.shippingDetails.firstName,
            amount: giftCardArr[i].amount,
            giftCardId: giftCardArr[i].giftCardId,
          },
          asm: {
            group_id: 16687,
            groups_to_display: [16687],
          },
        };
        sgMail.send(msg, (error, result) => {
          if (error) {
            console.log(error);
          } else {
            console.log("Successfully sent..");
          }
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

export const successOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.orderId });
  res.status(200).json(order);
  try {
  } catch (error) {
    console.log(error);
  }
};

export const getAdminOrders = async (req, res) => {
  const PAGE_SIZE = 20;
  const page = parseInt(req.query.page || "0");
  try {
    const total = await Order.countDocuments({});
    const orders = await Order.find({})
      .limit(PAGE_SIZE)
      .skip(PAGE_SIZE * page)
      .sort({ updatedAt: -1 });
    res.status(200).json({
      totalPages: Math.ceil(total / PAGE_SIZE),
      orders,
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
};
export const orders = async (req, res) => {
  const { orderItems: orderCartItems } = req.body;

  if (req.body.orderItems.length === 0) {
    return res.status(400).send({ message: "Cart is empty" });
  } else {
    const order = await Order.create({
      orderItems: orderCartItems,
      shippingAddress: req.body.shippingMethod,
      itemsPrice: req.body.itemsPrice,
      shippingPrice: req.body.shippingPrice,
      taxPrice: req.body.taxPrice,
      totalPrice: req.body.totalPrice,
      isPaid: true,
      user: req.body.user,
    });
    res.status(201).json(order);
  }
};

export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    order && res.status(200).json(order);

    !order && res.status(401).json("No order found");
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const getOrders = async (req, res) => {
  const PAGE_SIZE = 20;
  const page = parseInt(req.query.page || "0");

  try {
    const total = await Order.countDocuments({});

    const orders = await Order.find({ registeredUser: req.params.id })
      .limit(PAGE_SIZE)
      .skip(PAGE_SIZE * page)
      .sort({ updatedAt: -1 });

    res.status(200).json({
      totalPages: Math.ceil(total / PAGE_SIZE),

      orders,
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    const orders = await Order.find({});
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json(error);
  }
};
export const deliverOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.body.orderId);

    if (order) {
      order.isDelivered = true;

      await order.save();

      const orders = await Order.find({})
        .populate("user", "name")
        .sort({ updatedAt: -1 });

      if (orders) {
        deliverOrderEmail(req.body.orderId, order);
        return res.status(200).json(orders);
      } else {
        return res.status(401).json("No orders found");
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const deliverOrderEmail = (orderId, newOrder) => {
  const orderLink = `${process.env.URL_CLIENT}/order/view/${orderId}`;

  const msg = {
    to: `${newOrder.shippingAddress.email}`,
    subject: "Your order has been shipped!",
    from: "quasarkid339203@gmail.com", //This will need to change
    templateId: "d-45114299a7dc43f8976c493ed15c0999",
    dynamicTemplateData: {
      firstName: newOrder.shippingAddress.firstName,
      orderLink: orderLink,
    },
    asm: {
      group_id: 16688,
      groups_to_display: [16688],
    },
  };

  sgMail.send(msg, (error, result) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Successfully sent..");
    }
  });
};

export const getShippingDetails = async (req, res) => {
  const userShipping = await Order.findOne({ user: req.params.id });
  if (userShipping) {
    return res.status(200).json(userShipping.shippingAddress);
  } else {
    res.status(404).json("Shipping address not found");
  }
  try {
  } catch (error) {
    res.status(500).json(error.message);
  }
};
export const getRepeatOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    const products = await Product.find({ inStock: false });

    const orderNames = order.orderItems.map((order) => order.name);
    const productNames = products.map((product) => product.name);

    const intersection = orderNames.filter((element) =>
      productNames.includes(element)
    );

    if (intersection.length > 0) {
      res
        .status(400)
        .json({ error: "Sorry one or more items is out of stock" });
    } else {
      res.status(200).json(order);
    }
  } catch (error) {
    res.status(500).json("Order not found");
  }
};

export const getSummary = async (req, res) => {
  try {
    const orders = await Order.aggregate([
      {
        $group: {
          _id: null,
          numOrders: { $sum: 1 },
          totalSales: { $sum: "$totalPrice" },
        },
      },
    ]);

    const users = await User.aggregate([
      {
        $group: {
          _id: null,
          numUsers: { $sum: 1 },
        },
      },
    ]);
    const dailyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orders: { $sum: 1 },
          sales: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const productCategories = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      users,
      orders,
      dailyOrders,
      productCategories,
    });
  } catch (error) {
    console.log(error);
  }
};

export const giftCards = async (req, res) => {
  try {
    const cards = await GiftCard.insertMany(req.body);
  } catch (error) {
    console.log(error);
  }
};

export const discountCodes = async (req, res) => {
  const { discountCode, totalPrice } = req.body;

  try {
    const card = await GiftCard.findOne({ giftCardId: discountCode });

    if (card) {
      if (card.amount < totalPrice) {
        await GiftCard.deleteOne({
          giftCardId: discountCode,
        });

        const discountPrice = totalPrice - card.amount;

        res.status(200).json({ updatedPrice: discountPrice });
      } else {
        const updated = await GiftCard.updateOne(
          { _id: card._id },
          { amount: card.amount - totalPrice }
        );

        res.status(200).json({ updatedPrice: 0 });
      }
    } else {
      res.status(400).json({ error: "Invalid code" });
    }
  } catch (error) {
    console.log(error);
  }
};

export const searchCardBalance = async (req, res) => {
  try {
    const card = await GiftCard.findOne({ giftCardId: req.params.card });
    if (card) {
      res.status(200).json({ card: card.amount });
    } else {
      res.status(400).json({ card: "Not found" });
    }
  } catch (error) {
    console.log(error);
  }
};

export const messageCustomer = async (req, res) => {
  const { email, message } = req.body;

  const msg = {
    to: `${email}`,
    subject: "We have an update on your order!",
    from: "quasarkid339203@gmail.com", //This will need to change
    templateId: "d-5a4a23ff24074fae9ea189fb69993e23",
    dynamicTemplateData: {
      message: message,
    },
    asm: {
      group_id: 16688,
      groups_to_display: [16688],
    },
  };

  sgMail.send(msg, (error, result) => {
    if (error) {
      console.log(error);
    } else {
      res.status(200).json("Message sent");
      console.log("Successfully sent..");
    }
  });
};

export const subscription = async (req, res) => {
  // Create a new customer object
  const customer = await stripe.customers.create({
    email: req.body.email,
  });

  // save the customer.id as stripeCustomerId
  // in your database.

  res.send({ customer });
};

export const createSubscription = async (req, res) => {
  const customerId = req.body.customerId;
  const priceId = req.body.priceId;
  const amount = req.body.amount;

  try {
    // Create the subscription. Note we're expanding the Subscription's
    // latest invoice and that invoice's payment_intent
    // so we can pass it to the front end to confirm the payment
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: priceId,
        },
      ],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
    });

    res.send({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    });
  } catch (error) {
    return res.status(400).send({ error: { message: error.message } });
  }
};
