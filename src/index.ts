import dotenv from "dotenv";
import * as github from "@actions/github";
import * as core from "@actions/core";
import { ensureWikiAvailable } from "./wiki/ensureWikiAvailable.js";
import {
  getPullRequestFiles,
  getSHA,
  postComments,
  commitWikiMarkdownChangesToPullRequestBranch,
} from "./github.js";
import type { ReviewChunkWithWikiContext } from "./wiki/wikiReviewTypes.js";
import { debugJson } from "./wiki/utils/debugLogger.js";

import { parsePatchLibrary } from "./diffParser.js";
import { chunkingParsed, type ReviewChunk } from "./chunk.js";
import { reviewChunksWithLLM } from "./llm.js";
import { preprocessParsedFiles } from "./prePrcessParsedFile.js";

import { getWikiContextForChunks } from "./wiki/getWikiContextForChunks.js";
import { getWikiUpdateContextForChunks } from "./wiki/getWikiUpdateContextForChunks.js";
import { planWikiMarkdownUpdates } from "./wiki/wikiUpdatePlanner.js";
import { buildWikiMarkdownFileChanges } from "./wiki/wikiPatchApplier.js";

dotenv.config();

type RunMode = "review" | "wiki-update" | "all";

function configureRuntimeFromActionInputs(): void {
  const geminiInput = core.getInput("gemini_api_key");
  if (geminiInput && !process.env.GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY = geminiInput;
  }

  const githubTokenInput = core.getInput("github_token");
  if (githubTokenInput && !process.env.GITHUB_TOKEN) {
    process.env.GITHUB_TOKEN = githubTokenInput;
  }

  const maxWikiFilesInput = core.getInput("max_wiki_files");
  if (maxWikiFilesInput && !process.env.CODE_SENTINAL_MAX_WIKI_FILES) {
    process.env.CODE_SENTINAL_MAX_WIKI_FILES = maxWikiFilesInput;
  }

  const repoRootInput = core.getInput("repo_root") || ".";
  process.chdir(repoRootInput);

  console.log("[CodeSentinal] Working directory:", process.cwd());
}

function getRunMode(): RunMode {
  const cliMode = process.argv[2];

  if (cliMode === "review" || cliMode === "wiki-update" || cliMode === "all") {
    return cliMode;
  }

  const actionMode = core.getInput("mode") || "review";

  if (
    actionMode === "review" ||
    actionMode === "wiki-update" ||
    actionMode === "all"
  ) {
    return actionMode;
  }

  throw new Error(`Invalid mode: ${actionMode}`);
}

async function getPullRequestFromContextOrInput() {
  const context = github.context;

  let pullRequest = context.payload.pull_request;

  if (pullRequest) {
    return pullRequest;
  }

  const manualPrNumber =
    core.getInput("pr_number") ||
    context.payload.inputs?.pr_number;

  if (!manualPrNumber) {
    throw new Error(
      "No pull request found. If using workflow_dispatch, provide pr_number input."
    );
  }

  const pullNumber = Number(manualPrNumber);

  if (Number.isNaN(pullNumber)) {
    throw new Error(`Invalid pr_number: ${manualPrNumber}`);
  }

  const token = process.env.GITHUB_TOKEN || core.getInput("github_token");

  if (!token) {
    throw new Error("Missing github_token.");
  }

  const octokit = github.getOctokit(token);
  const { owner, repo } = context.repo;

  console.log(`[CodeSentinal] Fetching PR #${pullNumber} manually...`);

  const response = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: pullNumber,
  });

  return response.data;
}

configureRuntimeFromActionInputs();

const mode = getRunMode();
// const context = github.context;
const pullRequest = await getPullRequestFromContextOrInput();
const pullNumber = pullRequest.number;

function isForkPullRequest(pr: typeof pullRequest): boolean {
  return pr.head.repo.full_name !== pr.base.repo.full_name;
}

function shouldUseWikiContext(pr: typeof pullRequest): boolean {
  if (isForkPullRequest(pr)) {
    console.log(
      "[CodeSentinal] Fork PR detected. Skipping LLM Wiki context for safe review."
    );
    return false;
  }

  return true;
}

async function buildReviewChunks(): Promise<ReviewChunk[]> {
  const files = await getPullRequestFiles(pullNumber);
  const allChunks: ReviewChunk[] = [];

  for (const file of files) {
    if (!file.patch) {
      console.log("SKIPPED: No patch found for", file.filename);
      continue;
    }

    const parsed = parsePatchLibrary(file.patch);
    const processedParsed = preprocessParsedFiles(parsed, file.filename);

    if (processedParsed.length === 0) {
      console.log("SKIPPED:", file.filename);
      continue;
    }

    const chunks = chunkingParsed(processedParsed, file.filename);
      debugJson(
  "REVIEW_CHUNKS",
  chunks
);
    allChunks.push(...chunks);
  }

  return allChunks;
}

async function runReviewMode(chunks: ReviewChunk[]) {
  console.log("[CodeSentinal] Running review mode...");

  const commitId = await getSHA(pullNumber);

  let chunksWithWikiContext: ReviewChunkWithWikiContext[];

  if (shouldUseWikiContext(pullRequest)) {
    await ensureWikiAvailable();

    chunksWithWikiContext =
      await getWikiContextForChunks(chunks);
  } else {
    chunksWithWikiContext = chunks.map((chunk) => ({
      ...chunk,
      wikiContext: "",
      wikiDocuments: [],
    }));
  }

  const result =
    await reviewChunksWithLLM(
      chunksWithWikiContext
    );

  if (result.reviews.length === 0) {
    console.log("No issues found by AI.");
    return;
  }

  const postResult = await postComments(
    result,
    commitId,
    pullNumber
  );

  console.log(
    JSON.stringify(postResult, null, 2)
  );
}

async function runWikiUpdateMode(chunks: ReviewChunk[]) {
  console.log("[CodeSentinal Wiki] Running wiki-update mode...");

  if (isForkPullRequest(pullRequest)) {
    console.log(
      "[CodeSentinal Wiki] Fork PR detected. Skipping wiki update for safety."
    );
    return;
  }

  await ensureWikiAvailable();

  const chunksWithWikiContext =await getWikiUpdateContextForChunks(chunks);

  const wikiUpdatePlan = await planWikiMarkdownUpdates(chunksWithWikiContext);
  debugJson(
  "WIKI_UPDATE_PLAN",
  wikiUpdatePlan
);
  if (!wikiUpdatePlan.updatesRequired) {
    console.log("[CodeSentinal Wiki] No wiki markdown update required.");
    return;
  }

  console.log("[CodeSentinal Wiki] Wiki update plan:");
  console.log(JSON.stringify(wikiUpdatePlan, null, 2));

  const wikiFileChanges = await buildWikiMarkdownFileChanges(wikiUpdatePlan);
  debugJson(
  "WIKI_FILE_CHANGES",
  wikiFileChanges
);
  if (wikiFileChanges.length === 0) {
    console.log("[CodeSentinal Wiki] No wiki file changes after patch building.");
    return;
  }

  const wikiCommitResult = await commitWikiMarkdownChangesToPullRequestBranch({
    pullNumber,
    changes: wikiFileChanges,
  });
  debugJson(
  "WIKI_COMMIT_RESULT",
  wikiCommitResult
);
  console.log("[CodeSentinal Wiki] Commit result:");
  console.log(JSON.stringify(wikiCommitResult, null, 2));
}

const chunks = await buildReviewChunks();

if (chunks.length === 0) {
  console.log("No reviewable chunks found.");
  process.exit(0);
}

if (mode === "review") {
  await runReviewMode(chunks);
} else if (mode === "wiki-update") {
  await runWikiUpdateMode(chunks);
}else if (mode === "all") {
  try {
    await runReviewMode(chunks);

    await runWikiUpdateMode(chunks);
  } catch (error) {
    console.error(
      "[CodeSentinal] Pipeline failed:"
    );

    console.error(error);
  }
} else {
  throw new Error(`Invalid mode: ${mode}`);
}