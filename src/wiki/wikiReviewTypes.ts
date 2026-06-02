import type { ReviewChunk } from "../chunk.js";

export type WikiContextDocument = {
  wikiFilePath: string;
  reason: string;
  content: string;
};

export type ReviewChunkWithWikiContext = ReviewChunk & {
  wikiContext: string;
  wikiDocuments: WikiContextDocument[];
};

export type WikiUpdateTarget =
  | "file"
  | "architecture"
  | "database-schema"
  | "review-rules"
  | "repository-memory";

export type RepositoryMemorySection =
  | "Architectural Decisions"
  | "Known Constraints"
  | "Migration Notes"
  | "Review Findings"
  | "Integration Knowledge";

export type WikiMarkdownUpdate = {
  target: WikiUpdateTarget;

  sourceFile?: string;

  memorySection?: RepositoryMemorySection;

  reason: string;

  contentToAppend: string;
};

export type WikiUpdateClassification = {
  category:
    | "architecture"
    | "data-contract"
    | "review-behavior"
    | "workflow"
    | "security"
    | "repository-memory"
    | "implementation-detail"
    | "no-wiki-update";

  confidence: number;

  reason: string;
};

export type WikiUpdatePlan = {
  classification: WikiUpdateClassification;

  updatesRequired: boolean;

  summary: string;

  updates: WikiMarkdownUpdate[];
};

export type WikiMarkdownFileChange = {
  path: string;
  content: string;
};

export type RepositoryMemoryEntry = {
  timestamp: string;

  sourceFile: string;

  summary: string;
};

export type RepositoryMemoryBucket = {
  entries: RepositoryMemoryEntry[];
};