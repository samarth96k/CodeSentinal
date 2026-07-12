import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { buildReviewPrompt } from "./prompt.js";
import {CONFIG} from "./config/runtimeConfig.js";
import type {
  ReviewPromptBundle,
} from "./wiki/wikiReviewTypes.js";import { debugJson } from "./wiki/utils/debugLogger.js";
import {
  deduplicateReviews,
} from "./wiki/reviewDeduplicator.js";
dotenv.config();

let ai: GoogleGenAI | null = null;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function executeWithRetry<T>(
  operation: () => Promise<T>
): Promise<T> {
  let attempt = 0;

  while (true) {
    try {
      return await operation();
    } catch (error: any) {
      attempt++;

      const status =
        error?.status ??
        error?.response?.status;

      const message =
        String(
          error?.message ?? ""
        ).toLowerCase();

      const retryable =
        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504 ||
        message.includes(
          "timeout"
        ) ||
        message.includes(
          "deadline"
        ) ||
        message.includes(
          "rate limit"
        ) ||
        message.includes(
          "quota"
        );

      if (!retryable) {
        throw error;
      }

      if (
        attempt >=
        CONFIG.llm.maxRetries
      ) {
        throw error;
      }

      const delay =
        CONFIG.llm.retryDelayMs *
        Math.pow(
          2,
          attempt - 1
        );

      console.log(
        `[CodeSentinal LLM] Retry ${attempt}/${CONFIG.llm.maxRetries} after ${delay}ms`
      );

      await sleep(delay);
    }
  }
}

async function withTimeout<T>(
  promise: Promise<T>
): Promise<T> {
  return Promise.race([
    promise,

    new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              "Gemini request timeout exceeded"
            )
          ),
        CONFIG.llm.requestTimeoutMs
      )
    ),
  ]);
}

async function waitBeforeGeminiCall(): Promise<void> {
  await sleep(CONFIG.llm.retryDelayMs);
}

function getGeminiClient(): GoogleGenAI {
  if (ai) return ai;

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing. Provide it as an environment variable or through the GitHub Action input gemini_api_key."
    );
  }

  ai = new GoogleGenAI({ apiKey });
  return ai;
}

export async function generateTextWithGemini(prompt: string): Promise<string> {
  await waitBeforeGeminiCall();

  const response =
    await executeWithRetry(() =>
      withTimeout(
        getGeminiClient().models.generateContent({
          model: CONFIG.llm.wikiModel,
          contents: prompt,
        })
      )
    );

  return response.text?.trim() || "";
}

const llmReviewSchema = z.object({
  reviews: z.array(
    z.object({
      filename: z.string(),
      line: z.number(),
      severity: z.enum(["low", "medium", "high"]),
      category: z.enum([
        "bug",
        "security",
        "performance",
        "maintainability",
        "error_handling",
        "logic",
        "other",
      ]),
      issue: z.string(),
      suggestion: z.string(),
      githubComment: z.object({
        path: z.string(),
        line: z.number(),
        side: z.literal("RIGHT"),
        body: z.string(),
      }),
    })
  ),
});

type LLMReviewResponse = z.infer<typeof llmReviewSchema>;

const geminiResponseSchema = {
  type: "object",
  properties: {
    reviews: {
      type: "array",
      items: {
        type: "object",
        properties: {
          filename: { type: "string" },
          line: { type: "number" },
          severity: { type: "string", enum: ["low", "medium", "high"] },
          category: {
            type: "string",
            enum: [
              "bug",
              "security",
              "performance",
              "maintainability",
              "error_handling",
              "logic",
              "other",
            ],
          },
          issue: { type: "string" },
          suggestion: { type: "string" },
          githubComment: {
            type: "object",
            properties: {
              path: { type: "string" },
              line: { type: "number" },
              side: { type: "string", enum: ["RIGHT"] },
              body: { type: "string" },
            },
            required: ["path", "line", "side", "body"],
          },
        },
        required: [
          "filename",
          "line",
          "severity",
          "category",
          "issue",
          "suggestion",
          "githubComment",
        ],
      },
    },
  },
  required: ["reviews"],
};

export async function reviewChunksWithLLM(
  reviewBundle: ReviewPromptBundle
): Promise<LLMReviewResponse>{
if (
  reviewBundle.chunks.length === 0
) {
  return {
    reviews: [],
  };
}
debugJson(
  "PROMPT_INPUT_STATS",
  {
    chunks:
      reviewBundle.chunks.length,

    globalContextChars:
      reviewBundle.globalContext.length,
  }
);
const prompt =
  buildReviewPrompt(
    reviewBundle
  );
debugJson(
  "PROMPT_STATS",
  {
    chars:
      prompt.length,
  }
);
  await waitBeforeGeminiCall();

  const response =
    await executeWithRetry(() =>
      withTimeout(
        getGeminiClient().models.generateContent({
          model: CONFIG.llm.reviewModel,

          contents: prompt,

          config: {
            responseMimeType:
              "application/json",

            responseSchema:
              geminiResponseSchema,
          },
        })
      )
    );

  const rawText =
    response.text ??
    '{"reviews":[]}';

  let parsed: unknown;

  try {
    parsed =
      JSON.parse(rawText);
      debugJson(
  "REVIEW_RESPONSE",
  parsed
);
  } catch {
    console.log(
      "Gemini returned invalid JSON:"
    );

    console.log(rawText);

    return { reviews: [] };
  }

  const validated =
    llmReviewSchema.safeParse(
      parsed
    );

  if (!validated.success) {
    console.log(
      "Gemini JSON did not match expected schema:"
    );

    console.log(
      validated.error
    );

    return { reviews: [] };
  }

  const deduplicatedReviews =
    deduplicateReviews(
      validated.data.reviews
    );

  console.log(
    `[CodeSentinal] Reviews before dedupe: ${validated.data.reviews.length}`
  );

  console.log(
    `[CodeSentinal] Reviews after dedupe: ${deduplicatedReviews.length}`
  );

  return {
    reviews:
      deduplicatedReviews.slice(
        0,
        CONFIG.github.maxInlineComments
      ),
  };
}