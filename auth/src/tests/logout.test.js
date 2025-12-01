const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const jwt = require("jsonwebtoken");

// Mock redis
jest.mock("../config/redis", () => ({
  set: jest.fn(),
}));

const redis = require("../config/redis");

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

describe("GET /api/auth/logout", () => {
  let token;

  beforeEach(() => {
    // reset mock
    redis.set.mockClear();

    token = jwt.sign(
      { id: "12345", username: "testuser" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
  });

  // SUCCESS CASES
  describe("Success Cases", () => {
    it("should return 200 and clear cookie even if no token provided", async () => {
      const response = await request(app).get("/api/auth/logout");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Logout successful");

      // cookie cleared
      expect(response.headers["set-cookie"][0]).toMatch(/token=;/);
    });

    it("should blacklist token if present in cookies", async () => {
      const response = await request(app)
        .get("/api/auth/logout")
        .set("Cookie", [`token=${token}`]);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Logout successful");

      // redis should store token in blacklist
      expect(redis.set).toHaveBeenCalledWith(
        `blacklist:${token}`,
        "true",
        "EX",
        86400
      );

      // cookie cleared
      expect(response.headers["set-cookie"][0]).toMatch(/token=;/);
    });

    it("should NOT call redis when cookie token is missing", async () => {
      const response = await request(app).get("/api/auth/logout");

      expect(response.status).toBe(200);
      expect(redis.set).not.toHaveBeenCalled();
    });
  });

  // FAILURE CASES
  describe("Failure Cases", () => {
    it("should return 500 when redis throws error", async () => {
      redis.set.mockImplementation(() => {
        throw new Error("Redis crashed");
      });

      const response = await request(app)
        .get("/api/auth/logout")
        .set("Cookie", [`token=${token}`]);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Internal Server Error");
    });
  });
});
