import express, { Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import employeeRoutes from './routes/employeeRoutes';
import adminRoutes from './routes/adminRoutes';
import userRoutes from './routes/userRoutes';
import leaveRequestRoutes from './routes/leaveRequestRoutes';
import departmentRoutes from './routes/departmentRoutes';
import User from "./models/User";

dotenv.config();
const app = express();

// ✅ Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());

// ✅ API Routes
app.use('/api/employee', employeeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leave-requests', leaveRequestRoutes);
app.use('/api/departments', departmentRoutes);

// ✅ Health check
app.get("/", (_req: Request, res: Response) => {
  res.send("🚀 API is live — Employee Leave Management System");
});

// ✅ MongoDB Connection
const PORT = process.env.PORT || 7000;
const MONGOURL = process.env.MONGO_URI || "";

mongoose.connect(MONGOURL)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Simple Login Route (note: replace with secure bcrypt + session/token in production)
app.post("/api/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🔐 WARNING: Insecure password check. Use bcrypt in production!
    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1d" }
    );

    res.status(200).json({
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Fallback for undefined routes
app.all('*', (req, res) => {
  console.log(`❌ 404 - Not Found: ${req.originalUrl}`);
  res.status(404).json({ message: 'Route not found' });
});
