import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderItems: [
      {
        name: { type: String, required: true },
        slug: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        giftCardUids: { type: Array },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        type: {
          type: String,
        },

        category: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
        },
        cloudinaryId: {
          type: String,
        },
      },
    ],
    shippingAddress: {
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      deliveryInstructions: { type: String },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },

    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    registeredUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    user: { type: String, required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date, default: () => Date.now() },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
  },
  {
    timestamps: true,
  }
);
const Order = mongoose.model("Order", orderSchema);
export default Order;
