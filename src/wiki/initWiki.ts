// import process from "process";
// import { parseReadme } from "./parsers/parseReadme.js";
// import { scanRepoFiles } from "./parsers/scanRepoFiles.js";
// import { generateFileWiki } from "./generators/generateFileWiki.js";
// import { generateArchitecture } from "./generators/generateArchitecture.js";
// import { generateDatabaseSchema } from "./generators/generateDatabaseSchema.js";
// import { generateCodingRules } from "./generators/generateCodingRules.js";
// import { generateReviewRules } from "./generators/generateReviewRules.js";
// import { generateIndex } from "./generators/generateIndex.js";
// import { writeCoreWikiFile, writeFileWiki } from "./utils/wikiWriter.js";
// import type { WikiGenerationContext } from "./wikiTypes.js";

// export async function initWiki(repoRoot = process.cwd()): Promise<void> {
//   console.log("Initializing CodeSentinal LLM Wiki...");

//   const readme = await parseReadme(repoRoot);
//   const repoFiles = await scanRepoFiles(repoRoot);

//   const fileWikiPages = repoFiles.map(generateFileWiki);

//   for (const page of fileWikiPages) {
//     await writeFileWiki(page.sourceFilePath, page.content);
//   }

//   const context: WikiGenerationContext = {
//     repoRoot,
//     readme,
//     repoFiles,
//     fileWikiPages,
//   };

//   await writeCoreWikiFile("architecture.md", generateArchitecture(context));
//   await writeCoreWikiFile("database-schema.md", generateDatabaseSchema(context));
//   await writeCoreWikiFile("coding-rules.md", generateCodingRules(context));
//   await writeCoreWikiFile("review-rules.md", generateReviewRules());
//   await writeCoreWikiFile("index.md", generateIndex(context));

//   console.log("CodeSentinal LLM Wiki initialized successfully.");
// }

// if (import.meta.url === `file://${process.argv[1]}`) {
//   initWiki().catch((error) => {
//     console.error("Failed to initialize wiki:", error);
//     process.exit(1);
//   });
// }
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
import type { WikiWriteResult } from "./wikiTypes.js";

const MAX_FILE_WIKI_GENERATIONS = Number(
  process.env.CODE_SENTINAL_MAX_WIKI_FILES || "40"
);

function shouldGenerateFileWiki(filePath: string): boolean {
  const lower = filePath.toLowerCase();

  if (lower.includes("package-lock.json")) return false;
  if (lower.includes("dist/")) return false;
  if (lower.includes("node_modules/")) return false;

  return true;
}

export async function initWiki(repoRoot = process.cwd()): Promise<WikiWriteResult> {
  console.log("[CodeSentinal Wiki] Starting LLM-powered wiki initialization...");

  await prepareWikiFolders();

  const analysis = await analyzeRepository(repoRoot);

  console.log(`[CodeSentinal Wiki] Repository analyzed.`);
  console.log(`[CodeSentinal Wiki] Files found: ${analysis.files.length}`);

  const writtenFiles: string[] = [];
  const skippedFiles: string[] = [];

  const fileAnalysesToGenerate = analysis.fileAnalyses
    .filter((item) => shouldGenerateFileWiki(item.file.path))
    .slice(0, MAX_FILE_WIKI_GENERATIONS);

  console.log(
    `[CodeSentinal Wiki] Generating file wiki pages: ${fileAnalysesToGenerate.length}`
  );

  for (const fileAnalysis of fileAnalysesToGenerate) {
    try {
      console.log(`[CodeSentinal Wiki] Generating wiki for ${fileAnalysis.file.path}`);

      const markdown = await generateFileWikiWithLLM(fileAnalysis);
      const writtenPath = await writeFileWiki(fileAnalysis.file.path, markdown);

      writtenFiles.push(writtenPath);
    } catch (error) {
      console.warn(
        `[CodeSentinal Wiki] Failed to generate wiki for ${fileAnalysis.file.path}`,
        error
      );

      skippedFiles.push(fileAnalysis.file.path);
    }
  }

  const fileEntries = fileAnalysesToGenerate.map((item) => {
    const wikiPath = sourcePathToWikiPath(item.file.path).replace(
      ".codesentinal/wiki/",
      ""
    );

    return `- [${item.file.path}](${wikiPath}) — ${item.purpose}`;
  });

  const coreGenerators: Array<{
    fileName: string;
    generate: () => Promise<string>;
  }> = [
    {
      fileName: "architecture.md",
      generate: () => generateArchitectureWithLLM(analysis),
    },
    {
      fileName: "database-schema.md",
      generate: () => generateDataContractsWithLLM(analysis),
    },
    {
      fileName: "coding-rules.md",
      generate: () => generateCodingRulesWithLLM(analysis),
    },
    {
      fileName: "review-rules.md",
      generate: () => generateReviewRulesWithLLM(analysis),
    },
    {
      fileName: "index.md",
      generate: () => generateIndexWithLLM(analysis, fileEntries),
    },
  ];

  for (const core of coreGenerators) {
    try {
      console.log(`[CodeSentinal Wiki] Generating ${core.fileName}`);

      const markdown = await core.generate();
      const writtenPath = await writeCoreWikiFile(core.fileName, markdown);

      writtenFiles.push(writtenPath);
    } catch (error) {
      console.warn(`[CodeSentinal Wiki] Failed to generate ${core.fileName}`, error);
      skippedFiles.push(core.fileName);
    }
  }

  console.log("[CodeSentinal Wiki] LLM Wiki initialization complete.");
  console.log(`[CodeSentinal Wiki] Written files: ${writtenFiles.length}`);
  console.log(`[CodeSentinal Wiki] Skipped files: ${skippedFiles.length}`);

  return {
    writtenFiles,
    skippedFiles,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  initWiki().catch((error) => {
    console.error("[CodeSentinal Wiki] Initialization failed:", error);
    process.exit(1);
  });
}