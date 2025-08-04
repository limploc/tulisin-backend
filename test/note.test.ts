import request from "supertest";
import app from "../src/app";

jest.mock("../src/controllers/note.controller", () => {
  const original = jest.requireActual("../src/controllers/note.controller");
  return {
    ...original,
    getAllNotes: jest.fn(original.getAllNotes),
    createNote: jest.fn(original.createNote),
    getNoteById: jest.fn(original.getNoteById),
    updateNote: jest.fn(original.updateNote),
    deleteNote: jest.fn(original.deleteNote),
  };
});
import * as noteController from "../src/controllers/note.controller";

let token: string;
let sectionId: string;

beforeAll(async () => {
  const uniqueEmail = `noteuser${Date.now()}@example.com`;
  await request(app).post("/api/v1/auth/register").send({
    email: uniqueEmail,
    password: "password123",
    name: "Note User",
  });
  const loginRes = await request(app).post("/api/v1/auth/login").send({
    email: uniqueEmail,
    password: "password123",
  });
  token = loginRes.body.token;
  const sectionRes = await request(app)
    .post("/api/v1/sections")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Notes Section" });
  sectionId = sectionRes.body.section.id;
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("Notes API", () => {
  describe("GET /api/v1/notes", () => {
    it("should get all notes for a section", async () => {
      const res = await request(app).get("/api/v1/notes").set("Authorization", `Bearer ${token}`).query({ sectionId });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.notes)).toBe(true);
    });

    it("should return 400 if sectionId is missing", async () => {
      const res = await request(app).get("/api/v1/notes").set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(400);
    });

    it("should return 401 if not authenticated", async () => {
      const res = await request(app).get("/api/v1/notes").query({ sectionId });
      expect(res.statusCode).toBe(401);
    });

    it("should return 500 if server error", async () => {
      (noteController.getAllNotes as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Server error");
      });
      const res = await request(app).get("/api/v1/notes").set("Authorization", `Bearer ${token}`).query({ sectionId });
      expect(res.statusCode).toBe(500);
    });
  });

  describe("POST /api/v1/notes", () => {
    it("should create a new note in a section", async () => {
      const res = await request(app).post("/api/v1/notes").set("Authorization", `Bearer ${token}`).send({
        sectionId,
        title: "My Note",
        content: "Note content",
      });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("note");
      expect(res.body.note).toHaveProperty("title", "My Note");
    });

    it("should return 400 for invalid input", async () => {
      const res = await request(app)
        .post("/api/v1/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({ sectionId, title: "", content: "" });
      expect(res.statusCode).toBe(400);
    });

    it("should return 401 if not authenticated", async () => {
      const res = await request(app).post("/api/v1/notes").send({ sectionId, title: "Title", content: "Content" });
      expect(res.statusCode).toBe(401);
    });

    it("should return 500 if server error", async () => {
      (noteController.createNote as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Server error");
      });
      const res = await request(app)
        .post("/api/v1/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({ sectionId, title: "Title", content: "Content" });
      expect(res.statusCode).toBe(500);
    });
  });

  describe("GET /api/v1/notes/:noteId", () => {
    let noteId: string;
    beforeAll(async () => {
      const res = await request(app)
        .post("/api/v1/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({ sectionId, title: "Detail Note", content: "Detail content" });
      noteId = res.body.note.id;
    });

    it("should get note by ID", async () => {
      const res = await request(app).get(`/api/v1/notes/${noteId}`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.note).toHaveProperty("id", noteId);
    });

    it("should return 404 if note not found", async () => {
      const res = await request(app).get("/api/v1/notes/invalidid").set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(404);
    });

    it("should return 401 if not authenticated", async () => {
      const res = await request(app).get(`/api/v1/notes/${noteId}`);
      expect(res.statusCode).toBe(401);
    });

    it("should return 500 if server error", async () => {
      (noteController.getNoteById as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Server error");
      });
      const res = await request(app).get(`/api/v1/notes/${noteId}`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(500);
    });
  });

  describe("PUT /api/v1/notes/:noteId", () => {
    let noteId: string;
    beforeAll(async () => {
      const res = await request(app)
        .post("/api/v1/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({ sectionId, title: "Update Note", content: "Update content" });
      noteId = res.body.note.id;
    });

    it("should update note", async () => {
      const res = await request(app)
        .put(`/api/v1/notes/${noteId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Updated Title", content: "Updated Content" });
      expect(res.statusCode).toBe(200);
      expect(res.body.note).toHaveProperty("title", "Updated Title");
    });

    it("should return 400 for invalid input", async () => {
      const res = await request(app)
        .put(`/api/v1/notes/${noteId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "", content: "" });
      expect(res.statusCode).toBe(400);
    });

    it("should return 404 if note not found", async () => {
      const res = await request(app)
        .put("/api/v1/notes/invalidid")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Title", content: "Content" });
      expect(res.statusCode).toBe(404);
    });

    it("should return 401 if not authenticated", async () => {
      const res = await request(app).put(`/api/v1/notes/${noteId}`).send({ title: "Title", content: "Content" });
      expect(res.statusCode).toBe(401);
    });

    it("should return 500 if server error", async () => {
      (noteController.updateNote as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Server error");
      });
      const res = await request(app)
        .put(`/api/v1/notes/${noteId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Title", content: "Content" });
      expect(res.statusCode).toBe(500);
    });
  });

  describe("DELETE /api/v1/notes/:noteId", () => {
    let noteId: string;
    beforeAll(async () => {
      const res = await request(app)
        .post("/api/v1/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({ sectionId, title: "Delete Note", content: "Delete content" });
      noteId = res.body.note.id;
    });

    it("should delete note", async () => {
      const res = await request(app).delete(`/api/v1/notes/${noteId}`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
    });

    it("should return 404 if note not found", async () => {
      const res = await request(app).delete("/api/v1/notes/invalidid").set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(404);
    });

    it("should return 401 if not authenticated", async () => {
      const res = await request(app).delete(`/api/v1/notes/${noteId}`);
      expect(res.statusCode).toBe(401);
    });

    it("should return 500 if server error", async () => {
      (noteController.deleteNote as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Server error");
      });
      const res = await request(app).delete(`/api/v1/notes/${noteId}`).set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(500);
    });
  });
});
