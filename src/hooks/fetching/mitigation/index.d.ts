export interface Mitigation {
  createdBy: any;
  _id: string;
  title: string;
  description: string;
  implementation: string;
  threatId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MitigationCreate {
  title: string;
  description: string;
  implementation: string;
  threatId: string;
}

export interface MitigationUpdate {
  title?: string;
  description?: string;
  implementation?: string;
}