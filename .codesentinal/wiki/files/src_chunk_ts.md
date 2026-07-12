# Source File: src/chunk.ts

## Purpose

This file defines types and functions for processing parsed code review changes into manageable `ReviewChunk` objects. It is designed to group related added and removed lines from code diffs, along with surrounding context, to facilitate analysis and display in a code review interface.

## Exports

- **`ReviewChunk`**: A type representing a distinct section of code changes, including filename, line range, contextual code, lists of added and removed lines, and metadata such as the programming language and hunk header.
- **`chunkingParsed`**: A function that takes parsed diff data and a filename, and returns an array of `ReviewChunk` objects.

## Important Functions

### `chunkingParsed(parsed: any, filename: string): ReviewChunk[]`

This is the primary function for processing diff data. It iterates through the provided `parsed` structure (assumed to contain file and hunk information), identifies groups of consecutive added lines, and then extracts a `ReviewChunk` for each group.

Key behaviors:
- **Contextualization**: It includes `contextSize` lines of context before and after each group of added lines.
- **Line Aggregation**: It collects `addedLines` and `removedLines` within the defined chunk boundaries.
- **Code Formatting**: It generates `codeWithContext` by formatting each line with its line number, a marker for added lines (`+`), and the content.
- **Metadata Extraction**: It derives the `language` from the filename using `getLanguageFromFilename` and constructs a `hunkHeader` string from the hunk's properties.

### `getLanguageFromFilename(filename: string): string`

A utility function that attempts to determine the programming language based on the file extension. It supports a predefined list of common extensions.

## Types

- **`AddedLine`**: Represents a single added line in a diff, containing its new line number (`newLine`) and its `content`.
- **`RemovedLine`**: Represents a single removed line in a diff, containing its old line number (`oldLine`) and its `content`.
- **`ReviewChunk`**: As described in the exports section, this is the core data structure for representing a chunk of reviewed code.

## Risks and Considerations

- **Type Safety (`any`)**: The `chunkingParsed` function heavily uses `any` for the `parsed` input and intermediate `file` and `hunk` objects. This signifies a lack of strong type checking for the input data structure. **Verification**: Ensure the structure of the `parsed` object conforms to expectations to prevent runtime errors. Type definitions for the parsed diff structure would significantly improve robustness.
- **Language Detection**: `getLanguageFromFilename` relies solely on file extensions. This might be insufficient for files with non-standard naming conventions or for languages that don't have common extensions.

## Pull Request Review Guidance

When reviewing changes to this file, consider the following:

- **`chunkingParsed` Logic**:
    - Thoroughly test how `contextSize` affects chunk boundaries and the inclusion of context lines.
    - Verify that `addedLines` and `removedLines` are correctly populated for different diff scenarios (e.g., lines added/removed in isolation, adjacent additions/removals).
    - Inspect the generated `codeWithContext` for accurate formatting and line numbering.
    - Ensure the `startLine` and `endLine` correctly reflect the range of new lines within the chunk.
- **`getLanguageFromFilename`**:
    - Check if new languages need to be supported and if the existing mapping is accurate.
- **Type Safety**:
    - If any `any` types are replaced with more specific types, ensure the type definitions accurately reflect the expected input structure.
- **Performance**:
    - For very large diffs, consider the performance implications of array manipulations (e.g., `filter`, `map`, `slice`).
