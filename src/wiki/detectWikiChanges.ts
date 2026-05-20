export type WikiChangeType =
  | "architecture"
  | "database-schema"
  | "coding-rules"
  | "review-rules"
  | "file-wiki";

export type DetectedWikiChange = {
  type: WikiChangeType;
  reason: string;
  affectedWikiFile: string;
};

export function detectWikiChangesFromChangedFiles(changedFiles: string[]): DetectedWikiChange[] {
  const changes: DetectedWikiChange[] = [];

  for (const file of changedFiles) {
    const lower = file.toLowerCase();

    if (
      lower.includes("index") ||
      lower.includes("main") ||
      lower.includes("app") ||
      lower.includes("server") ||
      lower.includes("workflow") ||
      lower.includes(".github/workflows")
    ) {
      changes.push({
        type: "architecture",
        reason: `${file} may affect project architecture or workflow behavior.`,
        affectedWikiFile: ".codesentinal/wiki/architecture.md",
      });
    }

    if (
      lower.includes("model") ||
      lower.includes("schema") ||
      lower.includes("types") ||
      lower.includes("interface")
    ) {
      changes.push({
        type: "database-schema",
        reason: `${file} may affect data models, schemas, or important types.`,
        affectedWikiFile: ".codesentinal/wiki/database-schema.md",
      });
    }

    if (
      lower.includes("eslint") ||
      lower.includes("tsconfig") ||
      lower.includes("prettier") ||
      lower.includes("package.json")
    ) {
      changes.push({
        type: "coding-rules",
        reason: `${file} may affect coding conventions or project rules.`,
        affectedWikiFile: ".codesentinal/wiki/coding-rules.md",
      });
    }

    if (
      lower.includes("review") ||
      lower.includes("llm") ||
      lower.includes("prompt") ||
      lower.includes("comment")
    ) {
      changes.push({
        type: "review-rules",
        reason: `${file} may affect how CodeSentinal reviews PRs.`,
        affectedWikiFile: ".codesentinal/wiki/review-rules.md",
      });
    }

    changes.push({
      type: "file-wiki",
      reason: `${file} changed, so its file-level wiki should be updated.`,
      affectedWikiFile: `.codesentinal/wiki/files/${file.replace(/\//g, "_").replace(/\./g, "_")}.md`,
    });
  }

  return changes;
}