import { User } from "../Models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hassedPas = bcrypt.hashSync(password, 10, (err, next) => {
      if (err) {
        console.log(err);
      } else {
        next();
      }
    });
    const user = await User.create({ username, email, password: hassedPas });
    res.status(404).redirect("/login");
  } catch (error) {

    let errors2 = {};

    if (error.name === "ValidationError") {
      Object.keys(error.errors).forEach((key) => {
        errors2[key] = error.errors[key].message;
      });
    }

    console.log(errors2);

    res.json({
      succeded:false,
      error,
    });
  }
};

export const loginUser = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (user) {
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      const token = createToken(user._id);
      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
      });

      res.redirect("/users/dashboard");
    } else {
      res.json({ message: "shifre yanlishdir" });
    }
  } else {
    res.status(401).json({
      message: "error",
    });
  }
};

const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

export const getDashboardPage = (req, res) => {
  res.render("dashboard", { link: "dashboard" });
};
