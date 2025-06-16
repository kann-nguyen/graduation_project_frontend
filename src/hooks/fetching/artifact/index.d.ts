import { Threat } from "../threat";

export interface Vulnerability {
  cveId: string;
  description: string;
  score?: number;
  severity: string;
  cwes: string[];
  cvssVector?: string;
  _id: string;
}

export interface ScanHistoryEntry {
  timestamp: string;
  vulnerabilities: Vulnerability[];
}

import { WorkflowCycle } from "../workflow";

export interface Artifact {
  rateReScan: number;
  _id: string;
  name: string;
  type: "image" | "log" | "source code" | "executable" | "library";
  url: string;
  version?: string;
  threatList: Threat[];
  vulnerabilityList: Vulnerability[];
  cpe?: string;
  isScanning?: boolean;
  state: "valid" | "invalid";
  scanHistory?: ScanHistoryEntry[];
  
  // Workflow fields
  currentWorkflowStep?: number;
  workflowCyclesCount?: number;
  workflowCycles?: WorkflowCycle[];
  currentWorkflowCycle?: WorkflowCycle;
}

export interface ArtifactCreate {
  name: string;
  type: "image" | "log" | "source code" | "executable" | "library";
  url: string;
  version?: string;
  cpe?: string;
}

export interface ArtifactUpdate {
  name: string;
  type: "image" | "log" | "source code" | "executable" | "library";
  url: string;
  version?: string;
  cpe?: string;
  threatList?: string[];
}
