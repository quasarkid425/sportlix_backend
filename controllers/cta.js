import Cta from "../models/Cta.js";
import Message from "../models/Message.js";
import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const submitDetails = async (req, res) => {
  const { name: fullName, email, where } = req.body;

  const findEmail = await Cta.find({ email: email });

  const [firstName, lastName] = fullName.split(" ");

  if (findEmail.length === 1) {
    return res
      .status(404)
      .json("Email already submitted. Please submit a unique email...");
  }
  try {
    await Cta.create({
      fullName,
      email,
      where,
    });
    res
      .status(201)
      .json("Successfully submitted. We will be in touch with you shortly..");

    const msg = {
      to: `${email}`,
      subject: "Thanks for reaching out!",
      from: "quasarkid339203@gmail.com", //This will need to change
      templateId: "d-690af71dc9584bca8ee24aec64108b02",
      dynamicTemplateData: {
        firstName: `${firstName}`,
      },
      asm: {
        group_id: 16685,
        groups_to_display: [16685],
      },
    };
    sgMail.send(msg, (error, result) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Successfully sent..");
      }
    });

    // send email here to you to notify yourself
  } catch (error) {
    console.log("server");
    res.status(500).json(error.message);
  }
};

export const submitMessage = async (req, res) => {
  const { email, name, message } = req.body;
  const [first] = name.split(" ");

  await Message.create({
    name,
    email,
    message,
  });

  const msg = {
    to: `${email}`,
    subject: "Thanks for reaching out!",
    from: "quasarkid339203@gmail.com", //This will need to change
    templateId: "d-690af71dc9584bca8ee24aec64108b02",
    dynamicTemplateData: {
      firstName: `${first}`,
    },
    asm: {
      group_id: 16685,
      groups_to_display: [16685],
    },
  };
  sgMail.send(msg, (error, result) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Successfully sent..");
    }
  });

  // send email here to you to notify yourself

  try {
    res.status(200).json("Message submitted successfully..");
  } catch (error) {
    console.log(error);
  }
};
