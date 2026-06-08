"use strict";

const fs = require("fs").promises;
const path = require("path");
const { randomUUID } = require("crypto");

const FILE_PATH = path.join(__dirname, "../../../data/carts.json");

const readFile = async () => {
  try {
    const data = await fs.readFile(FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const writeFile = async (carts) => {
  await fs.writeFile(FILE_PATH, JSON.stringify(carts, null, 2));
};

class CartManagerFS {
  async create() {
    const carts = await readFile();
    const newCart = { id: randomUUID(), products: [] };
    carts.push(newCart);
    await writeFile(carts);
    return newCart;
  }

  async getById(id) {
    const carts = await readFile();
    return carts.find((c) => c.id === id) || null;
  }

  async addProduct(cartId, productId) {
    const carts = await readFile();
    const cart = carts.find((c) => c.id === cartId);
    if (!cart) return null;

    const existing = cart.products.find((p) => p.product === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.products.push({ product: productId, quantity: 1 });
    }
    await writeFile(carts);
    return cart;
  }

  async removeProduct(cartId, productId) {
    const carts = await readFile();
    const cart = carts.find((c) => c.id === cartId);
    if (!cart) return null;

    cart.products = cart.products.filter((p) => p.product !== productId);
    await writeFile(carts);
    return cart;
  }

  async updateProducts(cartId, products) {
    const carts = await readFile();
    const cart = carts.find((c) => c.id === cartId);
    if (!cart) return null;

    cart.products = products;
    await writeFile(carts);
    return cart;
  }

  async updateProductQuantity(cartId, productId, quantity) {
    const carts = await readFile();
    const cart = carts.find((c) => c.id === cartId);
    if (!cart) return null;

    const item = cart.products.find((p) => p.product === productId);
    if (!item) return null;

    item.quantity = quantity;
    await writeFile(carts);
    return cart;
  }

  async clearCart(cartId) {
    const carts = await readFile();
    const cart = carts.find((c) => c.id === cartId);
    if (!cart) return null;

    cart.products = [];
    await writeFile(carts);
    return cart;
  }
}

module.exports = CartManagerFS;
