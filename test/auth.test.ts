import request from "supertest";
import app from "../src/app";

jest.mock("../src/controllers/auth.controller", () => {
  const original = jest.requireActual("../src/controllers/auth.controller");
  return {
    ...original,
    register: jest.fn(original.register),
    login: jest.fn(original.login),
    logout: jest.fn(original.logout),
    getMe: jest.fn(original.getMe),
  };
});
import * as authController from "../src/controllers/auth.controller";

describe("Authentication API", () => {
  describe("POST /api/v1/auth/register", () => {
    it("should register a new user", async () => {
      const uniqueEmail = `testuser${Date.now()}@example.com`;
      const res = await request(app).post("/api/v1/auth/register").send({
        email: uniqueEmail,
        password: "password123",
        name: "Test User",
      });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("user");
      expect(res.body.user).toHaveProperty("email", uniqueEmail);
    });

    it("should return 400 for invalid input", async () => {
      const res = await request(app).post("/api/v1/auth/register").send({ email: "", password: "" });
      expect(res.statusCode).toBe(400);
    });

    it("should return 409 if email already exists", async () => {
      const uniqueEmail = `dupe${Date.now()}@example.com`;
      await request(app).post("/api/v1/auth/register").send({
        email: uniqueEmail,
        password: "password123",
        name: "Dupe User",
      });
      const res = await request(app).post("/api/v1/auth/register").send({
        email: uniqueEmail,
        password: "password123",
        name: "Dupe User",
      });
      expect(res.statusCode).toBe(409);
    });

    it("should return 500 if server error", async () => {
      (authController.register as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Server error");
      });
      const res = await request(app).post("/api/v1/auth/register").send({
        email: "err@example.com",
        password: "password123",
        name: "Err User",
      });
      expect(res.statusCode).toBe(500);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("should login with valid credentials", async () => {
      const uniqueEmail = `loginuser${Date.now()}@example.com`;
      await request(app).post("/api/v1/auth/register").send({
        email: uniqueEmail,
        password: "password123",
        name: "Login User",
      });
      const res = await request(app).post("/api/v1/auth/login").send({
        email: uniqueEmail,
        password: "password123",
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
    });

    it("should return 400 for invalid input", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({ email: "", password: "" });
      expect(res.statusCode).toBe(400);
    });

    it("should return 401 for invalid credentials", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "loginuser@example.com",
        password: "wrongpassword",
      });
      expect(res.statusCode).toBe(401);
    });

    it("should return 500 if server error", async () => {
      (authController.login as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Server error");
      });
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "loginuser@example.com",
        password: "password123",
      });
      expect(res.statusCode).toBe(500);
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    let token: string;
    beforeAll(async () => {
      const uniqueEmail = `logoutuser${Date.now()}@example.com`;
      await request(app).post("/api/v1/auth/register").send({
        email: uniqueEmail,
        password: "password123",
        name: "Logout User",
      });
      const loginRes = await request(app).post("/api/v1/auth/login").send({
        email: uniqueEmail,
        password: "password123",
      });
      token = loginRes.body.token;
    });

    it("should logout the authenticated user", async () => {
      const res = await request(app).post("/api/v1/auth/logout").set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
    });

    it("should return 401 if not authenticated", async () => {
      const res = await request(app).post("/api/v1/auth/logout");
      expect(res.statusCode).toBe(401);
    });

    it("should return 500 if server error", async () => {
      (authController.logout as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Server error");
      });
      const res = await request(app).post("/api/v1/auth/logout").set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(500);
    });
  });

  describe("GET /api/v1/auth/me", () => {
    let token: string;
    beforeAll(async () => {
      const uniqueEmail = `meuser${Date.now()}@example.com`;
      await request(app).post("/api/v1/auth/register").send({
        email: uniqueEmail,
        password: "password123",
        name: "Me User",
      });
      const loginRes = await request(app).post("/api/v1/auth/login").send({
        email: uniqueEmail,
        password: "password123",
      });
      token = loginRes.body.token;
    });

    it("should get current user info", async () => {
      const res = await request(app).get("/api/v1/auth/me").set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("email");
    });

    it("should return 401 if not authenticated", async () => {
      const res = await request(app).get("/api/v1/auth/me");
      expect(res.statusCode).toBe(401);
    });

    it("should return 500 if server error", async () => {
      (authController.getMe as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Server error");
      });
      const res = await request(app).get("/api/v1/auth/me").set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(500);
    });
  });
});
