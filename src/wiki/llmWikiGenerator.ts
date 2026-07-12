import { generateTextWithGemini } from "../llm.js";
import type { FileAnalysis, RepositoryAnalysis } from "./wikiTypes.js";
import {
  buildArchitectureWikiPrompt,
  buildCodingRulesWikiPrompt,
  buildDataContractsWikiPrompt,
  buildFileWikiPrompt,
  buildIndexWikiPrompt,
  buildReviewRulesWikiPrompt,
} from "./llmWikiPrompts.js";

function cleanMarkdown(
  markdown: string,
  fallbackTitle: string
): string {
  const cleaned = markdown
    .replace(/^```(?:md|markdown)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  if (!cleaned) {
    return `# ${fallbackTitle}\n\nNo content generated.\n`;
  }

  const normalized = cleaned.startsWith("#")
    ? cleaned
    : `# ${fallbackTitle}\n\n${cleaned}`;

  return normalized.trimEnd() + "\n";
}

async function generateMarkdown(
  prompt: string,
  fallbackTitle: string
): Promise<string> {
  const response = await generateTextWithGemini(prompt);

  return cleanMarkdown(
    response,
    fallbackTitle
  );
}

export async function generateFileWikiWithLLM(
  fileAnalysis: FileAnalysis
): Promise<string> {
  return generateMarkdown(
    buildFileWikiPrompt(fileAnalysis),
    fileAnalysis.file.path
  );
}

export async function generateArchitectureWithLLM(
  analysis: RepositoryAnalysis
): Promise<string> {
  return generateMarkdown(
    buildArchitectureWikiPrompt(analysis),
    "Architecture"
  );
}

export async function generateDataContractsWithLLM(
  analysis: RepositoryAnalysis
): Promise<string> {
  return generateMarkdown(
    buildDataContractsWikiPrompt(analysis),
    "Database Schema and Data Contracts"
  );
}

export async function generateCodingRulesWithLLM(
  analysis: RepositoryAnalysis
): Promise<string> {
  return generateMarkdown(
    buildCodingRulesWikiPrompt(analysis),
    "Coding Rules"
  );
}

export async function generateReviewRulesWithLLM(
  analysis: RepositoryAnalysis
): Promise<string> {
  return generateMarkdown(
    buildReviewRulesWikiPrompt(analysis),
    "Review Rules"
  );
}

export async function generateIndexWithLLM(
  analysis: RepositoryAnalysis,
  fileEntries: string[]
): Promise<string> {
  return generateMarkdown(
    buildIndexWikiPrompt(
      analysis,
      fileEntries
    ),
    "CodeSentinal LLM Wiki"
  );
}