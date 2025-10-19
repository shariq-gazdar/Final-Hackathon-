import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// --- Mongoose Schemas ---
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const chatSchema = new mongoose.Schema(
  {
    userId: String,
    reportName: String,
    message: String,
    response: String,
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
const Chat = mongoose.model("Chat", chatSchema);

// --- MongoDB Connect ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// --- Google Gemini AI Client ---
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- Routes ---

// Register
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed });
    await user.save();
    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Protected route
app.get("/api/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    res.json({ user });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

// Save chat
// Save chat to MongoDB
app.post("/chat/save", upload.single("file"), async (req, res) => {
  try {
    const { userId, reportName, prompt, message, response } = req.body;

    if (!userId) return res.status(400).json({ error: "userId is required" });

    const chat = new Chat({
      userId,
      reportName,
      message: message || prompt,
      response,
    });

    await chat.save();
    res.status(201).json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Save chat failed" });
  }
});

// Get chat history
app.get("/api/chat/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { report } = req.query;
    const filter = { userId };
    if (report) filter.reportName = report;
    const chats = await Chat.find(filter).sort({ createdAt: 1 });
    res.json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

// Gemini AI analyze (text + optional file)
app.post("/api/gemini-analyze", upload.single("file"), async (req, res) => {
  try {
    const { prompt } = req.body;
    const file = req.file;
    const contents = [];

    if (file) {
      const base64File = file.buffer.toString("base64");
      contents.push({
        inlineData: {
          mimeType: file.mimetype,
          data: base64File,
        },
      });
      // You can also add a guiding instruction for the AI
      contents.push({ text: "Explain this report in simple words." });
    }

    if (prompt) {
      contents.push({ text: prompt });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });

    res.json({ response: response.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gemini analyze failed" });
  }
});

// Start server
app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
