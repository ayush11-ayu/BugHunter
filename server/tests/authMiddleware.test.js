const request = require("supertest");
const express = require("express");
const protect = require("../middleware/authMiddleware");

const app = express();

app.get("/api/auth/me", protect, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

describe("Authentication Middleware", () => {
  test("GET /api/auth/me should reject requests without a token", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Not authorized. No token provided."
    );
  });
});
