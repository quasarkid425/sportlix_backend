import mongoose from "mongoose";

const giftCardSchema = new mongoose.Schema(
  {
    giftCardId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const GiftCard = mongoose.model("giftcard", giftCardSchema);
export default GiftCard;
