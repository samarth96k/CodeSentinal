import path from "path";
import {
  countLines,
  getAllFiles,
  getExtension,
  getFileSize,
  readTextFile,
  toRelativePath,
} from "../utils/fileHelpers.js";
import type {
  ExtractedSymbol,
  FileAnalysis,
  RepoFile,
  RepoFileKind,
  RepositoryAnalysis,
} from "../wikiTypes.js";

function detectFileKind(filePath: string): RepoFileKind {
  const lower = filePath.toLowerCase();

  if (lower === "package.json") return "package";
  if (lower.includes(".github/workflows")) return "workflow";
  if (lower.endsWith(".md")) return "documentation";
  if (lower.includes("test") || lower.includes("spec")) return "test";
  if (
    lower.includes("tsconfig") ||
    lower.includes("eslint") ||
    lower.includes("prettier") ||
    lower.endsWith(".yml") ||
    lower.endsWith(".yaml")
  ) {
    return "config";
  }

  if ([".ts", ".tsx", ".js", ".jsx"].includes(getExtension(filePath))) {
    return "source";
  }

  return "unknown";
}

function extractImports(content: string): string[] {
  const imports = new Set<string>();

  const importRegex = /^import\s+.+?from\s+["'](.+?)["'];?/gm;
  const sideEffectRegex = /^import\s+["'](.+?)["'];?/gm;
  const requireRegex = /require\(["'](.+?)["']\)/gm;

  for (const regex of [importRegex, sideEffectRegex, requireRegex]) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      imports.add(match[1]);
    }
  }

  return Array.from(imports).sort();
}

function extractExports(content: string): string[] {
  const exports = new Set<string>();

  const exportRegexes = [
    /^export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/gm,
    /^export\s+class\s+([A-Za-z0-9_]+)/gm,
    /^export\s+type\s+([A-Za-z0-9_]+)/gm,
    /^export\s+interface\s+([A-Za-z0-9_]+)/gm,
    /^export\s+const\s+([A-Za-z0-9_]+)/gm,
    /^export\s+\{(.+?)\}/gm,
  ];

  for (const regex of exportRegexes) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      exports.add(match[1].trim());
    }
  }

  return Array.from(exports).sort();
}

function extractSymbols(content: string): ExtractedSymbol[] {
  const symbols: ExtractedSymbol[] = [];

  const patterns: Array<{
    regex: RegExp;
    type: ExtractedSymbol["type"];
    exported: boolean;
  }> = [
    { regex: /^export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/gm, type: "function", exported: true },
    { regex: /^(?:async\s+)?function\s+([A-Za-z0-9_]+)/gm, type: "function", exported: false },
    { regex: /^export\s+class\s+([A-Za-z0-9_]+)/gm, type: "class", exported: true },
    { regex: /^class\s+([A-Za-z0-9_]+)/gm, type: "class", exported: false },
    { regex: /^export\s+type\s+([A-Za-z0-9_]+)/gm, type: "type", exported: true },
    { regex: /^type\s+([A-Za-z0-9_]+)/gm, type: "type", exported: false },
    { regex: /^export\s+interface\s+([A-Za-z0-9_]+)/gm, type: "interface", exported: true },
    { regex: /^interface\s+([A-Za-z0-9_]+)/gm, type: "interface", exported: false },
    { regex: /^export\s+const\s+([A-Za-z0-9_]+)/gm, type: "const", exported: true },
    { regex: /^const\s+([A-Za-z0-9_]+)\s*=/gm, type: "const", exported: false },
  ];

  const seen = new Set<string>();

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.regex.exec(content)) !== null) {
      const key = `${pattern.type}:${match[1]}`;
      if (seen.has(key)) continue;
      seen.add(key);

      symbols.push({
        name: match[1],
        type: pattern.type,
        exported: pattern.exported,
      });
    }
  }

  return symbols.sort((a, b) => a.name.localeCompare(b.name));
}

function resolveLocalDependencies(filePath: string, imports: string[]): string[] {
  return imports
    .filter((item) => item.startsWith("."))
    .map((item) => path.posix.normalize(path.posix.join(path.posix.dirname(filePath), item)))
    .sort();
}

function inferPurpose(file: RepoFile, symbols: ExtractedSymbol[]): string {
  const lower = file.path.toLowerCase();

  if (lower.includes("wiki")) return "Part of the LLM Wiki system used to generate, read, or maintain repository knowledge.";
  if (lower.includes("diff")) return "Handles pull request diff parsing or changed-code chunk generation.";
  if (lower.includes("llm")) return "Handles communication with the language model or prompt construction.";
  if (lower.includes("github") || lower.includes("octokit")) return "Handles GitHub API integration.";
  if (lower.includes("review")) return "Handles code review logic or review comment generation.";
  if (lower.includes("workflow") || lower.includes(".github/workflows")) return "Defines GitHub Actions automation.";
  if (file.kind === "package") return "Defines Node.js project metadata, scripts, and dependencies.";
  if (file.kind === "config") return "Defines project configuration.";
  if (file.kind === "documentation") return "Provides repository documentation.";

  if (symbols.length > 0) {
    return `Source file defining ${symbols.slice(0, 5).map((s) => `\`${s.name}\``).join(", ")}.`;
  }

  return "Repository source/configuration file.";
}

function detectRisks(file: RepoFile, content: string): string[] {
  const risks: string[] = [];
  const lower = file.path.toLowerCase();

  if (content.includes("process.env")) risks.push("Uses environment variables; verify missing secret handling.");
  if (content.includes("GITHUB_TOKEN")) risks.push("Uses GitHub token; verify permissions and fork PR safety.");
  if (content.includes("pull_request_target")) risks.push("Uses pull_request_target; verify untrusted code is not executed.");
  if (content.includes("any")) risks.push("Contains `any`; verify type safety.");
  if (content.includes("JSON.parse")) risks.push("Parses JSON; verify invalid JSON is handled safely.");
  if (content.includes("eval(")) risks.push("Uses eval; this is a critical security risk.");
  if (lower.includes("workflow")) risks.push("Workflow file; verify minimal permissions and safe trigger usage.");

  return risks;
}

function detectTechStack(packageJson: Record<string, unknown>, files: RepoFile[]): string[] {
  const stack = new Set<string>();

  const deps = {
    ...((packageJson.dependencies as Record<string, string>) || {}),
    ...((packageJson.devDependencies as Record<string, string>) || {}),
  };

  if (deps.typescript) stack.add("TypeScript");
  if (deps.octokit || deps["@octokit/rest"]) stack.add("GitHub Octokit");
  if (deps.zod) stack.add("Zod");
  if (deps.dotenv) stack.add("dotenv");
  if (deps["@google/generative-ai"]) stack.add("Gemini API");
  if (deps.openai) stack.add("OpenAI API");

  if (files.some((f) => f.path.includes(".github/workflows"))) stack.add("GitHub Actions");
  if (files.some((f) => f.extension === ".ts")) stack.add("Node.js TypeScript");

  return Array.from(stack).sort();
}

async function parsePackageJson(repoRoot: string): Promise<Record<string, unknown>> {
  const packagePath = path.join(repoRoot, "package.json");

  try {
    return JSON.parse(await readTextFile(packagePath));
  } catch {
    return {};
  }
}

async function readReadme(repoRoot: string): Promise<string> {
  for (const name of ["README.md", "readme.md", "Readme.md"]) {
    const content = await readTextFile(path.join(repoRoot, name));
    if (content.trim()) return content;
  }

  return "";
}

export async function analyzeRepository(repoRoot: string): Promise<RepositoryAnalysis> {
  const absoluteFiles = await getAllFiles(repoRoot);
  const packageJson = await parsePackageJson(repoRoot);
  const readme = await readReadme(repoRoot);

  const files: RepoFile[] = [];

  for (const absolutePath of absoluteFiles) {
    const content = await readTextFile(absolutePath);
    if (!content.trim()) continue;

    const relativePath = toRelativePath(repoRoot, absolutePath);

    files.push({
      path: relativePath,
      absolutePath,
      content,
      extension: getExtension(absolutePath),
      sizeInBytes: await getFileSize(absolutePath),
      lineCount: countLines(content),
      kind: detectFileKind(relativePath),
    });
  }

  // const fileAnalyses: FileAnalysis[] = files.map((file) => {
  //   const imports = extractImports(file.content);
  //   const exports = extractExports(file.content);
  //   const symbols = extractSymbols(file.content);

  //   return {
  //     file,
  //     imports,
  //     exports,
  //     symbols,
  //     dependsOn: resolveLocalDependencies(file.path, imports),
  //     purpose: inferPurpose(file, symbols),
  //     risks: detectRisks(file, file.content),
  //   };
  // });
  const fileAnalyses: FileAnalysis[] = files.map((file) => {
    const imports = extractImports(file.content);

    const exports = extractExports(file.content);

    const symbols = extractSymbols(file.content);

    const risks = detectRisks(
      file,
      file.content
    );

    return {
      file,

      imports,

      exports,

      symbols,

      dependsOn: resolveLocalDependencies(
        file.path,
        imports
      ),

      purpose: inferPurpose(
        file,
        symbols
      ),

      risks,

      inferredResponsibilities:
        inferResponsibilities(
          file,
          symbols
        ),

      architecturalRole:
        inferArchitecturalRole(
          file
        ),

      reviewFocusAreas:
        inferReviewFocusAreas(
          file,
          risks
        ),
    };
  });
  return {
    repoRoot,
    readme,
    packageJson,
    files,
    fileAnalyses,
    detectedTechStack: detectTechStack(packageJson, files),
    entrypoints: files
      .filter((f) => /(^|\/)(index|main|app|server)\.(ts|js|tsx|jsx)$/.test(f.path))
      .map((f) => f.path),
    workflowFiles: files.filter((f) => f.kind === "workflow").map((f) => f.path),
    configFiles: files.filter((f) => f.kind === "config").map((f) => f.path),
    testFiles: files.filter((f) => f.kind === "test").map((f) => f.path),
  };
}

function inferResponsibilities(
  file: RepoFile,
  symbols: ExtractedSymbol[]
): string[] {
  const responsibilities = new Set<string>();

  const lower = file.path.toLowerCase();

  if (lower.includes("wiki")) {
    responsibilities.add("Repository memory generation");
    responsibilities.add("Wiki lifecycle management");
  }

  if (lower.includes("github")) {
    responsibilities.add("GitHub API communication");
    responsibilities.add("Pull request operations");
  }

  if (lower.includes("llm")) {
    responsibilities.add("LLM communication");
    responsibilities.add("Prompt orchestration");
  }

  if (lower.includes("review")) {
    responsibilities.add("Pull request review generation");
  }

  if (lower.includes("diff")) {
    responsibilities.add("Patch parsing");
    responsibilities.add("Code change extraction");
  }

  if (symbols.some((s) => s.type === "type")) {
    responsibilities.add("Type contract definition");
  }

  if (symbols.some((s) => s.type === "interface")) {
    responsibilities.add("Interface definition");
  }

  if (responsibilities.size === 0) {
    responsibilities.add("Repository functionality");
  }

  return Array.from(responsibilities);
}

function inferArchitecturalRole(
  file: RepoFile
): string {
  const lower = file.path.toLowerCase();

  if (
    lower.includes("index") ||
    lower.includes("main")
  ) {
    return "Application Entrypoint";
  }

  if (lower.includes("github")) {
    return "Infrastructure Adapter";
  }

  if (lower.includes("llm")) {
    return "AI Integration Layer";
  }

  if (lower.includes("wiki")) {
    return "Repository Knowledge Layer";
  }

  if (lower.includes("diff")) {
    return "Change Processing Layer";
  }

  if (lower.includes("review")) {
    return "Review Engine";
  }

  return "Application Component";
}

function inferReviewFocusAreas(
  file: RepoFile,
  risks: string[]
): string[] {
  const focus = new Set<string>();

  const lower = file.path.toLowerCase();

  if (lower.includes("github")) {
    focus.add("GitHub API correctness");
    focus.add("Permission safety");
  }

  if (lower.includes("llm")) {
    focus.add("Prompt correctness");
    focus.add("Response validation");
  }

  if (lower.includes("wiki")) {
    focus.add("Knowledge consistency");
    focus.add("Context quality");
  }

  if (lower.includes("workflow")) {
    focus.add("CI/CD security");
  }

  if (risks.length > 0) {
    focus.add("Risk mitigation");
  }

  if (focus.size === 0) {
    focus.add("Business logic correctness");
  }

  return Array.from(focus);
}