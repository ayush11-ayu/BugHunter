const request = require("supertest");
const express = require("express");
const { createBug } = require("../controllers/bugController");

const app = express();

app.use(express.json());

app.post("/api/bugs", createBug);

describe("Bug API", () => {
  test("POST /api/bugs should reject missing required fields", async () => {
    const response = await request(app)
      .post("/api/bugs")
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Title, description, and project are required"
    );
  });
});
