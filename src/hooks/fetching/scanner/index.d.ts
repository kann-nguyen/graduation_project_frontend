interface Sample {
  interface: string;
  sampleCode: string;
}
interface CreateOrUpdateNewScanner {
  name: string;
  config: {
    installCommand: string;
    code: string;
  };
}
interface Scanner {
  _id: string;
  name: string;
  createdBy: string;
  config?: {
    installCommand: string;
    code: string;
  };
}
