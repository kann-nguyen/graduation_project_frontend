export interface Cwe {
  _id: string;
  cweId: string;
  name: string;
  description: string;
  modesOfIntroduction: string[];
  likelihood: string;
  mitigation: string[];
  consequences: string[];
  detectionMethods: string[];
  __v: number;
}
