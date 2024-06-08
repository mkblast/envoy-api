import { Router } from "express";
import { hash } from "bcryptjs";
import { body, validationResult } from "express-validator";
import User from "../../models/user";

const Signup = Router();

Signup.post("/signup",
    body("first_name")
        .trim()
        .isLength({ min: 1 })
        .withMessage("First name field not be empty.")
        .isAlphanumeric()
        .withMessage("First name must be alphanumeric."),

    body("last_name")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Last name field not be empty.")
        .isAlphanumeric()
        .withMessage("Last name must be alphanumeric."),

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

            const { email, first_name, last_name, password } = req.body;

            const isUserExist = await User.findOne({ email }).exec();
            if (isUserExist) {
                return res.status(400).json({
                    status: "User sign up failed",
                    errors: [{ msg: "User already exist" }]
                });
            }

            const hashedPassword = await hash(password, 10);

            const user = new User({
                email,
                first_name,
                last_name,
                password: hashedPassword,
            });

            await user.save();

            return res.status(200).json({ status: "User created successfully", user });
        } catch (err) {
            next(err);
        }
    });

export { Signup };
