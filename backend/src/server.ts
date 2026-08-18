// src/server.ts
//
// This is the only file that knows the app is "starting up." Its job is
// narrow: create the Express app, apply global middleware, mount every
// router under its base path, and start listening. No business logic,
// no route handlers, no data access — those belong to their own layers.

import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import trainerRoutes from "./routes/trainerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import contractRoutes from "./routes/contractRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import b2bRoutes from "./routes/b2bRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

// ---------------------------------------------------------------------
// Global middleware
// ---------------------------------------------------------------------

// CORS: allow only the configured frontend origin — never a wildcard when
// credentials (auth tokens) are involved (Handbook Section 12.3).
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// Parse JSON body payload
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use((req, _res, next) => {
  console.log(req.method, req.url);
  next();
});

// ---------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------

app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/trainer", trainerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/b2b", b2bRoutes);
app.use("/api/payment", paymentRoutes);

// ---------------------------------------------------------------------
// Health check — required by the Postman test table (Handbook Section 11)
// ---------------------------------------------------------------------

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// ---------------------------------------------------------------------
// 404 handler — anything that reached here matched no route above
// ---------------------------------------------------------------------
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "not_found" });
});

// ---------------------------------------------------------------------
// Centralized error handler — must be registered LAST, with 4 params,
// for Express to recognize it as an error handler.
// ---------------------------------------------------------------------
const errorHandler: express.ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, error: "internal_server_error" });
};

app.use(errorHandler);

// ---------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------
console.log("=== SERVER STARTED ===");
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});