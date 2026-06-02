import { pathExists } from "./utils/fileHelpers.js";
import { initWiki } from "./initWiki.js";
import { analyzeRepository } from "./analyzer/repoAnalyzer.js";
import { sourcePathToWikiPath } from "./utils/wikiWriter.js";

const CORE_WIKI_FILES = [
  ".codesentinal/wiki/index.md",
  ".codesentinal/wiki/architecture.md",
  ".codesentinal/wiki/database-schema.md",
  ".codesentinal/wiki/repository-memory.md",
];

const MAX_ALLOWED_MISSING_PERCENTAGE = 5;

export async function ensureWikiAvailable(): Promise<void> {
  console.log(
    "[CodeSentinal Wiki] Starting wiki validation..."
  );

  const forceRepair =
    process.env.CODESENTINAL_FORCE_WIKI_REPAIR === "true";

  const missingCoreFiles = (
    await Promise.all(
      CORE_WIKI_FILES.map(async (file) => ({
        file,
        exists: await pathExists(file),
      }))
    )
  )
    .filter((result) => !result.exists)
    .map((result) => result.file);

  const analysis = await analyzeRepository(process.cwd());

  const missingWikiPages: string[] = [];

  await Promise.all(
    analysis.fileAnalyses.map(async (fileAnalysis) => {
      const wikiPath = sourcePathToWikiPath(
        fileAnalysis.file.path
      );

      const exists = await pathExists(wikiPath);

      if (!exists) {
        missingWikiPages.push(fileAnalysis.file.path);
      }
    })
  );

  const totalSourceFiles =
    analysis.fileAnalyses.length;

  const missingPercentage =
    totalSourceFiles === 0
      ? 0
      : (missingWikiPages.length /
          totalSourceFiles) *
        100;

  console.log(
    `[CodeSentinal Wiki] Source files: ${totalSourceFiles}`
  );

  console.log(
    `[CodeSentinal Wiki] Missing file pages: ${missingWikiPages.length}`
  );

  console.log(
    `[CodeSentinal Wiki] Missing percentage: ${missingPercentage.toFixed(
      2
    )}%`
  );

  let shouldRepair = false;

  if (missingCoreFiles.length > 0) {
    shouldRepair = true;

    console.log(
      `[CodeSentinal Wiki] ${missingCoreFiles.length} core wiki files are missing.`
    );

    missingCoreFiles.forEach((file) =>
      console.log(
        `[CodeSentinal Wiki] Missing core file -> ${file}`
      )
    );
  }

  if (
    missingPercentage >
    MAX_ALLOWED_MISSING_PERCENTAGE
  ) {
    shouldRepair = true;

    console.log(
      `[CodeSentinal Wiki] Missing wiki page percentage exceeded threshold (${MAX_ALLOWED_MISSING_PERCENTAGE}%).`
    );
  }

  if (forceRepair) {
    shouldRepair = true;

    console.log(
      "[CodeSentinal Wiki] Force repair mode enabled."
    );
  }

  if (!shouldRepair) {
    console.log(
      "[CodeSentinal Wiki] Validation successful. No repair needed."
    );
    return;
  }

  console.log(
    "[CodeSentinal Wiki] Repair process initiated..."
  );

  const startTime = Date.now();

  await initWiki();

  const duration = Date.now() - startTime;

  console.log(
    `[CodeSentinal Wiki] Repair completed in ${duration}ms.`
  );
}