"use strict";

const path = require("path");
require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { engine } = require("express-handlebars");

const connectDB = require("./src/config/db");
const productsRouter = require("./src/routes/products.router");
const cartsRouter = require("./src/routes/carts.router");
const viewsRouter = require("./src/routes/views.router");

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);

// ── Handlebars ──────────────────────────────────────────────────────────────
app.engine(
  "handlebars",
  engine({
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "src/views/layouts"),
    helpers: {
      multiply: (a, b) => (Number(a) * Number(b)).toFixed(2),
      eq: (a, b) => a === b,
    },
  }),
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "src/views"));

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "src/public")));

// ── Socket.io ────────────────────────────────────────────────────────────────
app.set("io", io);

io.on("connection", (socket) => {
  console.log(`[WS] client connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`[WS] client disconnected: ${socket.id}`);
  });
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

// ── Error handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ status: "error", message: err.message || "Internal server error" });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8080;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
