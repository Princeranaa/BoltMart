const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../models/User.Model");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGO_URI = uri; // temporvery.
  process.env.JWT_SECRET = "secret";
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("POST /api/auth/register", () => {
  beforeEach(async () => {
    // Clear database before each test
    await User.deleteMany({});
  });

  it("should register a new user successfully", async () => {
    const userData = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      firstname: "Test",
      lastname: "User",
    };

    const response = await request(app)
      .post("/api/auth/register")
      .send(userData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty(
      "message",
      "User created successfully"
    );
    expect(response.body).toHaveProperty("token");
    expect(response.body.user).toHaveProperty("email", userData.email);

    // Verify user is in database
    const user = await User.findOne({ email: userData.email });
    expect(user).toBeTruthy();
    expect(user.username).toBe(userData.username);
  });

  it("should fail if email already exists", async () => {
    const userData = {
      username: "testuser1",
      email: "test@example.com",
      password: "password123",
      firstname: "Test",
      lastname: "User",
    };

    // Create first user
    await User.create({
      ...userData,
      fullName: { firstname: userData.firstname, lastname: userData.lastname },
    });

    // Try to register again with same email
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        ...userData,
        username: "testuser2", // different username
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "User already exists");
  });

  it("should fail if required fields are missing", async () => {
    const response = await request(app).post("/api/auth/register").send({
      username: "testuser",
      // email missing
      password: "password123",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Email is required");
  });
});
