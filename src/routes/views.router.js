"use strict";

const { Router } = require("express");
const ProductManagerMongo = require("../dao/mongo/ProductManagerMongo");
const CartManagerMongo = require("../dao/mongo/CartManagerMongo");

const router = Router();
const productManager = new ProductManagerMongo();
const cartManager = new CartManagerMongo();

// GET /
router.get("/", (req, res) => {
  res.redirect("/products");
});

// GET /products
router.get("/products", async (req, res, next) => {
  try {
    const { limit = 10, page = 1, query, sort } = req.query;
    const result = await productManager.getAll({ limit, page, query, sort });

    const buildLink = (p) => {
      const params = new URLSearchParams();
      params.set("page", p);
      params.set("limit", limit);
      if (query) params.set("query", query);
      if (sort) params.set("sort", sort);
      return `/products?${params.toString()}`;
    };

    res.render("products", {
      products: result.docs,
      totalPages: result.totalPages,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? buildLink(result.prevPage) : null,
      nextLink: result.hasNextPage ? buildLink(result.nextPage) : null,
      query: query || "",
      sort: sort || "",
    });
  } catch (err) {
    next(err);
  }
});

// GET /products/:pid
router.get("/products/:pid", async (req, res, next) => {
  try {
    const product = await productManager.getById(req.params.pid);
    if (!product)
      return res.status(404).render("404", { message: "Product not found" });
    res.render("productDetail", { product });
  } catch (err) {
    next(err);
  }
});

// GET /carts
router.get("/carts", (req, res) => {
  res.render("cartLookup");
});

// GET /carts/:cid
router.get("/carts/:cid", async (req, res, next) => {
  try {
    const cart = await cartManager.getById(req.params.cid);
    if (!cart)
      return res.status(404).render("404", { message: "Cart not found" });
    res.render("cart", { cart });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
