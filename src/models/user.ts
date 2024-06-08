import mongoose from "mongoose";

const Schema = mongoose.Schema;

const User = mongoose.model("User", new Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
}));

export default User;
