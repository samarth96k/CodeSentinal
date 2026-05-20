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

function cleanMarkdown(markdown: string, fallbackTitle: string): string {
  const cleaned = markdown
    .replace(/^```md\s*/i, "")
    .replace(/^```markdown\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  if (!cleaned) {
    return `# ${fallbackTitle}\n\nNo content generated.\n`;
  }

  if (!cleaned.startsWith("#")) {
    return `# ${fallbackTitle}\n\n${cleaned}\n`;
  }

  return cleaned + "\n";
}

export async function generateFileWikiWithLLM(
  fileAnalysis: FileAnalysis
): Promise<string> {
  const prompt = buildFileWikiPrompt(fileAnalysis);
  const markdown = await generateTextWithGemini(prompt);
  return cleanMarkdown(markdown, fileAnalysis.file.path);
}

export async function generateArchitectureWithLLM(
  analysis: RepositoryAnalysis
): Promise<string> {
  const markdown = await generateTextWithGemini(
    buildArchitectureWikiPrompt(analysis)
  );

  return cleanMarkdown(markdown, "Architecture");
}

export async function generateDataContractsWithLLM(
  analysis: RepositoryAnalysis
): Promise<string> {
  const markdown = await generateTextWithGemini(
    buildDataContractsWikiPrompt(analysis)
  );

  return cleanMarkdown(markdown, "Database Schema and Data Contracts");
}

export async function generateCodingRulesWithLLM(
  analysis: RepositoryAnalysis
): Promise<string> {
  const markdown = await generateTextWithGemini(
    buildCodingRulesWikiPrompt(analysis)
  );

  return cleanMarkdown(markdown, "Coding Rules");
}

export async function generateReviewRulesWithLLM(
  analysis: RepositoryAnalysis
): Promise<string> {
  const markdown = await generateTextWithGemini(
    buildReviewRulesWikiPrompt(analysis)
  );

  return cleanMarkdown(markdown, "Review Rules");
}

export async function generateIndexWithLLM(
  analysis: RepositoryAnalysis,
  fileEntries: string[]
): Promise<string> {
  const markdown = await generateTextWithGemini(
    buildIndexWikiPrompt(analysis, fileEntries)
  );

  return cleanMarkdown(markdown, "CodeSentinal LLM Wiki");
}