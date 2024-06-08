import { Router } from "express";
import User from "../../models/user";
import { body, validationResult } from "express-validator";

const Me = Router();

Me.get("/me", async (req, res, next) => {
    try {
        const { _id } = req.user!;

        const me = await User.findById({ _id }).exec();

        return res.status(200).json({ status: "Query succeeded.", me });
    } catch (err) {
        next(err);
    }
});

Me.put("/me",
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

    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    status: "Field errors.",
                    errors: errors.array()
                });
            }

            const { _id } = req.user!;

            const user = await User.findById(_id).exec();
            if (!user) {
                return res.status(404).json({
                    status: "Post Failed",
                    errors: [{ msg: "User not found." }]
                });
            }

            const { first_name, last_name } = req.body;

            const updated = await User.findOneAndUpdate(
                { _id },
                { first_name, last_name }
            ).exec();

            return res.status(200).json({ status: "Update succeeded", user: updated });
        } catch (err) {
            next(err);
        }
    }
);

export { Me };
