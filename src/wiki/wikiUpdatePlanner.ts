import { z } from "zod";
import { generateTextWithGemini } from "../llm.js";
import { buildWikiUpdatePrompt } from "./wikiUpdatePrompt.js";
import { isSafeWikiMarkdownPath } from "./wikiPathMapper.js";
import type {
  ReviewChunkWithWikiContext,
  WikiUpdatePlan,
} from "./wikiReviewTypes.js";

const wikiUpdatePlanSchema = z.object({
  updatesRequired: z.boolean(),
  summary: z.string(),
  updates: z.array(
    z.object({
      wikiFilePath: z.string(),
      changeType: z.literal("append"),
      reason: z.string(),
      contentToAppend: z.string(),
    })
  ),
});

function extractJson(raw: string): string {
  const trimmed = raw.trim();

  if (trimmed.startsWith("```json")) {
    return trimmed.replace(/^```json/i, "").replace(/```$/i, "").trim();
  }

  if (trimmed.startsWith("```")) {
    return trimmed.replace(/^```/i, "").replace(/```$/i, "").trim();
  }

  return trimmed;
}

function sanitizePlan(plan: WikiUpdatePlan): WikiUpdatePlan {
  const safeUpdates = plan.updates.filter((update) => {
    if (!isSafeWikiMarkdownPath(update.wikiFilePath)) return false;
    if (!update.contentToAppend.trim()) return false;
    return true;
  });

  return {
    updatesRequired: plan.updatesRequired && safeUpdates.length > 0,
    summary:
      safeUpdates.length > 0
        ? plan.summary
        : "No safe wiki markdown updates required.",
    updates: safeUpdates,
  };
}

export async function planWikiMarkdownUpdates(
  chunks: ReviewChunkWithWikiContext[]
): Promise<WikiUpdatePlan> {
  if (chunks.length === 0) {
    return {
      updatesRequired: false,
      summary: "No chunks available for wiki update planning.",
      updates: [],
    };
  }

  const prompt = buildWikiUpdatePrompt(chunks);
  const raw = await generateTextWithGemini(prompt);

  let parsed: unknown;

  try {
    parsed = JSON.parse(extractJson(raw));
  } catch {
    console.log("[CodeSentinal Wiki] Invalid JSON from wiki update planner:");
    console.log(raw);

    return {
      updatesRequired: false,
      summary: "Wiki update planner returned invalid JSON.",
      updates: [],
    };
  }

  const validated = wikiUpdatePlanSchema.safeParse(parsed);

  if (!validated.success) {
    console.log("[CodeSentinal Wiki] Wiki update plan schema mismatch:");
    console.log(validated.error);

    return {
      updatesRequired: false,
      summary: "Wiki update planner response did not match schema.",
      updates: [],
    };
  }

  return sanitizePlan(validated.data);
}