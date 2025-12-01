const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../models/User.Model");
const bcrypt = require("bcrypt");

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

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it("should login successfully with valid credentials", async () => {
    // Create a user first
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: "testuser",
      email: "test@example.com",
      password: hashedPassword,
      fullName: {
        firstname: "Test",
        lastname: "User",
      },
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("message", "Login successful");
    expect(response.body.user).toHaveProperty("email", "test@example.com");
  });

  it("should fail with non-existent email", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "nonexistent@example.com",
      password: "password123",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Invalid credentials");
  });

  it("should fail with incorrect password", async () => {
    // Create a user
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      username: "testuser",
      email: "test@example.com",
      password: hashedPassword,
      fullName: {
        firstname: "Test",
        lastname: "User",
      },
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "wrongpassword",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Invalid credentials");
  });

  it("should fail if required fields are missing", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      // password missing
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "All fields are required");
  });
});
