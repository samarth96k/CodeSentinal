import path from "path";
import { readTextFile, pathExists } from "../utils/fileHelpers.js";

export async function parsePackageJson(repoRoot: string): Promise<Record<string, unknown>> {
  const packagePath = path.join(repoRoot, "package.json");

  if (!(await pathExists(packagePath))) {
    return {};
  }

  try {
    const raw = await readTextFile(packagePath);
    return JSON.parse(raw);
  } catch {
    return {};
  }
}