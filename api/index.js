import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import UserModel from "./models/User.js";
import PostModel from "./models/Post.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import multer from "multer";
import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';


const uploadMiddleware = multer({ dest: 'uploads/'})

const app = express();
app.use(express.json());
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(cookieParser());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(__dirname + '/uploads'));

const salt = bcrypt.genSaltSync(10);
const secret = "b432bknjsdnaskd862bxsdbhagsckhdskudkjghasab";

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await UserModel.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (error) {
    res.status(400).json(error);
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const userDoc = await UserModel.findOne({ username });
  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (passOk) {
    jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
      if (err) throw err;
      res.cookie("token", token).json({
        id:userDoc._id,
        username,
      });
    });
  } else {
    res.status(400).json("wrong credentials");
  }

});

app.get("/profile", (req,res) => {
  const {token} = req.cookies;
  jwt.verify(token, secret, {}, (err,info) => {
    if(err) throw err;
    res.json(info);
  })
})

app.post('/logout', (req,res) => {
  res.cookie('token', '').json('ok');
})

app.post('/post', uploadMiddleware.single('file'), async (req,res)=>{
  const {originalname,path} = req.file;
  const parts = originalname.split('.');
  const ext = parts[parts.length - 1];
  const newPath = path+'.'+ext;
  fs.renameSync(path, newPath);

  const {token} = req.cookies;
  jwt.verify(token, secret, {}, async (err,info) => {
    if(err) throw err;
    const {title,summary,content} = req.body;
    const postDoc = await PostModel.create({
      title,
      summary,
      content,
      cover:newPath,
      author:info.id,
    })
  
    res.json(postDoc);
  })
})

app.get('/post', async (req,res)=>{

  res.json(
    await PostModel.find()
      .populate('author', ['username'])
      .sort({createdAt: -1})
      .limit(50)
  )
})

app.put('/post',uploadMiddleware.single('file'), async (req,res) => {
  let newPath = null;
  if (req.file) {
    const {originalname,path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    newPath = path+'.'+ext;
    fs.renameSync(path, newPath);
  }

  const {token} = req.cookies;
  jwt.verify(token, secret, {}, async (err,info) => {
    if (err) throw err;
    const {id,title,summary,content} = req.body;
    const postDoc = await PostModel.findById(id);
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    if (!isAuthor) {
      return res.status(400).json('you are not the author');
    }
    await postDoc.updateOne({
      title,
      summary,
      content,
      cover: newPath ? newPath : postDoc.cover,
    });

    res.json(postDoc);
  });

});

app.get('/post/:id', async (req,res) => {
  const {id} = req.params;
  const postDoc = await PostModel.findById(id).populate('author',['username']);
  res.json(postDoc);
})

app.listen(4000, async () => {
  await mongoose.connect(
    process.env.mongoDBURL;
  );
  console.log("database connected");
});
