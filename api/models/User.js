import mongoose from "mongoose";
import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    min: 4,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    min: 8,
  },
});

const UserModel = model("UserModel", UserSchema);

export default UserModel;
