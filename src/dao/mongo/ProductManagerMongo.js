"use strict";

const Product = require("../../models/product.model");

class ProductManagerMongo {
  async getAll({ limit = 10, page = 1, query, sort } = {}) {
    const filter = {};

    if (query) {
      // query can be a category string or "available"/"unavailable"
      if (query === "available") {
        filter.status = true;
      } else if (query === "unavailable") {
        filter.status = false;
      } else {
        filter.category = query;
      }
    }

    const options = {
      limit: parseInt(limit, 10),
      page: parseInt(page, 10),
      sort: sort ? { price: sort === "asc" ? 1 : -1 } : undefined,
      lean: true,
    };

    return Product.paginate(filter, options);
  }

  async getById(id) {
    return Product.findById(id).lean();
  }

  async create(productData) {
    const product = new Product(productData);
    return product.save();
  }

  async update(id, updates) {
    const { _id, ...safeUpdates } = updates;
    return Product.findByIdAndUpdate(id, safeUpdates, { new: true }).lean();
  }

  async delete(id) {
    return Product.findByIdAndDelete(id).lean();
  }
}

module.exports = ProductManagerMongo;
