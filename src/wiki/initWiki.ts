import process from "process";
import { analyzeRepository } from "./analyzer/repoAnalyzer.js";
import {
  generateArchitectureWithLLM,
  generateCodingRulesWithLLM,
  generateDataContractsWithLLM,
  generateFileWikiWithLLM,
  generateIndexWithLLM,
  generateReviewRulesWithLLM,
} from "./llmWikiGenerator.js";

import {
  prepareWikiFolders,
  sourcePathToWikiPath,
  writeCoreWikiFile,
  writeFileWiki,
} from "./utils/wikiWriter.js";

import { pathExists } from "./utils/fileHelpers.js";
import { CONFIG } from "../config/runtimeConfig.js";

import type { WikiWriteResult } from "./wikiTypes.js";

function shouldGenerateFileWiki(filePath: string): boolean {
  const lower = filePath.toLowerCase();

  if (lower.includes("package-lock.json")) return false;
  if (lower.includes("dist/")) return false;
  if (lower.includes("node_modules/")) return false;

  return true;
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }

  return chunks;
}

export async function initWiki(
  repoRoot = process.cwd()
): Promise<WikiWriteResult> {
  console.log(
    "[CodeSentinal Wiki] Starting LLM-powered wiki initialization..."
  );

  await prepareWikiFolders();

  const analysis = await analyzeRepository(repoRoot);

  console.log("[CodeSentinal Wiki] Repository analyzed.");
  console.log(
    `[CodeSentinal Wiki] Files found: ${analysis.files.length}`
  );

  const writtenFiles: string[] = [];
  const skippedFiles: string[] = [];

  const fileAnalysesToGenerate = [];

  for (const item of analysis.fileAnalyses) {
    if (!shouldGenerateFileWiki(item.file.path)) {
      continue;
    }

    const wikiPath = sourcePathToWikiPath(item.file.path);

    const exists = await pathExists(wikiPath);

    if (!exists) {
      fileAnalysesToGenerate.push(item);
    }
  }

  console.log(
    `[CodeSentinal Wiki] Missing file wiki pages detected: ${fileAnalysesToGenerate.length}`
  );

  const batches = chunkArray(
    fileAnalysesToGenerate,
    CONFIG.wiki.maxFilesPerBatch
  );

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];

    console.log(
      `[CodeSentinal Wiki] Processing batch ${batchIndex + 1
      }/${batches.length} (${batch.length} files)`
    );

    for (const fileAnalysis of batch) {
      try {
        console.log(
          `[CodeSentinal Wiki] Generating wiki for ${fileAnalysis.file.path}`
        );

        const markdown = await generateFileWikiWithLLM(
          fileAnalysis
        );

        const writtenPath = await writeFileWiki(
          fileAnalysis.file.path,
          markdown
        );

        writtenFiles.push(writtenPath);
      } catch (error) {
        console.warn(
          `[CodeSentinal Wiki] Failed to generate wiki for ${fileAnalysis.file.path}`,
          error
        );

        skippedFiles.push(fileAnalysis.file.path);
      }
    }
  }

  const fileEntries = analysis.fileAnalyses
    .filter((item) => shouldGenerateFileWiki(item.file.path))
    .map((item) => {
      const wikiPath = sourcePathToWikiPath(
        item.file.path
      ).replace(".codesentinal/wiki/", "");

      return `- [${item.file.path}](${wikiPath}) — ${item.purpose}`;
    });

  const coreGenerators: Array<{
    fileName: string;
    generate: () => Promise<string>;
  }> = [
      {
        fileName: "architecture.md",
        generate: () =>
          generateArchitectureWithLLM(analysis),
      },
      {
        fileName: "database-schema.md",
        generate: () =>
          generateDataContractsWithLLM(analysis),
      },
      {
        fileName: "coding-rules.md",
        generate: () =>
          generateCodingRulesWithLLM(analysis),
      },
      {
        fileName: "review-rules.md",
        generate: () =>
          generateReviewRulesWithLLM(analysis),
      },
      {
        fileName: "index.md",
        generate: () =>
          generateIndexWithLLM(
            analysis,
            fileEntries
          ),
      },
      {
        fileName: "repository-memory.md",
        generate: async () => `
# Repository Memory

This file stores long-term repository knowledge.

## Architectural Decisions

Document major architectural decisions.

---

## Known Constraints

Document repository limitations.

---

## Migration Notes

Document migrations and compatibility concerns.

---

## Review Findings

Document recurring review findings and lessons.

---

## Integration Knowledge

Document external integrations, workflows, and cross-system behavior.
`,
      }
    ];

  for (const core of coreGenerators) {
    try {
      console.log(
        `[CodeSentinal Wiki] Generating ${core.fileName}`
      );

      const markdown = await core.generate();

      const writtenPath = await writeCoreWikiFile(
        core.fileName,
        markdown
      );

      writtenFiles.push(writtenPath);
    } catch (error) {
      console.warn(
        `[CodeSentinal Wiki] Failed to generate ${core.fileName}`,
        error
      );

      skippedFiles.push(core.fileName);
    }
  }

  console.log(
    "[CodeSentinal Wiki] LLM Wiki initialization complete."
  );

  console.log(
    `[CodeSentinal Wiki] Written files: ${writtenFiles.length}`
  );

  console.log(
    `[CodeSentinal Wiki] Skipped files: ${skippedFiles.length}`
  );

  return {
    writtenFiles,
    skippedFiles,
  };
}