export interface Project {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  createdAt: string;
}

export type NewProject = Omit<Project, 'id' | 'createdAt'>;
