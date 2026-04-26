export interface ComponentType {
  id: string;
  code: string;
  name: string;
  totalCount: number;
}

export interface IssuedEntry {
  txId: string;
  studentName: string;
  uid: string;
  issueTime: string;
}

export interface ComponentRow extends ComponentType {
  issuedCount: number;
  availableCount: number;
  issuedTo: IssuedEntry[];
}

export type Filter = "all" | "available" | "issued";
