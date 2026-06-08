"use strict";

const { Router } = require("express");
const CartManagerMongo = require("../dao/mongo/CartManagerMongo");

const router = Router();
const manager = new CartManagerMongo();

// POST /api/carts
router.post("/", async (req, res, next) => {
  try {
    const cart = await manager.create();
    res.status(201).json({ status: "success", payload: cart });
  } catch (err) {
    next(err);
  }
});

// GET /api/carts/:cid
router.get("/:cid", async (req, res, next) => {
  try {
    const cart = await manager.getById(req.params.cid);
    if (!cart)
      return res
        .status(404)
        .json({ status: "error", message: "Cart not found" });
    res.json({ status: "success", payload: cart });
  } catch (err) {
    next(err);
  }
});

// POST /api/carts/:cid/products/:pid
router.post("/:cid/products/:pid", async (req, res, next) => {
  try {
    const cart = await manager.addProduct(req.params.cid, req.params.pid);
    if (!cart)
      return res
        .status(404)
        .json({ status: "error", message: "Cart not found" });
    res.json({ status: "success", payload: cart });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/carts/:cid/products/:pid
router.delete("/:cid/products/:pid", async (req, res, next) => {
  try {
    const cart = await manager.removeProduct(req.params.cid, req.params.pid);
    if (!cart)
      return res
        .status(404)
        .json({ status: "error", message: "Cart or product not found" });
    res.json({ status: "success", payload: cart });
  } catch (err) {
    next(err);
  }
});

// PUT /api/carts/:cid  — replace all products
router.put("/:cid", async (req, res, next) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products)) {
      return res
        .status(400)
        .json({ status: "error", message: "products must be an array" });
    }
    const cart = await manager.updateProducts(req.params.cid, products);
    if (!cart)
      return res
        .status(404)
        .json({ status: "error", message: "Cart not found" });
    res.json({ status: "success", payload: cart });
  } catch (err) {
    next(err);
  }
});

// PUT /api/carts/:cid/products/:pid — update quantity only
router.put("/:cid/products/:pid", async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (quantity == null || isNaN(quantity) || quantity < 1) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid quantity" });
    }
    const cart = await manager.updateProductQuantity(
      req.params.cid,
      req.params.pid,
      parseInt(quantity, 10),
    );
    if (!cart)
      return res
        .status(404)
        .json({ status: "error", message: "Cart or product not found" });
    res.json({ status: "success", payload: cart });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/carts/:cid — clear cart
router.delete("/:cid", async (req, res, next) => {
  try {
    const cart = await manager.clearCart(req.params.cid);
    if (!cart)
      return res
        .status(404)
        .json({ status: "error", message: "Cart not found" });
    res.json({ status: "success", payload: cart });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
