import { readTextFile } from "./utils/fileHelpers.js";
import type { ReviewChunk } from "../chunk.js";
export type RepositoryMemory = {
  section: string;
  memoryId: string;
  reason: string;
  knowledge: string;
};

export type ScoredRepositoryMemory =
  RepositoryMemory & {
    score: number;
  };

const REPOSITORY_MEMORY_PATH =
  ".codesentinal/wiki/repository-memory.md";

function normalize(
  value: string
): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_\-/ ]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function buildChunkText(
  chunk: ReviewChunk
): string {
  return [
    chunk.filename,

    chunk.metadata.language,

    chunk.metadata.hunkHeader,

    chunk.addedLines
      .map((line) => line.content)
      .join(" "),
  ].join(" ");
}

function buildMemoryText(
  memory: RepositoryMemory
): string {
  return [
    memory.section,

    memory.reason,

    memory.knowledge,
  ].join(" ");
}

function calculateSimilarity(
  query: string,
  document: string
): number {
  const queryTokens =
    new Set(normalize(query));

  const documentTokens =
    new Set(normalize(document));

  let matches = 0;

  for (const token of queryTokens) {
    if (
      documentTokens.has(token)
    ) {
      matches++;
    }
  }

  return matches;
}

export async function loadRepositoryMemories(): Promise<
  RepositoryMemory[]
> {
  let markdown = "";

  try {
    markdown =
      await readTextFile(
        REPOSITORY_MEMORY_PATH
      );
  } catch {
    return [];
  }

  const memories: RepositoryMemory[] =
    [];

  const sectionRegex =
    /## (.*?)\n([\s\S]*?)(?=\n## |\s*$)/g;

  let sectionMatch:
    | RegExpExecArray
    | null;

  while (
    (sectionMatch =
      sectionRegex.exec(
        markdown
      ))
  ) {
    const section =
      sectionMatch[1].trim();

    const sectionBody =
      sectionMatch[2];

    const memoryRegex =
      /### Memory ID:\s*(.*?)\n([\s\S]*?)(?=### Memory ID:|\s*$)/g;

    let memoryMatch:
      | RegExpExecArray
      | null;

    while (
      (memoryMatch =
        memoryRegex.exec(
          sectionBody
        ))
    ) {
      const memoryId =
        memoryMatch[1].trim();

      const memoryBody =
        memoryMatch[2];

      const reasonMatch =
        memoryBody.match(
          /\*\*Reason\*\*\s*([\s\S]*?)\*\*Knowledge\*\*/
        );

      const knowledgeMatch =
        memoryBody.match(
          /\*\*Knowledge\*\*\s*([\s\S]*)/
        );

      memories.push({
        section,

        memoryId,

        reason:
          reasonMatch?.[1]
            ?.trim() ?? "",

        knowledge:
          knowledgeMatch?.[1]
            ?.replace(
              /\n---$/,
              ""
            )
            .trim() ?? "",
      });
    }
  }

  return memories;
}

export function scoreMemory(
  chunk: ReviewChunk,
  memory: RepositoryMemory
): number {
  const chunkText =
    buildChunkText(chunk);

  const memoryText =
    buildMemoryText(memory);

  let score =
    calculateSimilarity(
      chunkText,
      memoryText
    );

  const fileName =
    chunk.filename
      .split("/")
      .pop()
      ?.toLowerCase() ?? "";

  if (
    memoryText.includes(
      fileName
    )
  ) {
    score += 5;
  }

  if (
    memory.section ===
    "Architectural Decisions"
  ) {
    score += 2;
  }

  return score;
}

export async function getRelevantMemories(
  chunk: ReviewChunk,
  limit = 5
): Promise<
  ScoredRepositoryMemory[]
> {
  const memories =
    await loadRepositoryMemories();

  return memories
    .map((memory) => ({
      ...memory,

      score: scoreMemory(
        chunk,
        memory
      ),
    }))
    .filter(
      (memory) =>
        memory.score > 0
    )
    .sort(
      (a, b) =>
        b.score - a.score
    )
    .slice(0, limit);
}