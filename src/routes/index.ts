import { Router } from "express";
import authRoutes from "./auth.routes";
import sectionRoutes from "./section.routes";
import noteRoutes from "./note.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/sections", sectionRoutes);
router.use("/notes", noteRoutes);

export default router;
