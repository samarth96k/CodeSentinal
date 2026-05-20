import { pathExists } from "./utils/fileHelpers.js";
import { initWiki } from "./initWiki.js";

const WIKI_INDEX_PATH = ".codesentinal/wiki/index.md";

export async function ensureWikiAvailable(): Promise<void> {
  const exists = await pathExists(WIKI_INDEX_PATH);

  if (exists) {
    console.log("[CodeSentinal Wiki] Existing wiki found.");
    return;
  }

  console.log("[CodeSentinal Wiki] Wiki missing. Generating runtime wiki...");
  await initWiki();
  console.log("[CodeSentinal Wiki] Runtime wiki generated.");
}