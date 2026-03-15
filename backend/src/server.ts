import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// Auth middleware now available

import authRoutes from "./routes/authRoutes";
import sweetsRoutes from "./routes/sweetsRoutes";
import ordersRoutes from "./routes/ordersRoutes";
import configRoutes from "./routes/configRoutes";
import storeRoutes from "./routes/storeRoutes";

import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/sweets", sweetsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/merchant-configs", configRoutes);

// Root health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "Rohit Sweets Backend" });
});

// Error Handling Middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`🚀 Backend running at http://localhost:${port}`);
});
