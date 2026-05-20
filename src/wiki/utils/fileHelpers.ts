  import fs from "fs/promises";
import path from "path";
import { IGNORED_DIRS, SUPPORTED_EXTENSIONS, MAX_FILE_SIZE_BYTES } from "../config/wikiConfig.js";

export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function readTextFile(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch {
    return "";
  }
}

export async function writeTextFile(filePath: string, content: string): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, "utf-8");
}

export async function getFileSize(filePath: string): Promise<number> {
  const stat = await fs.stat(filePath);
  return stat.size;
}

export function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, "/");
}

export function toRelativePath(repoRoot: string, filePath: string): string {
  return normalizePath(path.relative(repoRoot, filePath));
}

export function getExtension(filePath: string): string {
  return path.extname(filePath).toLowerCase();
}

export function countLines(content: string): number {
  if (!content) return 0;
  return content.split(/\r?\n/).length;
}

export function isSupportedFile(filePath: string): boolean {
  return SUPPORTED_EXTENSIONS.has(getExtension(filePath));
}

export async function getAllFiles(dir: string): Promise<string[]> {
  const result: string[] = [];

  async function walk(currentDir: string): Promise<void> {
    if (!(await pathExists(currentDir))) return;

    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (IGNORED_DIRS.has(entry.name)) continue;
        await walk(fullPath);
        continue;
      }

      if (!entry.isFile()) continue;
      if (!isSupportedFile(fullPath)) continue;

      const size = await getFileSize(fullPath);
      if (size > MAX_FILE_SIZE_BYTES) continue;

      result.push(fullPath);
    }
  }

  await walk(dir);
  return result.sort();
}