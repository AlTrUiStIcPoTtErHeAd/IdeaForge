require("dotenv").config({ override: true });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth");
const problemRoutes = require("./routes/problems");
const solutionRoutes = require("./routes/solutions");
const aiRoutes = require("./routes/ai");
const userRoutes = require("./routes/users");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true },
});

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());

// Attach io to req so routes can emit events
app.use((req, _res, next) => { req.io = io; next(); });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/solutions", solutionRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/users", userRoutes);

app.get("/", (_req, res) => res.json({ message: "IdeaForge API running" }));

// Socket.io
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("join-problem", (problemId) => socket.join(problemId));
  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/ideaforge")
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));
