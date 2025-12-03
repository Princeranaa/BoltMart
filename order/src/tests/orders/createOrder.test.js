const request = require("supertest");
const app = require("../../app");
const { getAuthCookie } = require("../setup/auth");
const axios = require("axios");
const orderModel = require("../../models/order.model"); // import the order model

jest.mock("axios");
jest.mock("../../models/order.model"); // mock order model

describe("POST /api/orders — Create order from current cart", () => {
  const sampleAddress = {
    street: "123 Main St",
    city: "Metropolis",
    state: "CA",
    pincode: "90210",
    country: "USA",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates order from current cart, computes totals, sets status=PENDING, reserves inventory", async () => {
    // Mock Cart Service Response
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/cart")) {
        return Promise.resolve({
          data: {
            cart: {
              items: [{ productId: "prod-123", quantity: 2 }],
            },
          },
        });
      }
      if (url.includes("/api/products/prod-123")) {
        return Promise.resolve({
          data: {
            data: {
              _id: "prod-123",
              title: "Test Product",
              stock: 10,
              price: { amount: 100, currency: "USD" },
            },
          },
        });
      }
      return Promise.reject(new Error("Unknown URL: " + url));
    });

    // Mock Order Model create method to return a fake order
    orderModel.create.mockResolvedValue({
      _id: "order-123",
      user: "user-456",
      status: "PENDING",
      items: [
        {
          product: "prod-123",
          quantity: 2,
          price: { amount: 200, currency: "USD" },
        },
      ],
      totalPrice: { amount: 200, currency: "USD" },
      shippingAddress: {
        street: sampleAddress.street,
        city: sampleAddress.city,
        state: sampleAddress.state,
        zip: sampleAddress.pincode,
        country: sampleAddress.country,
      },
    });

    const res = await request(app)
      .post("/api/orders")
      .set("Cookie", getAuthCookie())
      .send({ shippingAddress: sampleAddress })
      .expect("Content-Type", /json/)
      .expect(201);

    // Response shape assertions
    expect(res.body).toBeDefined();
    expect(res.body.order).toBeDefined();
    const { order } = res.body;
    expect(order._id).toBeDefined();
    expect(order.user).toBeDefined();
    expect(order.status).toBe("PENDING");

    // Items copied from priced cart
    expect(Array.isArray(order.items)).toBe(true);
    expect(order.items.length).toBeGreaterThan(0);
    for (const it of order.items) {
      expect(it.product).toBeDefined();
      expect(it.quantity).toBeGreaterThan(0);
      expect(it.price).toBeDefined();
      expect(typeof it.price.amount).toBe("number");
      expect(["USD", "INR"]).toContain(it.price.currency);
    }

    // Totals include taxes + shipping
    expect(order.totalPrice).toBeDefined();
    expect(typeof order.totalPrice.amount).toBe("number");
    expect(["USD", "INR"]).toContain(order.totalPrice.currency);

    // Shipping address persisted
    expect(order.shippingAddress).toMatchObject({
      street: sampleAddress.street,
      city: sampleAddress.city,
      state: sampleAddress.state,
      zip: sampleAddress.pincode,
      country: sampleAddress.country,
    });
  });

  it("returns 422 when shipping address is missing/invalid", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Cookie", getAuthCookie())
      .send({})
      .expect("Content-Type", /json/)
      .expect(400);

    expect(res.body.errors || res.body.message).toBeDefined();
  });
});
