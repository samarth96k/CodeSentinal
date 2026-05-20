import dotenv from "dotenv";
import { Octokit } from "octokit";
import * as github from "@actions/github";
import type { WikiMarkdownFileChange } from "./wiki/wikiReviewTypes.js";

dotenv.config();

export const owner = github.context.repo.owner;
export const repo = github.context.repo.repo;

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN || process.env.TOKEN_GITHUB,
});

export async function getPullRequests() {
  const prs = await octokit.request("GET /repos/{owner}/{repo}/pulls", {
    owner,
    repo,
    per_page: 5,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  return prs.data;
}

export async function getPullRequestFiles(pullNumber: number) {
  const response = await octokit.request(
    "GET /repos/{owner}/{repo}/pulls/{pull_number}/files",
    {
      owner,
      repo,
      pull_number: pullNumber,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
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
  const response = await octokit.request(
    "GET /repos/{owner}/{repo}/pulls/{pull_number}",
    {
      owner,
      repo,
      pull_number: pullNumber,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  return response.data.head.sha;
}

export async function postComments(
  result: any,
  commit_id: string,
  pullNumber: number
) {
  const responses = [];

  for (const review of result.reviews) {
    try {
      console.log("\n====================================");
      console.log("POSTING COMMENT:");
      console.log(review.githubComment);

      const res = await octokit.request(
        "POST /repos/{owner}/{repo}/pulls/{pull_number}/comments",
        {
          owner,
          repo,
          pull_number: pullNumber,
          commit_id,
          ...review.githubComment,
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );

      console.log("SUCCESS");
      console.log("COMMENT ID:", res.data.id);

      responses.push({
        success: true,
        path: review.githubComment.path,
        line: review.githubComment.line,
        response: res.data,
      });
    } catch (error: any) {
      console.log("FAILED");
      console.log(error);

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
  const response = await octokit.request(
    "GET /repos/{owner}/{repo}/pulls/{pull_number}",
    {
      owner,
      repo,
      pull_number: pullNumber,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
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
    const response = await octokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}",
      {
        owner: params.owner,
        repo: params.repo,
        path: params.path,
        ref: params.ref,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
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

  const safeChanges = changes.filter(assertSafeWikiMarkdownChange);

  if (safeChanges.length === 0) {
    console.log("[CodeSentinal Wiki] No safe wiki markdown changes to commit.");
    return {
      committed: false,
      reason: "No safe wiki markdown changes.",
    };
  }

  const pr = await getPullRequestDetails(pullNumber);

  const isSameRepoPR = pr.head.repo?.full_name === pr.base.repo?.full_name;

  if (!isSameRepoPR) {
    console.log(
      "[CodeSentinal Wiki] Fork PR detected. Direct wiki commit skipped."
    );

    return {
      committed: false,
      reason: "Fork PR detected. Direct commits are disabled for safety.",
    };
  }

  const branch = pr.head.ref;

  const results = [];

  for (const change of safeChanges) {
    try {
      const sha = await getExistingFileSha({
        owner,
        repo,
        path: change.path,
        ref: branch,
      });

      const response = await octokit.request(
        "PUT /repos/{owner}/{repo}/contents/{path}",
        {
          owner,
          repo,
          path: change.path,
          message: commitMessage,
          content: Buffer.from(change.content, "utf-8").toString("base64"),
          branch,
          sha,
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );

      results.push({
        path: change.path,
        success: true,
        commitSha: response.data.commit.sha,
      });
    } catch (error: any) {
      results.push({
        path: change.path,
        success: false,
        error: {
          message: error.message,
          status: error.status,
          response: error.response?.data,
        },
      });
    }
  }

  return {
    committed: results.some((result) => result.success),
    branch,
    results,
  };
}