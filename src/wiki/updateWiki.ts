import process from "process";
import { initWiki } from "./initWiki.js";
import type { WikiWriteResult } from "./wikiTypes.js";

export async function updateWiki(
  repoRoot = process.cwd()
): Promise<WikiWriteResult> {
  console.log("[CodeSentinal Wiki] Updating wiki using full regeneration pipeline...");

  const result = await initWiki(repoRoot);

  console.log("[CodeSentinal Wiki] Wiki update completed.");

  return result;
}