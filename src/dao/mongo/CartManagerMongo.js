"use strict";

const Cart = require("../../models/cart.model");

class CartManagerMongo {
  async create() {
    const cart = new Cart({ products: [] });
    return cart.save();
  }

  async getById(id) {
    return Cart.findById(id).populate("products.product").lean();
  }

  async addProduct(cartId, productId) {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;

    const existing = cart.products.find(
      (p) => p.product.toString() === productId,
    );
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.products.push({ product: productId, quantity: 1 });
    }

    await cart.save();
    return Cart.findById(cartId).populate("products.product").lean();
  }

  async removeProduct(cartId, productId) {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;

    cart.products = cart.products.filter(
      (p) => p.product.toString() !== productId,
    );
    await cart.save();
    return Cart.findById(cartId).populate("products.product").lean();
  }

  async updateProducts(cartId, products) {
    return Cart.findByIdAndUpdate(cartId, { products }, { new: true })
      .populate("products.product")
      .lean();
  }

  async updateProductQuantity(cartId, productId, quantity) {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;

    const item = cart.products.find((p) => p.product.toString() === productId);
    if (!item) return null;

    item.quantity = quantity;
    await cart.save();
    return Cart.findById(cartId).populate("products.product").lean();
  }

  async clearCart(cartId) {
    return Cart.findByIdAndUpdate(
      cartId,
      { products: [] },
      { new: true },
    ).lean();
  }
}

module.exports = CartManagerMongo;
