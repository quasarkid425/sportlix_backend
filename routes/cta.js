import express from "express";
import { submitDetails, submitMessage } from "../controllers/cta.js";

const ctaRouter = express.Router();

ctaRouter.post("/", submitDetails);
ctaRouter.post("/message", submitMessage);

export default ctaRouter;
