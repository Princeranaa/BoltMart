const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../models/User.Model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGO_URI = uri;
  process.env.JWT_SECRET = "test-secret-key";
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("GET /api/auth/me", () => {
  let testUser;
  let validToken;

  beforeEach(async () => {
    // Clean up database before each test
    await User.deleteMany({});

    // Create a test user
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);
    testUser = await User.create({
      username: "testuser",
      email: "test@example.com",
      password: hashedPassword,
      fullName: {
        firstname: "Test",
        lastname: "User",
      },
      role: "user",
      addresses: [
        {
          street: "123 Main St",
          city: "Test City",
          state: "Test State",
          country: "Test Country",
          zip: "12345",
        },
      ],
    });

    // Generate a valid JWT token for the test user
    validToken = jwt.sign(
      {
        id: testUser._id,
        username: testUser.username,
        email: testUser.email,
        role: testUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
  });

  describe("Success Cases", () => {
    it("should return user data when valid token is provided in Authorization header", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("id");
      expect(response.body.user).toHaveProperty("username", "testuser");
      expect(response.body.user).toHaveProperty("email", "test@example.com");
      expect(response.body.user).toHaveProperty("role", "user");
      expect(response.body.user).not.toHaveProperty("password");
    });

    it("should return user data when valid token is provided in cookie", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Cookie", [`token=${validToken}`]);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("username", "testuser");
      expect(response.body.user).toHaveProperty("email", "test@example.com");
    });

    it("should return complete user profile including addresses", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty("addresses");
      expect(Array.isArray(response.body.user.addresses)).toBe(true);
      expect(response.body.user.addresses.length).toBeGreaterThan(0);
      expect(response.body.user.addresses[0]).toHaveProperty(
        "street",
        "123 Main St"
      );
      expect(response.body.user.addresses[0]).toHaveProperty(
        "city",
        "Test City"
      );
    });

    it("should return user with seller role correctly", async () => {
      // Create a seller user
      const sellerPassword = "sellerpass123";
      const hashedSellerPassword = await bcrypt.hash(sellerPassword, 10);
      const sellerUser = await User.create({
        username: "selleruser",
        email: "seller@example.com",
        password: hashedSellerPassword,
        fullName: {
          firstname: "Seller",
          lastname: "User",
        },
        role: "seller",
      });

      const sellerToken = jwt.sign(
        {
          id: sellerUser._id,
          username: sellerUser.username,
          email: sellerUser.email,
          role: sellerUser.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${sellerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty("role", "seller");
    });

    it("should return user data with fullName object", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty("fullName");
      expect(response.body.user.fullName).toHaveProperty("firstname", "Test");
      expect(response.body.user.fullName).toHaveProperty("lastname", "User");
    });
  });

  describe("Authentication Failure Cases", () => {
    it("should return 401 when no token is provided", async () => {
      const response = await request(app).get("/api/auth/me");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toMatch(
        /unauthorized|token|authentication/i
      );
    });

    it("should return 401 when invalid token is provided", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-token-string");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toMatch(/invalid|token/i);
    });

    it("should return 401 when expired token is provided", async () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        {
          id: testUser._id,
          username: testUser.username,
          email: testUser.email,
          role: testUser.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "-1h" } // Expired 1 hour ago
      );

      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toMatch(/expired|token/i);
    });

    it("should return 401 when token is signed with wrong secret", async () => {
      // Create a token with wrong secret
      const wrongSecretToken = jwt.sign(
        {
          id: testUser._id,
          username: testUser.username,
          email: testUser.email,
          role: testUser.role,
        },
        "wrong-secret-key",
        { expiresIn: "1d" }
      );

      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${wrongSecretToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
    });

    it("should return 401 when malformed Authorization header is provided", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", validToken); // Missing "Bearer" prefix

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
    });

    it("should return 401 when empty token is provided", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer ");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("User Not Found Cases", () => {
    it("should return 404 when user from token does not exist in database", async () => {
      // Create a token for a non-existent user
      const nonExistentUserId = new mongoose.Types.ObjectId();
      const tokenForNonExistentUser = jwt.sign(
        {
          id: nonExistentUserId,
          username: "nonexistent",
          email: "nonexistent@example.com",
          role: "user",
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${tokenForNonExistentUser}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toMatch(/user.*not.*found/i);
    });

    it("should return 404 when user has been deleted after token was issued", async () => {
      // Delete the user after token was created
      await User.findByIdAndDelete(testUser._id);

      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("Edge Cases", () => {
    it("should handle user with no addresses", async () => {
      // Create user without addresses
      const userWithoutAddresses = await User.create({
        username: "noaddress",
        email: "noaddress@example.com",
        password: await bcrypt.hash("password123", 10),
        fullName: {
          firstname: "No",
          lastname: "Address",
        },
      });

      const token = jwt.sign(
        {
          id: userWithoutAddresses._id,
          username: userWithoutAddresses.username,
          email: userWithoutAddresses.email,
          role: userWithoutAddresses.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty("addresses");
      expect(Array.isArray(response.body.user.addresses)).toBe(true);
      expect(response.body.user.addresses.length).toBe(0);
    });

    it("should not expose sensitive fields like password", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user).not.toHaveProperty("password");
      expect(response.body.user).not.toHaveProperty("__v");
    });

    it("should handle concurrent requests with same token", async () => {
      const requests = Array(5)
        .fill()
        .map(() =>
          request(app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${validToken}`)
        );

      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body.user).toHaveProperty("username", "testuser");
      });
    });

    it("should return consistent data structure", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        user: {
          id: expect.any(String),
          username: expect.any(String),
          email: expect.any(String),
          role: expect.any(String),
          fullName: {
            firstname: expect.any(String),
            lastname: expect.any(String),
          },
          addresses: expect.any(Array),
        },
      });
    });
  });

  describe("Response Format Validation", () => {
    it("should return JSON content type", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toMatch(/application\/json/);
    });

    /* it("should have correct user ID format", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(mongoose.Types.ObjectId.isValid(response.body.user_.id)).toBe(true);
    }); */

    it("should have correct user ID format", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      // Fixed typo: user_.id -> user.id
      expect(mongoose.Types.ObjectId.isValid(response.body.user.id)).toBe(true);
    });

    it("should return email in valid format", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
  });
});
