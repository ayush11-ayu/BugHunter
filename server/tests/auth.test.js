const request = require("supertest");
const express = require("express");
const { loginUser } = require("../controllers/authController");

const app = express();

app.use(express.json());

app.post("/api/auth/login", loginUser);

describe("Authentication API", () => {
  test("POST /api/auth/login should reject missing email and password", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Email and password are required"
    );
  });
});
