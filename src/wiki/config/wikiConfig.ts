export const WIKI_ROOT = ".codesentinal/wiki";
export const FILE_WIKI_ROOT = ".codesentinal/wiki/files";

export const CORE_WIKI_FILES = {
  index: "index.md",
  architecture: "architecture.md",
  databaseSchema: "database-schema.md",
  codingRules: "coding-rules.md",
  reviewRules: "review-rules.md",
} as const;

export const IGNORED_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".next",
  "coverage",
  ".turbo",
  ".vercel",
  ".codesentinal",
]);

export const SUPPORTED_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".md",
  ".yml",
  ".yaml",

  ".py",
  ".java",
  ".cpp",
  ".c",
  ".h",
  ".hpp",
  ".go",
  ".rs",
  ".php",
  ".rb",
  ".cs",
  ".kt",
  ".swift",
]);

export const MAX_FILE_SIZE_BYTES = 120_000;
export const MAX_SOURCE_PREVIEW_CHARS = 6000;