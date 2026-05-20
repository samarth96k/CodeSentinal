import process from "process";
import { scanRepoFiles } from "./parsers/scanRepoFiles.js";
import { parseReadme } from "./parsers/parseReadme.js";
import { generateFileWiki } from "./generators/generateFileWiki.js";
import { generateArchitecture } from "./generators/generateArchitecture.js";
import { generateDatabaseSchema } from "./generators/generateDatabaseSchema.js";
import { generateCodingRules } from "./generators/generateCodingRules.js";
import { generateReviewRules } from "./generators/generateReviewRules.js";
import { generateIndex } from "./generators/generateIndex.js";
import { writeCoreWikiFile, writeFileWiki } from "./utils/wikiWriter.js";
import type { WikiGenerationContext } from "./wikiTypes.js";

export async function updateWiki(repoRoot = process.cwd()): Promise<void> {
  console.log("Updating CodeSentinal LLM Wiki...");

  const readme = await parseReadme(repoRoot);
  const repoFiles = await scanRepoFiles(repoRoot);

  const fileWikiPages = repoFiles.map(generateFileWiki);

  for (const page of fileWikiPages) {
    await writeFileWiki(page.sourceFilePath, page.content);
  }

  const context: WikiGenerationContext = {
    repoRoot,
    readme,
    repoFiles,
    fileWikiPages,
  };

  await writeCoreWikiFile("architecture.md", generateArchitecture(context));
  await writeCoreWikiFile("database-schema.md", generateDatabaseSchema(context));
  await writeCoreWikiFile("coding-rules.md", generateCodingRules(context));
  await writeCoreWikiFile("review-rules.md", generateReviewRules());
  await writeCoreWikiFile("index.md", generateIndex(context));

  console.log("CodeSentinal LLM Wiki updated successfully.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  updateWiki().catch((error) => {
    console.error("Failed to update wiki:", error);
    process.exit(1);
  });
}