"use strict";

const fs = require("fs").promises;
const path = require("path");
const { randomUUID } = require("crypto");

const FILE_PATH = path.join(__dirname, "../../../data/products.json");

const readFile = async () => {
  try {
    const data = await fs.readFile(FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const writeFile = async (products) => {
  await fs.writeFile(FILE_PATH, JSON.stringify(products, null, 2));
};

class ProductManagerFS {
  async getAll() {
    return readFile();
  }

  async getById(id) {
    const products = await readFile();
    return products.find((p) => p.id === id) || null;
  }

  async create(productData) {
    const products = await readFile();
    const newProduct = {
      id: randomUUID(),
      status: true,
      thumbnails: [],
      ...productData,
    };
    products.push(newProduct);
    await writeFile(products);
    return newProduct;
  }

  async update(id, updates) {
    const products = await readFile();
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const { id: _ignored, ...safeUpdates } = updates;
    products[idx] = { ...products[idx], ...safeUpdates };
    await writeFile(products);
    return products[idx];
  }

  async delete(id) {
    const products = await readFile();
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const [removed] = products.splice(idx, 1);
    await writeFile(products);
    return removed;
  }
}

module.exports = ProductManagerFS;
