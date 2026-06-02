import { z } from "zod";
import { debugJson } from "./utils/debugLogger.js";
import { generateTextWithGemini } from "../llm.js";
import { CONFIG } from "../config/runtimeConfig.js";

import { buildWikiUpdatePrompt } from "./wikiUpdatePrompt.js";

import type {
  ReviewChunkWithWikiContext,
  WikiMarkdownUpdate,
  WikiUpdatePlan,
  WikiUpdateClassification,
} from "./wikiReviewTypes.js";

const wikiUpdatePlanSchema = z.object({
  classification: z.object({
    category: z.enum([
      "architecture",
      "data-contract",
      "review-behavior",
      "workflow",
      "security",
      "repository-memory",
      "implementation-detail",
      "no-wiki-update",
    ]),

    confidence: z.number().min(0).max(1),

    reason: z.string(),
  }),

  updatesRequired: z.boolean(),

  summary: z.string(),

  updates: z.array(
    z.object({
      target: z.enum([
        "file",
        "architecture",
        "database-schema",
        "review-rules",
        "repository-memory",
      ]),

      sourceFile: z.string().optional(),

      memorySection: z
        .enum([
          "Architectural Decisions",
          "Known Constraints",
          "Migration Notes",
          "Review Findings",
          "Integration Knowledge",
        ])
        .optional(),

      reason: z.string(),

      contentToAppend: z.string(),
    })
  ),
});

function emptyClassification(): WikiUpdateClassification {
  return {
    category: "no-wiki-update",
    confidence: 1,
    reason:
      "No valid wiki update classification available.",
  };
}

function emptyPlan(
  summary: string
): WikiUpdatePlan {
  return {
    classification: emptyClassification(),
    updatesRequired: false,
    summary,
    updates: [],
  };
}

function extractJson(raw: string): string {
  const trimmed = raw.trim();

  if (trimmed.startsWith("```json")) {
    return trimmed
      .replace(/^```json/i, "")
      .replace(/```$/i, "")
      .trim();
  }

  if (trimmed.startsWith("```")) {
    return trimmed
      .replace(/^```/i, "")
      .replace(/```$/i, "")
      .trim();
  }

  return trimmed;
}

function sanitizePlan(
  plan: WikiUpdatePlan
): WikiUpdatePlan {
  const safeUpdates = plan.updates.filter(
    (update) => {
      if (!update.contentToAppend.trim()) {
        return false;
      }

      if (
        update.target === "file" &&
        !update.sourceFile
      ) {
        return false;
      }

      if (
        update.target ===
          "repository-memory" &&
        !update.memorySection
      ) {
        return false;
      }

      return true;
    }
  );

  return {
    classification:
      plan.classification,

    updatesRequired:
      plan.updatesRequired &&
      safeUpdates.length > 0,

    summary:
      safeUpdates.length > 0
        ? plan.summary
        : "No safe wiki markdown updates required.",

    updates: safeUpdates,
  };
}

function chunkArray<T>(
  items: T[],
  size: number
): T[][] {
  const result: T[][] = [];

  for (
    let i = 0;
    i < items.length;
    i += size
  ) {
    result.push(
      items.slice(i, i + size)
    );
  }

  return result;
}

function deduplicateUpdates(
  updates: WikiMarkdownUpdate[]
): WikiMarkdownUpdate[] {
  const map = new Map<
    string,
    WikiMarkdownUpdate
  >();

  for (const update of updates) {
    const key = JSON.stringify({
      target: update.target,

      sourceFile:
        update.sourceFile ?? "",

      memorySection:
        update.memorySection ?? "",

      content:
        update.contentToAppend
          .trim()
          .toLowerCase(),
    });

    if (!map.has(key)) {
      map.set(key, update);
    }
  }

  return [...map.values()];
}

async function executeSingleBatch(
  chunks: ReviewChunkWithWikiContext[]
): Promise<WikiUpdatePlan> {
  const prompt =
    buildWikiUpdatePrompt(chunks);

  const raw =
    await generateTextWithGemini(
      prompt
    );

    debugJson(
  "WIKI_PLANNER_PROMPT",
  prompt
);
  let parsed: unknown;

  try {
    parsed = JSON.parse(
      extractJson(raw)
    );
  } catch {
    console.log(
      "[CodeSentinal Wiki] Invalid JSON from planner."
    );

    return emptyPlan(
      "Planner returned invalid JSON."
    );
  }

  const validated =
    wikiUpdatePlanSchema.safeParse(
      parsed
    );

  if (!validated.success) {
    console.log(
      "[CodeSentinal Wiki] Planner schema mismatch."
    );

    console.log(validated.error);

    return emptyPlan(
      "Planner response failed schema validation."
    );
  }

  return sanitizePlan(
    validated.data as WikiUpdatePlan
  );
}

export async function planWikiMarkdownUpdates(
  chunks: ReviewChunkWithWikiContext[]
): Promise<WikiUpdatePlan> {
  if (chunks.length === 0) {
    return emptyPlan(
      "No chunks available for wiki update planning."
    );
  }

  const batchSize =
    CONFIG.wiki.maxFilesPerBatch;

  const chunkBatches =
    chunkArray(
      chunks,
      batchSize
    );

  console.log(
    `[CodeSentinal Wiki] Processing ${chunks.length} chunks in ${chunkBatches.length} batch(es).`
  );

  const allUpdates: WikiMarkdownUpdate[] =
    [];

  const summaries: string[] = [];

  let highestClassification =
    emptyClassification();

  for (
    let batchIndex = 0;
    batchIndex <
    chunkBatches.length;
    batchIndex++
  ) {
    const batch =
      chunkBatches[batchIndex];

    console.log(
      `[CodeSentinal Wiki] Running planner batch ${batchIndex + 1}/${chunkBatches.length}`
    );

    try {
      const result =
        await executeSingleBatch(
          batch
        );

      summaries.push(
        result.summary
      );

      allUpdates.push(
        ...result.updates
      );

      if (
        result.classification
          .confidence >
        highestClassification.confidence
      ) {
        highestClassification =
          result.classification;
      }
    } catch (error) {
      console.log(
        `[CodeSentinal Wiki] Planner batch failed: ${batchIndex + 1}`
      );

      console.log(error);
    }
  }

  if (
    highestClassification.confidence <
    CONFIG.wiki.minMemoryConfidence
  ) {
    return {
      classification:
        highestClassification,

      updatesRequired: false,

      summary:
        `Skipped wiki update because confidence ${highestClassification.confidence} is below threshold ${CONFIG.wiki.minMemoryConfidence}.`,

      updates: [],
    };
  }

  const dedupedUpdates =
    deduplicateUpdates(
      allUpdates
    ).slice(
      0,
      CONFIG.wiki.maxFileUpdatesPerRun
    );

  return {
    classification:
      dedupedUpdates.length > 0
        ? highestClassification
        : emptyClassification(),

    updatesRequired:
      dedupedUpdates.length > 0,

    summary:
      summaries.join(" | ") ||
      "No wiki updates required.",

    updates: dedupedUpdates,
  };
}