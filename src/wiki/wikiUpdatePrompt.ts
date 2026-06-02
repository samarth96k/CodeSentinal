import { CONFIG } from "../config/runtimeConfig.js";
import type {
  ReviewChunkWithWikiContext,
} from "./wikiReviewTypes.js";

function buildCompactChunk(
  chunk: ReviewChunkWithWikiContext
) {
  return {
    filename: chunk.filename,

    startLine: chunk.startLine,

    endLine: chunk.endLine,

    addedLines: chunk.addedLines,

    removedLines: chunk.removedLines,

    codeWithContext:
      chunk.codeWithContext.slice(
        0,
        CONFIG.review.maxContextCharsPerChunk
      ),

    wikiDocuments:
      chunk.wikiDocuments.map(
        (doc) => ({
          wikiFilePath:
            doc.wikiFilePath,

          reason:
            doc.reason,
        })
      ),
  };
}

export function buildWikiUpdatePrompt(
  chunks: ReviewChunkWithWikiContext[]
): string {
  const compactChunks =
    chunks.map(buildCompactChunk);

  return `
You are CodeSentinal's Repository Memory Engine.

IMPORTANT

This task is NOT documentation generation.

This task is NOT architecture generation.

This task exists ONLY to maintain long-term repository memory used by future pull request reviews.

Your job:

1. Classify the repository change.
2. Decide whether repository memory should be updated.
3. Decide which repository knowledge area is affected.
4. Produce concise memory updates.

------------------------------------------------

CLASSIFICATION

Before producing updates classify the change.

Allowed categories:

- architecture
- data-contract
- review-behavior
- workflow
- security
- repository-memory
- implementation-detail
- no-wiki-update

Confidence must be between 0 and 1.

Examples:

0.20 = weak confidence

0.50 = moderate confidence

0.90 = high confidence

1.00 = extremely certain

Reason should explain WHY the category was selected.

------------------------------------------------

REPOSITORY MEMORY PRINCIPLE

Store ONLY information that would help a future reviewer understand future pull requests.

Store:

- architectural decisions
- workflow decisions
- integrations
- security assumptions
- data contracts
- review guidance
- repository constraints
- migration knowledge

Do NOT store:

- implementation details
- formatting changes
- comments
- variable renames
- refactors without behavioral impact
- code that can easily be inferred by reading the source

------------------------------------------------

UPDATE TARGETS

You MUST NOT generate wiki file paths.

You MUST NOT generate markdown filenames.

You MUST generate update targets.

Allowed targets:

- file
- architecture
- database-schema
- review-rules
- repository-memory

Routing is handled by the system.

------------------------------------------------

FILE TARGET

Use target="file" when repository memory belongs to a specific source file.

Provide:

{
  "target": "file",
  "sourceFile": "src/example.ts"
}

------------------------------------------------

ARCHITECTURE TARGET

Use target="architecture" when architecture-level knowledge changed.

------------------------------------------------

DATABASE TARGET

Use target="database-schema" when:

- schemas changed
- interfaces changed
- contracts changed
- DTOs changed
- validation rules changed

------------------------------------------------

REVIEW RULES TARGET

Use target="review-rules" when:

- reviewer behavior changed
- review workflow changed
- LLM review behavior changed
- review guidance changed

------------------------------------------------

REPOSITORY MEMORY TARGET

Use target="repository-memory" for durable repository knowledge.

Allowed memory sections:

- Architectural Decisions
- Known Constraints
- Migration Notes
- Review Findings
- Integration Knowledge

When target="repository-memory"
you MUST provide memorySection.

Example:

{
  "target": "repository-memory",
  "memorySection": "Architectural Decisions"
}

------------------------------------------------

CONTENT RULES

contentToAppend must be:

- concise
- future-review useful
- repository memory
- durable

BAD:

"Added a function."

BAD:

"Created helper method."

GOOD:

"Introduced runtime configuration driven wiki batching. Future reviewers should ensure batching limits remain synchronized across planner, context builder, and patch application logic."

GOOD:

"Repository review workflow now depends on wiki classification metadata. Future changes must preserve compatibility between planner schema and review pipeline."

------------------------------------------------

UPDATE RULES

Return updates ONLY when PR introduces:

- architectural change
- workflow change
- security change
- API contract change
- integration change
- responsibility change
- repository constraint
- migration requirement

Do NOT generate updates for:

- formatting
- comments
- refactors
- renames
- lint fixes
- variable renaming
- implementation-only details

------------------------------------------------

LIMITS

Never return more than ${CONFIG.wiki.maxFileUpdatesPerRun} updates.

------------------------------------------------

RETURN JSON ONLY

{
  "classification": {
    "category": "architecture",
    "confidence": 0.91,
    "reason": "Workflow execution path changed."
  },

  "updatesRequired": true,

  "summary": "Short summary.",

  "updates": [
    {
      "target": "file",
      "sourceFile": "src/wiki/github.ts",
      "reason": "Repository responsibility changed.",
      "contentToAppend": "Future reviewers should verify..."
    },
    {
      "target": "repository-memory",
      "memorySection": "Architectural Decisions",
      "reason": "Repository architecture evolved.",
      "contentToAppend": "Wiki routing now uses deterministic target resolution."
    }
  ]
}

If no update required:

{
  "classification": {
    "category": "no-wiki-update",
    "confidence": 1,
    "reason": "No durable repository memory change detected."
  },

  "updatesRequired": false,

  "summary": "No repository memory update required.",

  "updates": []
}

Changed PR chunks:

${JSON.stringify(compactChunks, null, 2)}
`;
}