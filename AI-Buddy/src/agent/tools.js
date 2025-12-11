const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const axios = require("axios");

const searchProduct = tool(
  async ({ query, token }) => {
    const res = await axios.get(
      `http://localhost:3001/api/products?q=${query}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return res.data;
  },
  {
    name: "searchProduct",
    description: "Search products in the catalog",
    inputSchema: z.object({
      query: z.string().describe("Product search text"),
    }),
  }
);

const addProductToCart = tool(
  async ({ productId, qty, token }) => {
    await axios.post(
      "http://localhost:3003/api/cart/items",
      { productId, qty },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return { message: "Product added to cart", productId, qty };
  },
  {
    name: "addProductToCart",
    description: "Add a product to shopping cart",
    inputSchema: z.object({
      productId: z.string().describe("ID of the product"),
      qty: z.number().default(1).describe("Quantity"),
    }),
  }
);

module.exports = { searchProduct, addProductToCart };
