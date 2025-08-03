export interface Note {
  id: string;
  title: string;
  content: string;
  sectionId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteMetadata {
  id: string;
  title: string;
  sectionId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteRequest {
  title?: string;
  content?: string;
  sectionId: string;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  sectionId?: string;
}

export interface NotesResponse {
  notes: NoteMetadata[];
  total: number;
  limit: number;
  offset: number;
}
