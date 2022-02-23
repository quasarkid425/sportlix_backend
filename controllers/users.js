import User from "../models/User.js";
import Order from "../models/Order.js";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";
import sgMail from "@sendgrid/mail";
import axios from "axios";
export const signup = (req, res) => {
  User.findOne({ email: req.body.email }).exec((err, user) => {
    if (user) {
      return res.status(400).json({
        error: "Email is taken",
      });
    }

    const { email, password, firstName, lastName } = req.body;
    const hashed_password = CryptoJS.AES.encrypt(
      password,
      process.env.CRYPTO_SECRET
    ).toString();
    const newUser = new User({
      firstName,
      lastName,
      hashed_password,
      email,
    });
    newUser.save((err, success) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }

      const token = jwt.sign(
        { _id: newUser._id, isAdmin: newUser.isAdmin },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );

      const { _id, firstName, lastName, email, isAdmin, cart } = newUser;
      return res.json({
        user: { _id, firstName, lastName, email, token, isAdmin, cart },
      });
    });
  });
};

export const login = (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email }).exec((err, user) => {
    if (!user) {
      return res
        .status(400)
        .json({ error: "User with that email does not exist. Please sign up" });
    }

    const bytes = CryptoJS.AES.decrypt(
      user.hashed_password,
      process.env.CRYPTO_SECRET
    );
    const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

    if (originalPassword !== password) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { _id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    const { _id, firstName, lastName, email, isAdmin, cart } = user;
    return res.json({
      user: { _id, firstName, lastName, email, isAdmin, cart, token },
    });
  });
};

export const forgot = (req, res) => {
  const email = req.body.email;
  User.findOne({ email }).exec((err, user) => {
    if (!user) {
      return res
        .status(400)
        .json({ error: "User with that email does not exist" });
    }

    res.status(200).json("Password reset link sent");

    const token = jwt.sign(
      {
        user_id: user._id,
        email: user._email,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    const resetLink = `${process.env.URL_CLIENT}/reset/${user.id}/${token}`;

    const msg = {
      to: `${email}`,
      subject: `Reset password for ${user.firstName}`,
      from: "quasarkid339203@gmail.com", //This will need to change
      templateId: "d-0da279a394cb4caa9a7e4130cd356a49",
      dynamicTemplateData: {
        firstName: `${user.firstName}`,
        resetLink: resetLink,
      },

      asm: {
        group_id: 16686,
        groups_to_display: [16686],
      },
    };

    sgMail.send(msg, (error, result) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Successfully sent..");
      }
    });
  });
};

export const reset = async (req, res) => {
  const { userId, password } = req.body;
  try {
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(400).json({ error: "No user found" });
    } else {
      user.hashed_password = CryptoJS.AES.encrypt(
        password,
        process.env.CRYPTO_SECRET
      ).toString();
      const updatedUser = await user.save();

      res.status(200).json(updatedUser);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const getUsersList = async (req, res) => {
  const PAGE_SIZE = 20;
  const page = parseInt(req.query.page || "0");
  const total = await User.countDocuments({});
  const orders = await Order.find({});

  try {
    const users = await User.find({})
      .limit(PAGE_SIZE)
      .skip(PAGE_SIZE * page)
      .sort({ updatedAt: -1 });

    res.status(200).json({
      totalPages: Math.ceil(total / PAGE_SIZE),
      users,
      orders,
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const saveCart = async (req, res) => {
  try {
    const user = await User.findById(req.body.user);
    if (user) {
      if (req.body.cart === 0) {
        console.log("working, empty");
        user.cart = [""];
        await user.save();
        return;
      } else {
        user.cart = req.body.cart;
        await user.save();
      }
    }
  } catch (error) {
    console.log(error);
  }
};
export const userInfo = async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findOne({ _id: userId });
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
  }
};

export const updateUserProfile = async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findOne({ _id: userId });
    if (req.body.firstName) {
      user.firstName = req.body.firstName;
      const updatedUser = await user.save();

      const token = jwt.sign(
        { _id: updatedUser._id, isAdmin: updatedUser.isAdmin },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );

      const { _id, firstName, lastName, email, isAdmin, cart } = updatedUser;

      res.status(200).json({
        user: { _id, firstName, lastName, email, isAdmin, cart, token },
      });
    }
    if (req.body.lastName) {
      user.lastName = req.body.lastName;
      const updatedUser = await user.save();

      const token = jwt.sign(
        { _id: updatedUser._id, isAdmin: updatedUser.isAdmin },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );

      const { _id, firstName, lastName, email, isAdmin, cart } = updatedUser;

      res.status(200).json({
        user: { _id, firstName, lastName, email, isAdmin, cart, token },
      });
    }
    if (req.body.email) {
      if (req.body.email !== user.email) {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
          res.status(400).json({ error: "Email already exists" });
        } else {
          user.email = req.body.email;
          const updatedUser = await user.save();

          const token = jwt.sign(
            { _id: updatedUser._id, isAdmin: updatedUser.isAdmin },
            process.env.JWT_SECRET,
            {
              expiresIn: "1d",
            }
          );

          const { _id, firstName, lastName, email, isAdmin, cart } =
            updatedUser;

          res.status(200).json({
            user: { _id, firstName, lastName, email, isAdmin, cart, token },
          });
        }
      } else {
        user.email = req.body.email;
        const updatedUser = await user.save();

        const token = jwt.sign(
          { _id: updatedUser._id, isAdmin: updatedUser.isAdmin },
          process.env.JWT_SECRET,
          {
            expiresIn: "1d",
          }
        );

        const { _id, firstName, lastName, email, isAdmin, cart } = updatedUser;

        res.status(200).json({
          user: { _id, firstName, lastName, email, isAdmin, cart, token },
        });
      }
    }
    if (req.body.password) {
      user.hashed_password = CryptoJS.AES.encrypt(
        req.body.password,
        process.env.CRYPTO_SECRET
      ).toString();
      const updatedUser = await user.save();

      const token = jwt.sign(
        { _id: updatedUser._id, isAdmin: updatedUser.isAdmin },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );

      const { _id, firstName, lastName, email, isAdmin, cart } = updatedUser;

      res.status(200).json({
        user: { _id, firstName, lastName, email, isAdmin, cart, token },
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export const userDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    user &&
      res.status(200).json({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });

    !user && res.status(404).json("No user found");
  } catch (error) {
    res.status(500).json("Something went wrong");
  }
};

export const getMiles = (req, res) => {
  const zipCode = req.params.zip;
  axios
    .get(
      `https://www.zipcodeapi.com/rest/${process.env.ZIPCODE_API}/distance.json/02464/${zipCode}/mile`
    )
    .then(({ data }) => {
      console.log(data);
      res.status(200).json(data);
    })
    .catch((err) => {
      console.log(err);
    });
};
