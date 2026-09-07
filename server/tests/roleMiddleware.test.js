const request = require("supertest");
const express = require("express");
const authorize = require("../middleware/roleMiddleware");

const app = express();

app.get(
  "/api/developer-test",
  (req, res, next) => {
    req.user = {
      userId: "test-user-id",
      role: "tester",
    };
    next();
  },
  authorize("developer", "admin"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Developer role authorization successful",
    });
  }
);

describe("Role Authorization Middleware", () => {
  test("should reject a tester accessing a developer/admin route", async () => {
    const response = await request(app).get("/api/developer-test");

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Access denied. You do not have permission."
    );
  });
});
