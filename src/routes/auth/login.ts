import { Router } from "express";
import User from "../../models/user";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { body, validationResult } from "express-validator";

const Login = Router();

Login.post("/login",
    body("email")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Email field not be empty.")
        .isEmail()
        .withMessage("Must be a valid email."),

    body("password")
        .trim()
        .isLength({ min: 1 })
        .withMessage("password field not be empty."),

    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ status: "Field errors.", errors: errors.array() });
            }

            const { email, password } = req.body;

            const user = await User.findOne({ email }).exec();

            if (!user) {
                return res.status(401).json({
                    status: "Log in failed",
                    errors: [{ msg: "User not found" }]
                });
            }

            const match = await compare(password, user.password);

            if (!match) {
                return res.status(401).json({
                    status: "Log in failed",
                    errors: [{ msg: "Password incorrect" }]
                });
            }

            const JWTSecret = process.env.JWT_SECRET;

            const token = sign(
                { id: user._id },
                JWTSecret!,
                { expiresIn: 60 * 60 * 24 * 30 }
            );

            return res.status(200).json({ status: "Log in succeeded", token });

        } catch (err) {
            next(err);
        }
    });

export { Login };
