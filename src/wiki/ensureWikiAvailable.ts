import { pathExists } from "./utils/fileHelpers.js";
import { initWiki } from "./initWiki.js";
import { analyzeRepository } from "./analyzer/repoAnalyzer.js";
import { sourcePathToWikiPath } from "./utils/wikiWriter.js";

const REQUIRED_CORE_WIKI_FILES = [
  ".codesentinal/wiki/index.md",
  ".codesentinal/wiki/architecture.md",
  ".codesentinal/wiki/database-schema.md",
  ".codesentinal/wiki/coding-rules.md",
  ".codesentinal/wiki/review-rules.md",
  ".codesentinal/wiki/repository-memory.md",
];

export async function ensureWikiAvailable(): Promise<void> {
  let wikiNeedsInitialization = false;

  const missingCoreFiles: string[] = [];

  for (const file of REQUIRED_CORE_WIKI_FILES) {
    const exists = await pathExists(file);

    if (!exists) {
      missingCoreFiles.push(file);
      wikiNeedsInitialization = true;
    }
  }

  if (missingCoreFiles.length > 0) {
    console.log(
      `[CodeSentinal Wiki] Missing ${missingCoreFiles.length} core wiki files.`
    );

    for (const file of missingCoreFiles) {
      console.log(
        `[CodeSentinal Wiki] Missing core wiki: ${file}`
      );
    }
  }

  const analysis = await analyzeRepository(process.cwd());

  const missingFileWikiPages: string[] = [];

  for (const fileAnalysis of analysis.fileAnalyses) {
    const wikiPath = sourcePathToWikiPath(fileAnalysis.file.path);

    const exists = await pathExists(wikiPath);

    if (!exists) {
      missingFileWikiPages.push(fileAnalysis.file.path);
      wikiNeedsInitialization = true;
    }
  }

  if (missingFileWikiPages.length > 0) {
    console.log(
      `[CodeSentinal Wiki] Missing ${missingFileWikiPages.length} file wiki pages.`
    );

    for (const file of missingFileWikiPages.slice(0, 20)) {
      console.log(
        `[CodeSentinal Wiki] Missing file wiki page for: ${file}`
      );
    }

    if (missingFileWikiPages.length > 20) {
      console.log(
        `[CodeSentinal Wiki] ...and ${
          missingFileWikiPages.length - 20
        } more.`
      );
    }
  }

  if (!wikiNeedsInitialization) {
    console.log(
      "[CodeSentinal Wiki] Wiki integrity check passed."
    );
    return;
  }

  console.log(
    "[CodeSentinal Wiki] Wiki incomplete. Starting repair."
  );

  await initWiki();

  console.log(
    "[CodeSentinal Wiki] Wiki repair completed."
  );
}