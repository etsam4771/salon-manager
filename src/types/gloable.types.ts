export interface BusinessModel {
  id: number;
  code: string;
  name: string;
  description: string | null;
  requiresMedicalDirector: boolean;
  sortOrder: number;
  createdAt: string;
  subtypes: SubType[];
}
export interface SubType {
  id: number;
  businessModelId: number;
  code: string;
  name: string;
  description: string | null;
}

// Types
export type BranchTiming = {
  day: string;
  openAt: string;
  closesAt: string;
};

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];