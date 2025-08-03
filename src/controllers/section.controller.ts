import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import {
  getAllSections as getAllSectionsService,
  getSectionById as getSectionByIdService,
  createSection as createSectionService,
  updateSection as updateSectionService,
  deleteSection as deleteSectionService,
} from "../services/section.service";
import { validateCreateSectionData, validateUpdateSectionData } from "../validators/section.validator";
import { BadRequestError, NotFoundError } from "../types/errors";
import { isValidUUID } from "../utils/checkValidUUID";

export async function getAllSections(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user } = req as AuthenticatedRequest;
    const sections = await getAllSectionsService(user.userId);

    res.status(200).json({ sections });
  } catch (error) {
    next(error);
  }
}

export async function getSectionById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user } = req as AuthenticatedRequest;
    const { sectionId } = req.params;

    if (!sectionId) {
      throw new BadRequestError("Section ID is required");
    }

    if (!isValidUUID(sectionId)) {
      throw new NotFoundError("Invalid Section ID format");
    }

    const section = await getSectionByIdService(sectionId, user.userId);

    res.status(200).json({ section });
  } catch (error) {
    next(error);
  }
}

export async function createSection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user } = req as AuthenticatedRequest;
    const validatedData = validateCreateSectionData(req.body);

    const section = await createSectionService({
      name: validatedData.name,
      userId: user.userId,
    });

    res.status(201).json({ section });
  } catch (error) {
    next(error);
  }
}

export async function updateSection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user } = req as AuthenticatedRequest;
    const { sectionId } = req.params;

    if (!sectionId) {
      throw new BadRequestError("Section ID is required");
    }

    if (!isValidUUID(sectionId)) {
      throw new NotFoundError("Invalid Section ID format");
    }

    const validatedData = validateUpdateSectionData(req.body);

    const section = await updateSectionService(sectionId, user.userId, {
      name: validatedData.name,
    });

    res.status(200).json({ section });
  } catch (error) {
    next(error);
  }
}

export async function deleteSection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user } = req as AuthenticatedRequest;
    const { sectionId } = req.params;

    if (!sectionId) {
      throw new BadRequestError("Section ID is required");
    }

    if (!isValidUUID(sectionId)) {
      throw new NotFoundError("Invalid Section ID format");
    }

    await deleteSectionService(sectionId, user.userId);

    res.status(200).json({
      success: true,
      message: "Section deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}
