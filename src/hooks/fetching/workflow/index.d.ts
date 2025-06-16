export interface Workflow {
  name: string;
  path: string;
  content: string;
}

// WorkflowStep interfaces
export interface DetectionStep {
  completedAt?: string;
  numberVuls?: number;
  listVuls?: string[]; // Vulnerability IDs
}

export interface ClassificationStep {
  completedAt?: string;
  numberThreats?: number;
  listThreats?: string[]; // Threat IDs
}

export interface AssignmentStep {
  completedAt?: string;
  numberTicketsAssigned?: number;
  numberTicketsNotAssigned?: number;
  listTickets?: string[]; // Ticket IDs
}

export interface RemediationStep {
  completedAt?: string;
  numberTicketsSubmitted?: number;
  numberTicketsNotSubmitted?: number;
  numberThreatsResolved?: number;
  listTickets?: string[]; // Ticket IDs
}

export interface VerificationStep {
  completedAt?: string;
  numberTicketsResolved?: number;
  numberTicketsReturnedToProcessing?: number;
  notes?: string;
}

// Workflow Cycle
export interface WorkflowCycle {
  cycleNumber: number;
  currentStep: number;
  startedAt: string;
  completedAt?: string;
  detection?: DetectionStep;
  classification?: ClassificationStep;
  assignment?: AssignmentStep;
  remediation?: RemediationStep;
  verification?: VerificationStep;
}

// Full Artifact Workflow History
export type WorkflowHistory = WorkflowCycle[];

// Project Workflow Stats
export interface WorkflowStats {
  totalArtifacts: number;
  step1Count: number;
  step2Count: number;
  step3Count: number;
  step4Count: number;
  step5Count: number;
  completedArtifacts: number;
  totalCycles: number;
  averageCycles: number;
}
