import path from "path";
import { getAllFiles, readTextFile, pathExists } from "./fileHelpers.js";

const WIKI_ROOT = ".codesentinal/wiki";

export async function loadCoreWiki(): Promise<Record<string, string>> {
  const result: Record<string, string> = {};

  if (!(await pathExists(WIKI_ROOT))) {
    return result;
  }

  const coreFiles = [
    "index.md",
    "architecture.md",
    "database-schema.md",
    "coding-rules.md",
    "review-rules.md",
  ];

  for (const file of coreFiles) {
    const fullPath = path.join(WIKI_ROOT, file);
    result[file] = await readTextFile(fullPath);
  }

  return result;
}

export async function loadFileWiki(): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  const fileWikiRoot = path.join(WIKI_ROOT, "files");

  if (!(await pathExists(fileWikiRoot))) {
    return result;
  }

  const files = await getAllFiles(fileWikiRoot);

  for (const file of files) {
    if (!file.endsWith(".md")) continue;
    result[file] = await readTextFile(file);
  }

  return result;
}

export async function loadFullWikiAsText(): Promise<string> {
  const core = await loadCoreWiki();
  const fileWiki = await loadFileWiki();

  let output = "# CodeSentinal LLM Wiki Context\n\n";

  for (const [fileName, content] of Object.entries(core)) {
    output += `\n\n<!-- ${fileName} -->\n\n${content}`;
  }

  for (const [fileName, content] of Object.entries(fileWiki)) {
    output += `\n\n<!-- ${fileName} -->\n\n${content}`;
  }

  return output;
}