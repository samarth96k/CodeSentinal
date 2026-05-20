import { loadCoreWiki, loadFileWiki, loadFullWikiAsText } from "./utils/wikiLoader.js";

export async function readWikiForReview(): Promise<string> {
  return await loadFullWikiAsText();
}

export async function readCoreWikiOnly(): Promise<Record<string, string>> {
  return await loadCoreWiki();
}

export async function readFileWikiOnly(): Promise<Record<string, string>> {
  return await loadFileWiki();
}