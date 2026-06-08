"use strict";

const socket = io();

const wsStatus = document.getElementById("ws-status");
const banner = document.getElementById("realtime-banner");

socket.on("connect", () => {
  if (wsStatus) {
    wsStatus.textContent = "WS: connected";
    wsStatus.classList.remove("disconnected");
  }
});

socket.on("disconnect", () => {
  if (wsStatus) {
    wsStatus.textContent = "WS: disconnected";
    wsStatus.classList.add("disconnected");
  }
});

socket.on("productCreated", (product) => {
  const list = document.getElementById("product-list");
  if (list) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.id = `product-${product._id}`;
    card.innerHTML = `
            <h3><a href="/products/${product._id}">${product.title}</a></h3>
            <span class="category">${product.category}</span>
            <span class="price">$${product.price}</span>
            <span class="stock">Stock: ${product.stock}</span>
            <div class="actions">
                <a href="/products/${product._id}" class="btn btn-primary">Details</a>
            </div>`;
    list.prepend(card);
  }
  showBanner();
});

socket.on("productUpdated", (product) => {
  const card = document.getElementById(`product-${product._id}`);
  if (card) {
    card.querySelector("h3 a").textContent = product.title;
    card.querySelector(".category").textContent = product.category;
    card.querySelector(".price").textContent = `$${product.price}`;
    card.querySelector(".stock").textContent = `Stock: ${product.stock}`;
  }
  showBanner();
});

socket.on("productDeleted", ({ id }) => {
  const card = document.getElementById(`product-${id}`);
  if (card) card.remove();
  showBanner();
});

function showBanner() {
  if (banner) {
    banner.style.display = "block";
    banner.querySelector("a").href = window.location.href;
  }
}
