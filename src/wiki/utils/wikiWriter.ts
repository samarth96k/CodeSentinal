import path from "path";
import { FILE_WIKI_ROOT, WIKI_ROOT } from "../config/wikiConfig.js";
import { ensureDir, writeTextFile } from "./fileHelpers.js";

export function sourcePathToWikiFileName(sourcePath: string): string {
  return sourcePath
    .replace(/\\/g, "/")
    .replace(/\//g, "_")
    .replace(/\./g, "_")
    .replace(/[^A-Za-z0-9_-]/g, "_") + ".md";
}

export function sourcePathToWikiPath(sourcePath: string): string {
  return path.join(FILE_WIKI_ROOT, sourcePathToWikiFileName(sourcePath));
}

export async function prepareWikiFolders(): Promise<void> {
  await ensureDir(WIKI_ROOT);
  await ensureDir(FILE_WIKI_ROOT);
}

export async function writeCoreWikiFile(fileName: string, content: string): Promise<string> {
  const filePath = path.join(WIKI_ROOT, fileName);
  await writeTextFile(filePath, content.trim() + "\n");
  return filePath;
}

export async function writeFileWiki(sourcePath: string, content: string): Promise<string> {
  const filePath = sourcePathToWikiPath(sourcePath);
  await writeTextFile(filePath, content.trim() + "\n");
  return filePath;
}