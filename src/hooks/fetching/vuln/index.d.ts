export interface Progress {
  total: number;
  resolved: number;
}
export interface Resolution {
  _id: string;
  cveId: string;
  resolution: [
    {
      _id: string;
      createdBy: string;
      description: string;
      isApproved?: boolean;
    }
  ];
}
