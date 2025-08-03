export interface Section {
  id: string;
  name: string;
  userId: string;
  notesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSectionRequest {
  name: string;
}

export interface UpdateSectionRequest {
  name: string;
}
