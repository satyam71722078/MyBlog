import { Schema, model } from "mongoose";

const PostSchema = new Schema(
  {
    title: String,
    summary: String,
    content: String,
    cover: String,
    author:{
      type:Schema.Types.ObjectId,
      ref:'UserModel'
    }
  },
  {
    timestamps: true,
  }
);

const PostModel = model("PostModel", PostSchema);

export default PostModel;
