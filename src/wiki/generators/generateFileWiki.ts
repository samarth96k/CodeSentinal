import { MAX_SOURCE_PREVIEW_CHARS } from "../config/wikiConfig.js";
import { sourcePathToWikiPath } from "../utils/wikiWriter.js";
import type { FileAnalysis, FileWikiPage } from "../wikiTypes.js";

function list(items: string[], empty = "None detected."): string {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : `- ${empty}`;
}

export function generateFileWiki(analysis: FileAnalysis): FileWikiPage {
  const { file } = analysis;

  const symbolLines = analysis.symbols.map(
    (s) => `- \`${s.name}\` — ${s.exported ? "exported" : "internal"} ${s.type}`
  );

  const riskLines = analysis.risks.map((risk) => `- ${risk}`);

  const content = `# ${file.path}

## Purpose

${analysis.purpose}

## File Metadata

- Source path: \`${file.path}\`
- File kind: \`${file.kind}\`
- Extension: \`${file.extension}\`
- Lines: ${file.lineCount}
- Size: ${file.sizeInBytes} bytes

## Imports

${list(analysis.imports.map((i) => `\`${i}\``))}

## Exports

${list(analysis.exports.map((e) => `\`${e}\``))}

## Symbols

${list(symbolLines)}

## Local Dependencies

${list(analysis.dependsOn.map((d) => `\`${d}\``))}

## Risk Notes

${list(riskLines, "No obvious risk patterns detected.")}

## Review Guidance

When a pull request changes this file, CodeSentinal should check:

- Whether the change preserves this file's responsibility.
- Whether exported symbols remain compatible.
- Whether imports introduce unnecessary coupling.
- Whether error handling remains safe.
- Whether environment variables, GitHub tokens, or workflow permissions are handled safely.
- Whether this change requires updating architecture, data contracts, coding rules, or review rules.

## Source Preview

\`\`\`
${file.content.slice(0, MAX_SOURCE_PREVIEW_CHARS)}
\`\`\`
`;

  return {
    type: "file",
    sourceFilePath: file.path,
    wikiFilePath: sourcePathToWikiPath(file.path),
    title: file.path,
    summary: analysis.purpose,
    content,
  };
}