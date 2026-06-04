import dotenv from "dotenv";
import { Octokit } from "octokit";
import * as github from "@actions/github";
import type { WikiMarkdownFileChange } from "./wiki/wikiReviewTypes.js";
import {
  executeGitHubWithRetry,
} from "./githubRetry.js";
dotenv.config();
import { debugJson } from "./wiki/utils/debugLogger.js";
export const owner = github.context.repo.owner;
export const repo = github.context.repo.repo;

let octokitClient: Octokit | null = null;

function assertValidPullNumber(pullNumber: number): void {
  if (!Number.isInteger(pullNumber) || pullNumber <= 0) {
    throw new Error(`Invalid pull request number: ${pullNumber}`);
  }
}

function getOctokitClient(): Octokit {
  if (octokitClient) return octokitClient;

  const token = process.env.GITHUB_TOKEN || process.env.TOKEN_GITHUB;

  if (!token) {
    throw new Error(
      "GITHUB_TOKEN is missing. Pass github_token input or set GITHUB_TOKEN env."
    );
  }

  octokitClient = new Octokit({ auth: token });
  return octokitClient;
}

export async function getPullRequests() {
  const prs = await getOctokitClient().request("GET /repos/{owner}/{repo}/pulls", {
    owner,
    repo,
    per_page: 5,
    headers: { "X-GitHub-Api-Version": "2022-11-28" },
  });

  return prs.data;
}

export async function getPullRequestFiles(pullNumber: number) {
  assertValidPullNumber(pullNumber);

  const response = await getOctokitClient().request(
    "GET /repos/{owner}/{repo}/pulls/{pull_number}/files",
    {
      owner,
      repo,
      pull_number: pullNumber,
      headers: { "X-GitHub-Api-Version": "2022-11-28" },
    }
  );

  return response.data.map((file) => ({
    filename: file.filename,
    status: file.status,
    additions: file.additions,
    deletions: file.deletions,
    changes: file.changes,
    patch: file.patch,
  }));
}

export async function getSHA(pullNumber: number) {
  assertValidPullNumber(pullNumber);

  const response = await getOctokitClient().request(
    "GET /repos/{owner}/{repo}/pulls/{pull_number}",
    {
      owner,
      repo,
      pull_number: pullNumber,
      headers: { "X-GitHub-Api-Version": "2022-11-28" },
    }
  );

  return response.data.head.sha;
}

export async function postComments(
  result: any,
  commit_id: string,
  pullNumber: number
) {
  assertValidPullNumber(pullNumber);

  const responses = [];

  for (const review of result.reviews) {
    try {
      const res =
        await executeGitHubWithRetry(
          () =>
            getOctokitClient().request(
              "POST /repos/{owner}/{repo}/pulls/{pull_number}/comments",
              {
                owner,
                repo,
                pull_number: pullNumber,
                commit_id,
                ...review.githubComment,
                headers: {
                  "X-GitHub-Api-Version":
                    "2022-11-28",
                },
              }
            )
        );
        debugJson(
  "GITHUB_COMMENT",
  review.githubComment
);
      responses.push({
        success: true,
        path: review.githubComment.path,
        line: review.githubComment.line,
        response: res.data,
      });
    } catch (error: any) {
      responses.push({
        success: false,
        path: review.githubComment.path,
        line: review.githubComment.line,
        error: {
          message: error.message,
          status: error.status,
          response: error.response?.data,
        },
      });
    }
  }

  return responses;
}

async function getPullRequestDetails(pullNumber: number) {
  assertValidPullNumber(pullNumber);

  const response = await getOctokitClient().request(
    "GET /repos/{owner}/{repo}/pulls/{pull_number}",
    {
      owner,
      repo,
      pull_number: pullNumber,
      headers: { "X-GitHub-Api-Version": "2022-11-28" },
    }
  );

  return response.data;
}

function assertSafeWikiMarkdownChange(file: WikiMarkdownFileChange): boolean {
  return (
    file.path.startsWith(".codesentinal/wiki/") &&
    file.path.endsWith(".md") &&
    !file.path.includes("..")
  );
}

async function getExistingFileSha(params: {
  owner: string;
  repo: string;
  path: string;
  ref: string;
}): Promise<string | undefined> {
  try {
    const response =
      await executeGitHubWithRetry(
        () =>
          getOctokitClient().request(
            "GET /repos/{owner}/{repo}/contents/{path}",
            {
              owner: params.owner,
              repo: params.repo,
              path: params.path,
              ref: params.ref,
              headers: {
                "X-GitHub-Api-Version":
                  "2022-11-28",
              },
            }
          )
      );

    if (Array.isArray(response.data)) return undefined;
    return "sha" in response.data ? response.data.sha : undefined;
  } catch (error: any) {
    if (error.status === 404) return undefined;
    throw error;
  }
}

export async function commitWikiMarkdownChangesToPullRequestBranch(params: {
  pullNumber: number;
  changes: WikiMarkdownFileChange[];
  commitMessage?: string;
}) {
  const {
    pullNumber,
    changes,
    commitMessage = "docs: update CodeSentinal LLM wiki",
  } = params;

  assertValidPullNumber(pullNumber);

  const safeChanges =
    changes.filter(
      assertSafeWikiMarkdownChange
    );

  console.log(
    `[CodeSentinal Wiki Commit] Received ${changes.length} change(s)`
  );

  console.log(
    `[CodeSentinal Wiki Commit] Safe changes: ${safeChanges.length}`
  );

  if (safeChanges.length === 0) {
    console.log(
      "[CodeSentinal Wiki Commit] Nothing to commit."
    );

    return {
      committed: false,
      reason:
        "No safe wiki markdown changes.",
    };
  }

  const pr =
    await getPullRequestDetails(
      pullNumber
    );

  const isSameRepoPR =
    pr.head.repo?.full_name ===
    pr.base.repo?.full_name;

  if (!isSameRepoPR) {
    console.log(
      "[CodeSentinal Wiki Commit] Fork PR detected. Skipping commit."
    );

    return {
      committed: false,
      reason:
        "Fork PR detected. Direct commits are disabled for safety.",
    };
  }

  const branch =
    pr.head.ref;

  console.log(
    `[CodeSentinal Wiki Commit] Target branch: ${branch}`
  );

  const results = [];

  for (const change of safeChanges) {
    try {
      console.log(
        `[CodeSentinal Wiki Commit] Processing ${change.path}`
      );

      console.log(
        `[CodeSentinal Wiki Commit] Content length: ${change.content.length}`
      );

      const sha =
        await getExistingFileSha({
          owner,
          repo,
          path: change.path,
          ref: branch,
        });

      console.log(
        `[CodeSentinal Wiki Commit] Existing SHA: ${sha ?? "NEW_FILE"}`
      );

      const response =
        await executeGitHubWithRetry(
          () =>
            getOctokitClient().request(
              "PUT /repos/{owner}/{repo}/contents/{path}",
              {
                owner,
                repo,
                path: change.path,
                message:
                  commitMessage,
                content:
                  Buffer.from(
                    change.content,
                    "utf-8"
                  ).toString(
                    "base64"
                  ),
                branch,
                sha,
                headers: {
                  "X-GitHub-Api-Version":
                    "2022-11-28",
                },
              }
            )
        );

      console.log(
        `[CodeSentinal Wiki Commit] SUCCESS ${change.path}`
      );

      console.log(
        `[CodeSentinal Wiki Commit] Commit SHA: ${response.data.commit.sha}`
      );

      results.push({
        path: change.path,
        success: true,
        commitSha:
          response.data.commit.sha,
      });
    } catch (error: any) {
      console.log(
        `[CodeSentinal Wiki Commit] FAILED ${change.path}`
      );

      console.log(error);

      results.push({
        path: change.path,
        success: false,
        error: {
          message:
            error.message,
          status:
            error.status,
          response:
            error.response?.data,
        },
      });
    }
  }

  debugJson(
    "WIKI_COMMIT_RESULTS",
    results
  );

  return {
    committed:
      results.some(
        (result) =>
          result.success
      ),
    branch,
    results,
  };
}