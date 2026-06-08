"use strict";

const { Router } = require("express");
const ProductManagerMongo = require("../dao/mongo/ProductManagerMongo");

const router = Router();
const manager = new ProductManagerMongo();

const buildLink = (req, page) => {
  const { limit = 10, query, sort } = req.query;
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("limit", limit);
  if (query) params.set("query", query);
  if (sort) params.set("sort", sort);
  return `${req.protocol}://${req.get("host")}/api/products?${params.toString()}`;
};

// GET /api/products
router.get("/", async (req, res, next) => {
  try {
    const { limit = 10, page = 1, query, sort } = req.query;
    const result = await manager.getAll({ limit, page, query, sort });

    res.json({
      status: "success",
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? buildLink(req, result.prevPage) : null,
      nextLink: result.hasNextPage ? buildLink(req, result.nextPage) : null,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:pid
router.get("/:pid", async (req, res, next) => {
  try {
    const product = await manager.getById(req.params.pid);
    if (!product)
      return res
        .status(404)
        .json({ status: "error", message: "Product not found" });
    res.json({ status: "success", payload: product });
  } catch (err) {
    next(err);
  }
});

// POST /api/products
router.post("/", async (req, res, next) => {
  try {
    const {
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnails,
    } = req.body;

    if (
      !title ||
      !description ||
      !code ||
      price == null ||
      stock == null ||
      !category
    ) {
      return res
        .status(400)
        .json({ status: "error", message: "Missing required fields" });
    }

    const product = await manager.create({
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnails,
    });

    const io = req.app.get("io");
    io.emit("productCreated", product);

    res.status(201).json({ status: "success", payload: product });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ status: "error", message: "Product code already exists" });
    }
    next(err);
  }
});

// PUT /api/products/:pid
router.put("/:pid", async (req, res, next) => {
  try {
    const updated = await manager.update(req.params.pid, req.body);
    if (!updated)
      return res
        .status(404)
        .json({ status: "error", message: "Product not found" });

    const io = req.app.get("io");
    io.emit("productUpdated", updated);

    res.json({ status: "success", payload: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:pid
router.delete("/:pid", async (req, res, next) => {
  try {
    const deleted = await manager.delete(req.params.pid);
    if (!deleted)
      return res
        .status(404)
        .json({ status: "error", message: "Product not found" });

    const io = req.app.get("io");
    io.emit("productDeleted", { id: req.params.pid });

    res.json({ status: "success", payload: deleted });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
