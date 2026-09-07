const request = require("supertest");
const express = require("express");

const app = express();

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "BugHunter API is running",
  });
});

describe("Health API", () => {
  test("GET /api/health should return 200", async () => {
    const response = await request(app).get("/api/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      "BugHunter API is running"
    );
  });
});
