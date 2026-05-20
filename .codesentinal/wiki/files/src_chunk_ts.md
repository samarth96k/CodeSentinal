# `src/chunk.ts`

This file defines types and functions related to parsing and chunking code review data, specifically focusing on creating `ReviewChunk` objects from a parsed input.

## Purpose

The primary purpose of this file is to transform a structured representation of code changes (likely from a diff or patch) into more manageable "chunks" suitable for review. Each `ReviewChunk` encapsulates a contiguous block of changes within a file, including context lines, added and removed lines, and metadata such as the programming language and hunk header.

## Types

### `AddedLine`

Represents a line that was added to the code.

- `newLine`: The line number of the added line in the new file version.
- `content`: The actual content of the added line.

### `RemovedLine`

Represents a line that was removed from the code.

- `oldLine`: The line number of the removed line in the old file version.
- `content`: The actual content of the removed line.

### `ReviewChunk`

Represents a cohesive block of code changes within a file, including surrounding context.

- `filename`: The name of the file the chunk belongs to.
- `startLine`: The starting line number of the chunk in the new file version.
- `endLine`: The ending line number of the chunk in the new file version.
- `codeWithContext`: A string representation of the chunk, including added/removed lines and context.
- `addedLines`: An array of `AddedLine` objects within this chunk.
- `removedLines`: An array of `RemovedLine` objects within this chunk.
- `metadata`: An object containing metadata about the chunk.
    - `language`: The detected programming language of the file.
    - `hunkHeader`: The original hunk header from the diff, formatted for reference.

## Functions

### `chunkingParsed(parsed: any, filename: string): ReviewChunk[]`

This is the main exported function. It takes a `parsed` data structure (expected to contain file and hunk information) and a `filename`, and returns an array of `ReviewChunk` objects.

It iterates through the hunks and changes within each file, identifying blocks of added lines and then extracting surrounding context lines (defined by `contextSize`, defaulting to 3). For each identified chunk, it populates the `ReviewChunk` object with relevant data.

**Key logic:**
- Iterates through `parsed` files and their `hunks`.
- Identifies contiguous blocks of "added" changes.
- For each block of added changes, it defines a chunk by including `contextSize` lines before and after the added lines.
- Filters and maps `chunkChanges` to populate `addedLines` and `removedLines` arrays.
- Constructs the `codeWithContext` string, formatting removed lines with ` - ` and added lines with `+`.
- Determines `startLine` and `endLine` based on the `newLine` numbers of the changes within the chunk.
- Calls `getLanguageFromFilename` to set the language metadata.
- Generates a formatted `hunkHeader` from hunk metadata.

### `getLanguageFromFilename(filename: string): string`

An internal helper function that attempts to determine the programming language of a file based on its extension. It supports a predefined set of common extensions.

## Risks

- **Type Safety (`any`)**: The `chunkingParsed` function uses `any` for the `parsed` input parameter and within its internal loops (`file: any`, `hunk: any`, `change: any`). This signifies a potential lack of type safety. Future code reviews should scrutinize the structure of the `parsed` input to ensure it matches the expected format and to consider introducing more specific types if possible.
- **Assumptions about `parsed` structure**: The function makes strong assumptions about the structure of the `parsed` object (e.g., existence of `file.hunks`, `hunk.changes`, `change.type`, `change.newLine`, `change.oldLine`, `hunk.oldStart`, `hunk.oldLines`, `hunk.newStart`, `hunk.newLines`). Any deviation from this expected structure could lead to runtime errors or incorrect chunk generation.

## How to Review PR Changes

When reviewing changes to this file, consider the following:

1.  **Type Safety Improvements**: Look for opportunities to replace `any` with more specific types, especially for the `parsed` input and internal change objects. This will improve maintainability and catch errors earlier.
2.  **`contextSize` Handling**: Any changes to how `contextSize` is applied or its value should be carefully examined to ensure consistent and useful context is provided in `ReviewChunk`s.
3.  **`getLanguageFromFilename` Logic**: Adding support for new languages should be straightforward, but ensure the new extensions are correctly mapped and don't introduce regressions for existing languages.
4.  **`codeWithContext` Formatting**: Changes to how `codeWithContext` is generated should maintain readability and the intended markers for added/removed lines.
5.  **Edge Cases in Chunking**: Review how the logic handles files with no changes, hunks with only additions or removals, and changes at the very beginning or end of a file. The `Math.max(0, ...)` and `Math.min(changes.length - 1, ...)` are important for handling boundaries.
6.  **Error Handling**: Assess if any new error handling mechanisms are introduced or if existing ones (implicitly through type checks) are sufficient. The current implementation lacks explicit error handling for unexpected `parsed` structures.
7.  **Performance**: For very large diffs, consider the performance implications of the iterative processing and `slice` operations.
