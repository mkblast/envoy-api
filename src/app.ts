import User from "./models/user";
import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import passport from "passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { SignupRouter, LoginRouter } from "./routes/auth";
import { UsersRouter, MeRouter } from "./routes/api";

dotenv.config();

passport.use(
    new Strategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET!,
        },

        async (jwt_payload, done) => {
            try {
                const user = await User.findById(jwt_payload.id).exec();

                if (user) {
                    return done(null, user);
                }

                return done(null, false);
            } catch (err) {
                return done(err, false);
            }
        }

    )
);

const mongoDB = process.env.MONGODB_URI;

async function main() {
    await mongoose.connect(mongoDB!);
}

main().catch(e => console.log(e));

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors());

app.use("/auth", SignupRouter, LoginRouter);

app.use("/api/*",
    passport.authenticate("jwt", { session: false, failWithError: true }),
    (err: ResError, req: Request, res: Response, next: NextFunction) => {
        return res.status(401).json({
            status: err.name,
            errors: [{ msg: err.message }]
        });
    },
);

app.use("/api", UsersRouter, MeRouter);

app.use((err: ResError, req: Request, res: Response) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    res.status(err.status || 500).json("Server Error");
});

app.listen(3000, () => console.log("Server started at port 3000"));
