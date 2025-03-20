import { Threat } from "../threat";

export interface Vulnerability {
  cveId: string;
  description: string;
  score?: number;
  severity: string;
  cwes: string[];
  _id: string;
}

export interface Artifact {
  _id: string;
  name: string;
  type: "image" | "log" | "source code" | "executable" | "library";
  url: string;
  version?: string;
  threatList: Threat[];
  vulnerabilityList: Vulnerability[];
  cpe?: string;
}

export interface ArtifactCreate {
  name: string;
  type: "image" | "log" | "source code" | "executable" | "library";
  url: string;
  version?: string;
  threatList: string[];
  cpe?: string;
}

export interface ArtifactUpdate {
  name: string;
  url: string;
  version?: string;
  threatList: string[];
  cpe?: string;
}
