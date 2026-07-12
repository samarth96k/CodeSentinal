import path from "path";

export const WIKI_ROOT = ".codesentinal/wiki";
export const FILE_WIKI_ROOT = ".codesentinal/wiki/files";

export function normalizeRepoPath(filePath: string): string {
  return filePath.replace(/\\/g, "/");
}

export function sourcePathToWikiFileName(sourcePath: string): string {
  return normalizeRepoPath(sourcePath)
    .replace(/\//g, "_")
    .replace(/\./g, "_")
    .replace(/[^A-Za-z0-9_-]/g, "_") + ".md";
}

export function sourcePathToWikiPath(sourcePath: string): string {
  return normalizeRepoPath(
    path.posix.join(FILE_WIKI_ROOT, sourcePathToWikiFileName(sourcePath))
  );
}

export function isSafeWikiMarkdownPath(filePath: string): boolean {
  const normalized = normalizeRepoPath(filePath);

  return (
    normalized.startsWith(`${WIKI_ROOT}/`) &&
    normalized.endsWith(".md") &&
    !normalized.includes("..")
  );
}

export function getCoreWikiPathsForReview(): string[] {
  return [
    `${WIKI_ROOT}/architecture.md`,
    `${WIKI_ROOT}/review-rules.md`,
    `${WIKI_ROOT}/coding-rules.md`,
    `${WIKI_ROOT}/database-schema.md`,
    `${WIKI_ROOT}/repository-memory.md`,
  ];
}