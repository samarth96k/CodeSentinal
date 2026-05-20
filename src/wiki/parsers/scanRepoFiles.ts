import path from "path";
import {
  getAllFiles,
  getExtension,
  isSupportedSourceFile,
  readTextFile,
  toRelativePath,
} from "../utils/fileHelpers.js";
import type { RepoFile } from "../wikiTypes.js";

export async function scanRepoFiles(repoRoot: string): Promise<RepoFile[]> {
  const allFiles = await getAllFiles(repoRoot);
  const repoFiles: RepoFile[] = [];

  for (const file of allFiles) {
    if (!isSupportedSourceFile(file)) continue;

    const relativePath = toRelativePath(repoRoot, file);

    if (relativePath.startsWith(".codesentinal/")) continue;
    if (relativePath.startsWith("node_modules/")) continue;
    if (relativePath.startsWith("dist/")) continue;

    const content = await readTextFile(file);

    if (!content.trim()) continue;

    repoFiles.push({
      path: relativePath,
      content,
      extension: getExtension(file),
    });
  }

  return repoFiles.sort((a, b) => a.path.localeCompare(b.path));
}