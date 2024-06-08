import { NextFunction, Request, Response, Router } from "express";
import User from "../../models/user";
import Message from "../../models/message";
import { body, validationResult } from "express-validator";
import { isValidObjectId } from "mongoose";

const Users = Router();

function validateId(req: Request, res: Response, next: NextFunction) {
    const isValid = isValidObjectId(req.params.userId);

    if (!isValid) {
        return res.status(400).json({
            status: "Query failed",
            errors: [{ msg: "Not a valid ID" }]
        });
    }

    return next();
}

Users.get("/users", async (req, res, next) => {
    try {
        const users = await User.find({}, "first_name last_name email").exec();

        return res.status(200).json({ status: "Query succeed.", users });
    } catch (err) {
        next(err);
    }
});

Users.get("/users/:userId/messages",
    validateId,

    async (req, res, next) => {
        try {
            const { userId } = req.params;

            const reciever = await User.findById(userId).exec();
            if (!reciever) {
                return res.status(404).json({
                    status: "Post Failed",
                    errors: [{ msg: "User not found." }]
                });
            }

            const messages = await Message.find({
                $or: [
                    { author: req.user?._id, reciever: userId },
                    { author: userId, reciever: req.user?._id }
                ]
            }).sort({ date: 1 }).exec();

            return res.status(200).json({ status: "Query succeed.", messages });

        } catch (err) {
            next(err);
        }
    }
);

Users.post("/users/:userId/messages",
    validateId,

    body("message")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Message must not empty."),

    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    status: "Field errors.",
                    errors: errors.array()
                });
            }

            const { userId } = req.params;

            const reciever = await User.findById(userId).exec();
            if (!reciever) {
                return res.status(404).json({
                    status: "Post Failed",
                    errors: [{ msg: "User not found." }]
                });
            }

            const message = new Message({
                body: req.body.message,
                author: req.user?._id,
                reciever: userId,
            });

            await message.save();

            return res.status(200).json({ status: "Message sent.", message });
        } catch (err) {
            next(err);
        }
    }
);

export default Users;
