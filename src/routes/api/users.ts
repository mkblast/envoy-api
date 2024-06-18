import { NextFunction, Request, Response, Router } from "express";
import User from "../../models/user";
import Message from "../../models/message";
import { body, validationResult } from "express-validator";
import { isValidObjectId } from "mongoose";


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

const Users = Router();

Users.get("/users", async (req, res, next) => {
    try {
        const users = await User.find({ _id: { $nin: [req.user?._id] } }, "first_name last_name").exec();

        return res.status(200).json({ status: "Query succeeded.", users });
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
                    status: "Query Failed",
                    errors: [{ msg: "User: not found." }]
                });
            }

            const messages = await Message.find({
                $or: [
                    { author: req.user?._id, reciever: userId },
                    { author: userId, reciever: req.user?._id }
                ]
            }).populate([
                { path: "author", select: "first_name last_name" },
                { path: "reciever", select: "first_name last_name" },
            ]).sort({ date: -1 }).exec();

            return res.status(200).json({ status: "Query succeeded.", messages });

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
                    errors: [{ msg: "User: not found." }]
                });
            }

            const message = new Message({
                body: req.body.message,
                author: req.user?._id,
                reciever: userId,
            });

            await Promise.all([
                message.save(),
                message.populate([
                    { path: "author", select: "first_name last_name" },
                    { path: "reciever", select: "first_name last_name" },
                ])
            ]);

            return res.status(200).json({ status: "Message sent.", message });
        } catch (err) {
            next(err);
        }
    }
);

export { Users };
