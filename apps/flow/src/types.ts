export interface Container {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface Category {
  id: string;
  containerId: string;
  name: string;
}

export interface FlowItem {
  id: string;
  item: string;
  prio: string;
  stoppedAt: string;
  nextStep: string;
  status: string;
  note: string;
}

export interface Project {
  id: string;
  containerId: string;
  categoryId?: string;
  name: string;
  description: string;
  lastUpdated: string;
  flowItems: FlowItem[];
  notes: string;
}

export interface Note {
  id: string;
  projectId: string;
  content: string;
  createdAt: string;
}

export interface TimebendingData {
  containers: Container[];
  categories: Category[];
  projects: Project[];
  notes: Note[];
}
