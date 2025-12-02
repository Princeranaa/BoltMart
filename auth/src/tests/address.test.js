const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../models/User.Model");
const jwt = require("jsonwebtoken");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGO_URI = uri;
  process.env.JWT_SECRET = "secret";
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Address API", () => {
  let token;
  let userId;

  beforeEach(async () => {
    await User.deleteMany({});

    // Create a user and generate token
    const user = await User.create({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      fullName: { firstname: "Test", lastname: "User" },
    });
    userId = user._id;

    token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
  });

  describe("GET /api/auth/users/me/addresses", () => {
    it("should return empty list of addresses initially", async () => {
      const response = await request(app)
        .get("/api/auth/users/me/addresses")
        .set("Cookie", [`token=${token}`]);

      expect(response.status).toBe(200);
      expect(response.body.addresses).toEqual([]);
    });
  });

  describe("POST /api/auth/users/me/addresses", () => {
    it("should add a new address successfully", async () => {
      const addressData = {
        street: "123 Main St",
        city: "Test City",
        state: "Test State",
        country: "Test Country",
        zip: "123456",
        isDefault: true,
      };

      const response = await request(app)
        .post("/api/auth/users/me/addresses")
        .set("Cookie", [`token=${token}`])
        .send(addressData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Address added successfully");
      expect(response.body.addresses).toHaveLength(1);
      expect(response.body.addresses[0].street).toBe(addressData.street);
      expect(response.body.addresses[0].isDefault).toBe(true);
    });

    it("should fail validation if required fields are missing", async () => {
      const addressData = {
        street: "123 Main St",
        // Missing other fields
      };

      const response = await request(app)
        .post("/api/auth/users/me/addresses")
        .set("Cookie", [`token=${token}`])
        .send(addressData);

      expect(response.status).toBe(400);
    });


  });

  describe("DELETE /api/auth/users/me/addresses/:addressId", () => {
    it("should delete an address", async () => {
      // Add an address first
      const user = await User.findById(userId);
      user.addresses.push({
        street: "123 Main St",
        city: "Test City",
        state: "Test State",
        country: "Test Country",
        zip: "123456",
       
      });
      await user.save();
      const addressId = user.addresses[0]._id;

      const response = await request(app)
        .delete(`/api/auth/users/me/addresses/${addressId}`)
        .set("Cookie", [`token=${token}`]);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Address deleted successfully");
      expect(response.body.addresses).toHaveLength(0);
    });
  });
});
