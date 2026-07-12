export type WikiManifest = {
  version: string;
  generatedAt: string;

  files: Record<
    string,
    {
      wikiPath: string;
      lastGeneratedAt: string;
    }
  >;
};