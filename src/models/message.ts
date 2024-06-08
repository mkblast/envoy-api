import mongoose from "mongoose";

const Schema = mongoose.Schema;

const Message = mongoose.model("Message", new Schema({
    body: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reciever: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now, required: true }
}));

export default Message;
