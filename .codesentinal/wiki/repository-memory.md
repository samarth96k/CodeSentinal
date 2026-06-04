# Repository Memory

This file stores long-term repository knowledge used during review and wiki-update workflows.

## Architectural Decisions

### Memory ID: ARCH001

Created At: 2026-06-04T00:00:00.000Z

**Reason**

executeGitHubWithRetry is the standard GitHub reliability mechanism used throughout the repository.

**Knowledge**

executeGitHubWithRetry is the standard reliability wrapper for GitHub operations. Functions such as postComments, getPullRequestDetails, getExistingFileSha and commitWikiMarkdownChangesToPullRequestBranch should execute GitHub API requests through executeGitHubWithRetry.

---

### Memory ID: ARCH002

Created At: 2026-06-04T00:00:00.000Z

**Reason**

Repository review depends on wiki context.

**Knowledge**

getWikiContextForChunks collects architecture.md, database-schema.md, review-rules.md, repository-memory.md and file-level wiki pages before reviewChunksWithLLM executes.

---

### Memory ID: ARCH003

Created At: 2026-06-04T00:00:00.000Z

**Reason**

Repository memory is part of review intelligence.

**Knowledge**

Repository memories retrieved by getRelevantMemories are converted into WikiContextDocument objects and injected into review prompts through getWikiContextForChunks.

---

## Known Constraints

### Memory ID: CON001

Created At: 2026-06-04T00:00:00.000Z

**Reason**

GitHub review comments have platform restrictions.

**Knowledge**

postComments may only create comments on added lines. githubComment.line must reference addedLines.newLine and githubComment.side must be RIGHT.

---

### Memory ID: CON002

Created At: 2026-06-04T00:00:00.000Z

**Reason**

Prompt size affects review cost and latency.

**Knowledge**

buildReviewPrompt should receive shared repository context once. Large wiki documents should be trimmed before being sent to Gemini.

---

## Migration Notes

### Memory ID: MIG001

Created At: 2026-06-04T00:00:00.000Z

**Reason**

The repository is transitioning from wiki-only context to wiki plus repository-memory context.

**Knowledge**

Review and wiki-update workflows should prefer repository-memory retrieval when repository-specific knowledge is available.

---

## Review Findings

### Memory ID: REV001

Created At: 2026-06-04T00:00:00.000Z

**Reason**

Duplicate review findings reduce usefulness.

**Knowledge**

reviewChunksWithLLM should deduplicate findings using deduplicateReviews before comments are posted to GitHub.

---

### Memory ID: REV002

Created At: 2026-06-04T00:00:00.000Z

**Reason**

Large repositories generate many review chunks.

**Knowledge**

Review chunks are processed with chunk-level context. getWikiContextForChunks attaches file wiki context and repository memory context to every ReviewChunkWithWikiContext.

---

## Integration Knowledge

### Memory ID: INT001

Created At: 2026-06-04T00:00:00.000Z

**Reason**

Gemini requests can fail because of quota limits, network issues and malformed responses.

**Knowledge**

generateTextWithGemini and reviewChunksWithLLM should use executeWithRetry and withTimeout when communicating with Gemini models.

---

### Memory ID: INT002

Created At: 2026-06-04T00:00:00.000Z

**Reason**

Wiki updates are generated and committed automatically.

**Knowledge**

planWikiMarkdownUpdates generates WikiMarkdownUpdate objects. buildWikiMarkdownFileChanges converts them into file changes. commitWikiMarkdownChangesToPullRequestBranch commits the resulting markdown updates to the pull request branch.

---

### Memory ID: INT003

Created At: 2026-06-04T00:00:00.000Z

**Reason**

Repository memory updates require special handling.

**Knowledge**

Repository memory updates should be inserted through insertIntoRepositoryMemory and trimmed through trimRepositoryMemorySection to preserve section structure and memory limits.

---


### Memory ID: 89a40367ede2

Created At: 2026-06-04T17:36:43.535Z

**Reason**

Standardized handling for transient GitHub API failures.

**Knowledge**

All GitHub API requests should utilize `isRetryableGitHubError` to determine if a status code (429, 500, 502, 503) warrants a retry attempt.

---
