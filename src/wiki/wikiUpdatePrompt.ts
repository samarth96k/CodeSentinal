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
You are CodeSentinal's Wiki Maintenance Engine.

IMPORTANT

This task maintains the CodeSentinal repository wiki.

The repository wiki contains:

- file-level wiki pages
- architecture documentation
- database documentation
- review guidance
- repository memory

Your responsibility is to determine whether any wiki document should evolve based on the pull request.

Repository memory is only one part of the wiki system.

File wiki pages are expected to evolve more frequently than repository memory.

Your job:

1. Classify the repository change.
2. Decide whether any wiki document should be updated.
3. Decide which wiki knowledge area is affected.
4. Produce concise wiki updates.

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

WIKI EVOLUTION PRINCIPLE

Update wiki documents when a future developer would benefit from understanding the change without rereading the repository.

Possible update destinations include:

- file wiki pages
- architecture.md
- database-schema.md
- review-rules.md
- repository-memory.md

Not every change belongs in repository-memory.

File responsibility changes should usually update file wiki pages.

Architecture changes should usually update architecture.md.

Review workflow changes should usually update review-rules.md.

Long-term repository knowledge should usually update repository-memory.md.

Do NOT generate updates for:

- formatting changes
- comments
- lint fixes
- whitespace changes
- cosmetic refactors
- variable renames
- import reordering

Store implementation knowledge when it:

- changes responsibilities
- affects future maintenance
- changes execution flow
- affects integrations
- affects review behavior
- introduces repository constraints
- introduces required patterns
- introduces important assumptions
- changes subsystem interaction

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

Use target="file" when repository knowledge belongs primarily to a specific source file.

Provide:

{
  "target": "file",
  "sourceFile": "src/example.ts"
}

FILE WIKI GUIDANCE

Use target="file" when:

- a file gains responsibilities
- a file loses responsibilities
- a file coordinates additional modules
- a file introduces important maintenance requirements
- a file becomes part of a critical workflow
- future reviewers would benefit from understanding the file's evolving role

GOOD:

"orderController.js now validates payment status before order creation. Future modifications should preserve validation before persistence."

GOOD:

"github.ts now commits generated wiki files during review mode. Future workflow changes should preserve wiki initialization before context retrieval."

GOOD:

"repositoryMemoryWriter.ts now inserts memories into explicit sections. Future changes should preserve section-aware insertion behavior."

BAD:

"Added helper function."

BAD:

"Renamed variable."

BAD:

"Moved code into utility."

------------------------------------------------

ARCHITECTURE TARGET

Use target="architecture" when:

- subsystem responsibilities change
- execution flow changes
- component boundaries change
- major workflow changes occur
- architectural assumptions evolve

------------------------------------------------

DATABASE TARGET

Use target="database-schema" when:

- schemas changed
- interfaces changed
- contracts changed
- DTOs changed
- validation rules changed
- persistence assumptions changed

------------------------------------------------

REVIEW RULES TARGET

Use target="review-rules" when:

- reviewer behavior changed
- review workflow changed
- LLM review behavior changed
- review guidance changed
- review prioritization changed

------------------------------------------------

REPOSITORY MEMORY TARGET

Use target="repository-memory" only for durable repository knowledge that should remain useful across many future pull requests.

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

MEMORY WORTHINESS TEST

Before rejecting an update ask:

If a developer reviews this area six months from now, would knowing this information help them:

- understand the repository
- review future pull requests
- maintain the system
- safely modify the workflow
- understand repository constraints

If YES:

Generate an appropriate wiki update.

If NO:

Reject the update.

Repository-memory updates should be rare.

File wiki updates should be common.

------------------------------------------------

CONTENT RULES

contentToAppend must be:

- concise
- future-maintenance focused
- durable
- actionable
- repository knowledge

BAD:

"Added a function."

BAD:

"Created helper method."

BAD:

"Fixed bug."

GOOD:

"Introduced runtime configuration driven wiki batching. Future reviewers should ensure batching limits remain synchronized across planner, context builder, and patch application logic."

GOOD:

"Repository review workflow now depends on wiki classification metadata. Future changes must preserve compatibility between planner schema and review pipeline."

GOOD:

"Wiki initialization now commits generated wiki files before review context retrieval. Future workflow changes should preserve initialization before wiki-dependent review stages."

GOOD:

"Repository memory entries are deduplicated using deterministic hashes generated from reason and knowledge content."

GOOD:

"orderController.js coordinates order validation and persistence. Future changes should preserve validation before persistence."

------------------------------------------------

UPDATE RULES

Generate updates whenever repository knowledge has evolved.

Knowledge evolution includes:

- architectural changes
- workflow changes
- review behavior changes
- integration changes
- security changes
- file responsibility changes
- important maintenance guidance
- repository constraints
- migration requirements
- execution-flow changes

A repository-memory update is NOT required for every wiki update.

File wiki updates are expected to occur much more frequently than repository-memory updates.

Do NOT generate updates for:

- formatting
- comments
- trivial refactors
- renames
- lint fixes
- variable renaming
- purely cosmetic implementation changes

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
      "reason": "File responsibilities evolved.",
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
    "reason": "No meaningful repository knowledge evolution detected."
  },

  "updatesRequired": false,

  "summary": "No wiki update required.",

  "updates": []
}

Changed PR chunks:

${JSON.stringify(compactChunks, null, 2)}
`;
}