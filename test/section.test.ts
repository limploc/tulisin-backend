import request from "supertest";
import app from "../src/app";

jest.mock("../src/controllers/section.controller", () => {
  const original = jest.requireActual("../src/controllers/section.controller");
  return {
    ...original,
    getAllSections: jest.fn(original.getAllSections),
    getSectionById: jest.fn(original.getSectionById),
    createSection: jest.fn(original.createSection),
    updateSection: jest.fn(original.updateSection),
    deleteSection: jest.fn(original.deleteSection),
  };
});
import * as sectionController from "../src/controllers/section.controller";

let token: string;
beforeAll(async () => {
  // Use unique email based on timestamp to avoid conflicts
  const uniqueEmail = `sectionuser${Date.now()}@example.com`;
  await request(app).post("/api/v1/auth/register").send({
    email: uniqueEmail,
    password: "password123",
    name: "Section User",
  });
  const loginRes = await request(app).post("/api/v1/auth/login").send({
    email: uniqueEmail,
    password: "password123",
  });
  token = loginRes.body.token;
});

describe("Sections API", () => {
  describe("GET /api/v1/sections", () => {
    it("should get all sections for authenticated user", async () => {
      const res = await request(app).get("/api/v1/sections").set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.sections)).toBe(true);
    });

    it("should return 401 if not authenticated", async () => {
      const res = await request(app).get("/api/v1/sections");
      expect(res.statusCode).toBe(401);
    });

    it("should return 500 if server error", async () => {
      (sectionController.getAllSections as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Server error");
      });
      const res = await request(app).get("/api/v1/sections").set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(500);
    });
  });

  describe("POST /api/v1/sections", () => {
    it("should create a new section", async () => {
      const res = await request(app)
        .post("/api/v1/sections")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "My Section" });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("section");
      expect(res.body.section).toHaveProperty("name", "My Section");
    });

    it("should return 400 for invalid input", async () => {
      const res = await request(app)
        .post("/api/v1/sections")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "" });
      expect(res.statusCode).toBe(400);
    });

    it("should return 401 if not authenticated", async () => {
      const res = await request(app).post("/api/v1/sections").send({ name: "My Section" });
      expect(res.statusCode).toBe(401);
    });

    it("should return 500 if server error", async () => {
      (sectionController.createSection as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Server error");
      });
      const res = await request(app)
        .post("/api/v1/sections")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Err Section" });
      expect(res.statusCode).toBe(500);
    });
  });

  describe("GET /api/v1/sections/:sectionId", () => {
    let sectionId: string;
    beforeAll(async () => {
      const res = await request(app)
        .post("/api/v1/sections")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Detail Section" });
      sectionId = res.body.section.id;
    });

    it("should get section by ID", async () => {
      const res = await request(app).get(`/api/v1/sections/${sectionId}`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.section).toHaveProperty("id", sectionId);
    });

    it("should return 404 if section not found", async () => {
      const res = await request(app).get("/api/v1/sections/invalidid").set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(404);
    });

    it("should return 401 if not authenticated", async () => {
      const res = await request(app).get(`/api/v1/sections/${sectionId}`);
      expect(res.statusCode).toBe(401);
    });

    it("should return 500 if server error", async () => {
      (sectionController.getSectionById as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Server error");
      });
      const res = await request(app).get(`/api/v1/sections/${sectionId}`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(500);
    });
  });

  describe("PUT /api/v1/sections/:sectionId", () => {
    let sectionId: string;
    beforeAll(async () => {
      const res = await request(app)
        .post("/api/v1/sections")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Update Section" });
      sectionId = res.body.section.id;
    });

    it("should update section name", async () => {
      const res = await request(app)
        .put(`/api/v1/sections/${sectionId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Updated Name" });
      expect(res.statusCode).toBe(200);
      expect(res.body.section).toHaveProperty("name", "Updated Name");
    });

    it("should return 400 for invalid input", async () => {
      const res = await request(app)
        .put(`/api/v1/sections/${sectionId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "" });
      expect(res.statusCode).toBe(400);
    });

    it("should return 404 if section not found", async () => {
      const res = await request(app)
        .put("/api/v1/sections/invalidid")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Name" });
      expect(res.statusCode).toBe(404);
    });

    it("should return 401 if not authenticated", async () => {
      const res = await request(app).put(`/api/v1/sections/${sectionId}`).send({ name: "Name" });
      expect(res.statusCode).toBe(401);
    });

    it("should return 500 if server error", async () => {
      (sectionController.updateSection as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Server error");
      });
      const res = await request(app)
        .put(`/api/v1/sections/${sectionId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Name" });
      expect(res.statusCode).toBe(500);
    });
  });

  describe("DELETE /api/v1/sections/:sectionId", () => {
    let sectionId: string;
    beforeAll(async () => {
      const res = await request(app)
        .post("/api/v1/sections")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Delete Section" });
      sectionId = res.body.section.id;
    });

    it("should delete section", async () => {
      const res = await request(app).delete(`/api/v1/sections/${sectionId}`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
    });

    it("should return 404 if section not found", async () => {
      const res = await request(app).delete("/api/v1/sections/invalidid").set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(404);
    });

    it("should return 401 if not authenticated", async () => {
      const res = await request(app).delete(`/api/v1/sections/${sectionId}`);
      expect(res.statusCode).toBe(401);
    });

    it("should return 500 if server error", async () => {
      (sectionController.deleteSection as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Server error");
      });
      const res = await request(app).delete(`/api/v1/sections/${sectionId}`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(500);
    });
  });
});
