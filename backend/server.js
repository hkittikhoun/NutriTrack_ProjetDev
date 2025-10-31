const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const paymentRoutes = require("./routes/payement");

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Middleware pour Stripe webhooks (doit être avant express.json())
app.use("/api/webhook", express.raw({ type: "application/json" }));

// Middleware JSON pour les autres routes
app.use(express.json());

// Routes
app.use("/api", paymentRoutes);

// Route de test
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "NutriTrack Backend is running",
    timestamp: new Date().toISOString(),
  });
});

// Gestion d'erreurs globale
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// Route 404
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
