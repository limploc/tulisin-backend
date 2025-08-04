import { ValidationError, ValidationErrorDetail } from "../types/errors";

export interface CreateNoteValidationData {
  title?: string;
  content?: string;
  sectionId: string;
}

export interface UpdateNoteValidationData {
  title?: string;
  content?: string;
  sectionId?: string;
}

export function validateCreateNoteData(data: unknown): CreateNoteValidationData {
  const errors: ValidationErrorDetail[] = [];

  if (!data || typeof data !== "object") {
    throw new ValidationError("Invalid request body", [
      { field: "body", message: "Request body must be a valid JSON object" },
    ]);
  }

  const { title, content, sectionId } = data as Record<string, unknown>;

  if (!sectionId || typeof sectionId !== "string") {
    errors.push({ field: "sectionId", message: "Section ID is required and must be a string" });
  } else if (sectionId.trim().length === 0) {
    errors.push({ field: "sectionId", message: "Section ID cannot be empty" });
  }

  if (title !== undefined && typeof title !== "string") {
    errors.push({ field: "title", message: "Title must be a string" });
  } else if (title !== undefined && title.trim().length === 0) {
    errors.push({ field: "title", message: "Title cannot be empty" });
  } else if (title && title.length > 200) {
    errors.push({ field: "title", message: "Title must not exceed 200 characters" });
  }

  if (content !== undefined && typeof content !== "string") {
    errors.push({ field: "content", message: "Content must be a string" });
  } else if (content !== undefined && content.trim().length === 0) {
    errors.push({ field: "content", message: "Content cannot be empty" });
  }

  if (errors.length > 0) {
    throw new ValidationError("Validation failed", errors);
  }

  return {
    title: title as string | undefined,
    content: content as string | undefined,
    sectionId: (sectionId as string).trim(),
  };
}

export function validateUpdateNoteData(data: unknown): UpdateNoteValidationData {
  const errors: ValidationErrorDetail[] = [];

  if (!data || typeof data !== "object") {
    throw new ValidationError("Invalid request body", [
      { field: "body", message: "Request body must be a valid JSON object" },
    ]);
  }

  const { title, content, sectionId } = data as Record<string, unknown>;

  if (title !== undefined && typeof title !== "string") {
    errors.push({ field: "title", message: "Title must be a string" });
  } else if (title !== undefined && title.trim().length === 0) {
    errors.push({ field: "title", message: "Title cannot be empty" });
  } else if (title && title.length > 200) {
    errors.push({ field: "title", message: "Title must not exceed 200 characters" });
  }

  if (content !== undefined && typeof content !== "string") {
    errors.push({ field: "content", message: "Content must be a string" });
  } else if (content !== undefined && content.trim().length === 0) {
    errors.push({ field: "content", message: "Content cannot be empty" });
  }

  if (sectionId !== undefined) {
    if (typeof sectionId !== "string") {
      errors.push({ field: "sectionId", message: "Section ID must be a string" });
    } else if (sectionId.trim().length === 0) {
      errors.push({ field: "sectionId", message: "Section ID cannot be empty" });
    }
  }

  if (errors.length > 0) {
    throw new ValidationError("Validation failed", errors);
  }

  return {
    title: title as string | undefined,
    content: content as string | undefined,
    sectionId: sectionId ? (sectionId as string).trim() : undefined,
  };
}
