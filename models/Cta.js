import mongoose from "mongoose";

const ctaSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    where: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const Cta = mongoose.model("cta", ctaSchema);
export default Cta;
