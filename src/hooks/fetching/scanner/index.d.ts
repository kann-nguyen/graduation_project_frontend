interface Sample {
  interface: string;
  sampleCode: string;
}
interface CreateOrUpdateNewScanner {
  name: string;
  endpoint?: string;
  config: {
    installCommand: string;
    code: string;
  };
}
export interface Scanner {
  id: string;
  _id: string;
  name: string;
  createdBy: string;
  endpoint?: string;
  createdAt?: string;
  config?: {
    installCommand: string;
    code: string;
  };
}
