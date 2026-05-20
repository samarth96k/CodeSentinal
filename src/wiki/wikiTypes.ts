export type CoreWikiFileName =
  | "index.md"
  | "architecture.md"
  | "database-schema.md"
  | "coding-rules.md"
  | "review-rules.md";

export type RepoFileKind =
  | "source"
  | "test"
  | "config"
  | "workflow"
  | "documentation"
  | "package"
  | "unknown";

export type RepoFile = {
  path: string;
  absolutePath: string;
  content: string;
  extension: string;
  sizeInBytes: number;
  lineCount: number;
  kind: RepoFileKind;
};

export type ExtractedSymbol = {
  name: string;
  type: "function" | "class" | "type" | "interface" | "const" | "unknown";
  exported: boolean;
};

export type FileAnalysis = {
  file: RepoFile;
  imports: string[];
  exports: string[];
  symbols: ExtractedSymbol[];
  dependsOn: string[];
  purpose: string;
  risks: string[];
};

export type RepositoryAnalysis = {
  repoRoot: string;
  readme: string;
  packageJson: Record<string, unknown>;
  files: RepoFile[];
  fileAnalyses: FileAnalysis[];
  detectedTechStack: string[];
  entrypoints: string[];
  workflowFiles: string[];
  configFiles: string[];
  testFiles: string[];
};

export type FileWikiPage = {
  type: "file";
  sourceFilePath: string;
  wikiFilePath: string;
  title: string;
  summary: string;
  content: string;
};

export type WikiGenerationContext = {
  repoRoot: string;
  analysis: RepositoryAnalysis;
  fileWikiPages: FileWikiPage[];
};

export type WikiWriteResult = {
  writtenFiles: string[];
  skippedFiles: string[];
};