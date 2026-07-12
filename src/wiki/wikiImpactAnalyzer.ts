import type { ReviewChunk } from "../chunk.js";

export type ImpactedWikiDocument = {
  path: string;
  priority: number;
  reason: string;
};

export type WikiImpactAnalysis = {
  affectedWikiFiles: string[];

  impactedDocuments: ImpactedWikiDocument[];

  affectsArchitecture: boolean;
  affectsDataContracts: boolean;
  affectsReviewRules: boolean;
  affectsCodingRules: boolean;
  affectsRepositoryMemory: boolean;

  changedFiles: string[];

  reasons: string[];
};

const DATA_CONTRACT_KEYWORDS = [
  "schema",
  "type",
  "types",
  "interface",
  "dto",
  "contract",
  "validator",
  "validation",
];

const REVIEW_RULE_KEYWORDS = [
  "review",
  "prompt",
  "llm",
  "comment",
  "github",
  "octokit",
  "reviewer",
];

const ARCHITECTURE_KEYWORDS = [
  "workflow",
  "pipeline",
  "action",
  "integration",
  "service",
  "orchestrator",
  "router",
  "routing",
];

const CODING_RULE_KEYWORDS = [
  "eslint",
  "prettier",
  "config",
  "tsconfig",
  "lint",
];

const ARCHITECTURE_CHANGE_PATTERNS = [
  "workflow",
  "pipeline",
  "orchestrator",
  "router",
  "routing",
  "service",
  "integration",
  "middleware",
];

const DATA_CONTRACT_CHANGE_PATTERNS = [
  "interface",
  "type",
  "schema",
  "validator",
  "validation",
  "z.object",
  "zod",
];

const REVIEW_CHANGE_PATTERNS = [
  "prompt",
  "review",
  "comment",
  "severity",
  "githubcomment",
];

function containsKeyword(
  value: string,
  keywords: string[]
): boolean {
  const lower = value.toLowerCase();

  return keywords.some((keyword) =>
    lower.includes(keyword)
  );
}

function addDocument(
  documents: Map<string, ImpactedWikiDocument>,
  path: string,
  priority: number,
  reason: string
): void {
  const existing = documents.get(path);

  if (!existing) {
    documents.set(path, {
      path,
      priority,
      reason,
    });

    return;
  }

  if (priority > existing.priority) {
    documents.set(path, {
      path,
      priority,
      reason,
    });
  }
}

function scoreChunkContent(
  chunk: ReviewChunk,
  patterns: string[]
): boolean {
  const content =
    chunk.codeWithContext.toLowerCase();

  return patterns.some((pattern) =>
    content.includes(pattern.toLowerCase())
  );
}

export function analyzeWikiImpact(
  chunks: ReviewChunk[]
): WikiImpactAnalysis {
  const documents =
    new Map<string, ImpactedWikiDocument>();

  const changedFiles =
    new Set<string>();

  const reasons =
    new Set<string>();

  let affectsArchitecture = false;
  let affectsDataContracts = false;
  let affectsReviewRules = false;
  let affectsCodingRules = false;
  let affectsRepositoryMemory = false;

  addDocument(
    documents,
    ".codesentinal/wiki/repository-memory.md",
    100,
    "Repository memory is always included for update planning."
  );

  for (const chunk of chunks) {
    const filePath =
      chunk.filename;

    changedFiles.add(filePath);

    const lowerFile =
      filePath.toLowerCase();

    const architectureMatch =
      containsKeyword(
        lowerFile,
        ARCHITECTURE_KEYWORDS
      ) ||
      scoreChunkContent(
        chunk,
        ARCHITECTURE_CHANGE_PATTERNS
      );

    const dataContractMatch =
      containsKeyword(
        lowerFile,
        DATA_CONTRACT_KEYWORDS
      ) ||
      scoreChunkContent(
        chunk,
        DATA_CONTRACT_CHANGE_PATTERNS
      );

    const reviewMatch =
      containsKeyword(
        lowerFile,
        REVIEW_RULE_KEYWORDS
      ) ||
      scoreChunkContent(
        chunk,
        REVIEW_CHANGE_PATTERNS
      );

    const codingRulesMatch =
      containsKeyword(
        lowerFile,
        CODING_RULE_KEYWORDS
      );

    if (architectureMatch) {
      affectsArchitecture = true;

      addDocument(
        documents,
        ".codesentinal/wiki/architecture.md",
        90,
        `Architecture-related change detected in ${filePath}`
      );

      reasons.add(
        `Architecture-related change detected in ${filePath}`
      );
    }

    if (dataContractMatch) {
      affectsDataContracts = true;

      addDocument(
        documents,
        ".codesentinal/wiki/database-schema.md",
        85,
        `Data-contract change detected in ${filePath}`
      );

      reasons.add(
        `Data-contract change detected in ${filePath}`
      );
    }

    if (reviewMatch) {
      affectsReviewRules = true;

      addDocument(
        documents,
        ".codesentinal/wiki/review-rules.md",
        80,
        `Review-system change detected in ${filePath}`
      );

      reasons.add(
        `Review-system change detected in ${filePath}`
      );
    }

    if (codingRulesMatch) {
      affectsCodingRules = true;

      addDocument(
        documents,
        ".codesentinal/wiki/coding-rules.md",
        70,
        `Coding-rules related file changed: ${filePath}`
      );

      reasons.add(
        `Coding-rules related file changed: ${filePath}`
      );
    }

    affectsRepositoryMemory = true;
  }

  const impactedDocuments =
    [...documents.values()].sort(
      (a, b) =>
        b.priority - a.priority
    );

  return {
    affectedWikiFiles:
      impactedDocuments.map(
        (doc) => doc.path
      ),

    impactedDocuments,

    affectsArchitecture,
    affectsDataContracts,
    affectsReviewRules,
    affectsCodingRules,
    affectsRepositoryMemory,

    changedFiles:
      [...changedFiles],

    reasons:
      [...reasons],
  };
}