import path from "path";
import { readTextFile, pathExists } from "../utils/fileHelpers.js";

export async function parseReadme(repoRoot: string): Promise<string> {
  const possibleNames = ["README.md", "readme.md", "Readme.md"];

  for (const name of possibleNames) {
    const readmePath = path.join(repoRoot, name);

    if (await pathExists(readmePath)) {
      return await readTextFile(readmePath);
    }
  }

  return "";
}