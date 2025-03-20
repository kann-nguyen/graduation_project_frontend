export interface Threat {
  _id: string;
  name: string;
  description: string;
  type:
    | "Spoofing"
    | "Tampering"
    | "Repudiation"
    | "Information Disclosure"
    | "Denial of Service"
    | "Elevation of Privilege";
  score: {
    total: number;
    details: {
      damage: number;
      reproducibility: number;
      exploitability: number;
      affectedUsers: number;
      discoverability: number;
    };
  };
  status: "Non mitigated" | "Partially mitigated" | "Fully mitigated";
  mitigation: string[];
}
export interface ThreatCreate extends Omit<Threat, "_id" | "status"> {}
export interface ThreatUpdate {
  status: Threat["status"];
  mitigation: Threat["mitigation"];
}
