# LLM Wiki - src/diffParser.ts

This file provides functionality for parsing Git diffs, specifically tailored for handling pull request changes. It leverages the `parse-diff` library and includes custom parsing logic for specific data structures.

## Purpose

The primary purpose of `src/diffParser.ts` is to process and structure information from code diffs, likely for use in an AI context such as code review or change analysis. It defines types for representing parsed diff data and provides functions to convert raw diff information into these structured formats.

## Important Functions

*   **`parseHunkHeader(header: string)`**:
    *   **Description**: Parses a single hunk header line (e.g., `@@ -1,3 +2,4 @@`) into its constituent parts.
    *   **Parameters**:
        *   `header`: A string representing the hunk header.
    *   **Returns**: An object containing `oldStart`, `oldLines`, `newStart`, and `newLines` as numbers.
    *   **Throws**: An `Error` if the header format is invalid.

*   **`parsePatch(file: GitHubPRFile)`**:
    *   **Description**: Parses the `patch` string from a `GitHubPRFile` object into a more structured `ParsedFile` format. This function performs custom parsing of the diff lines within a hunk.
    *   **Parameters**:
        *   `file`: An object conforming to the `GitHubPRFile` type, containing file details and its patch string.
    *   **Returns**: A `ParsedFile` object containing the filename, status, additions, deletions, changes, and an array of `ParsedHunk` objects.

*   **`parsePatchLibrary(diff: any)`**:
    *   **Description**: Utilizes the external `parse-diff` library to process a raw diff string. It then maps the library's output to a custom structure, extracting hunk information and line-by-line changes.
    *   **Parameters**:
        *   `diff`: The raw diff string (expected to be of type `any` by this function's signature).
    *   **Returns**: An array of objects, where each object represents a file with its index, addition/deletion counts, and a list of parsed hunks containing line changes.

## Types

The file defines several internal TypeScript types for representing parsed diff data:

*   **`GitHubPRFile`**: Represents a file object as typically found in a GitHub Pull Request context, including metadata like filename, status, additions, deletions, changes, and the raw `patch` string.
*   **`ParsedLineType`**: An enum-like type for classifying lines within a diff hunk: `"context"`, `"added"`, or `"removed"`.
*   **`ParsedLine`**: Represents a single line within a diff hunk, detailing its type, old/new line numbers, content, and the raw line string.
*   **`ParsedHunk`**: Represents a code "hunk" (a contiguous block of changes) within a diff. It includes hunk header information and an array of `ParsedLine` objects.
*   **`ParsedFile`**: A structured representation of a modified file in a diff, containing file-level metadata and an array of `ParsedHunk` objects.

## Risks

*   **`any` Type Usage**: The `parsePatchLibrary` function accepts `diff` as `any` and the internal mapping also uses `any` for `file` and `chunk` from the `parse-diff` library. This indicates a potential lack of strict type safety. Changes to the output of the `parse-diff` library or internal assumptions could lead to runtime errors. It's crucial to verify that the types used internally align with the expected structure from `parse-diff`.

## Pull Request Review Guidelines

When reviewing changes to this file, consider the following:

1.  **Type Safety**: Pay close attention to any changes that might introduce or alter the use of `any`. Ensure that new variables or function parameters are strictly typed where possible. If `any` is unavoidable, ensure robust validation and clear documentation of assumptions.
2.  **`parseHunkHeader` Logic**: Verify any modifications to the regular expression or the logic for extracting hunk header components. Ensure it correctly handles edge cases and variations in hunk header formats.
3.  **`parsePatch` Logic**: Examine changes to the line-by-line parsing within `parsePatch`. Ensure that the logic for identifying context, added, and removed lines, as well as updating line numbers, remains accurate.
4.  **`parsePatchLibrary` Mapping**: If changes are made to how the output of `parse-diff` is mapped, ensure that the indices and properties being accessed (`chunk.oldStart`, `change.type`, etc.) are correctly referenced and that the mapping accurately reflects the desired `ParsedFile` structure.
5.  **Dependency Updates**: Be cautious when updating the `parse-diff` library. Review its changelog for any breaking changes that might affect how `parsePatchLibrary` consumes its output.
6.  **New Functionality**: If new parsing logic or helper functions are introduced, ensure they are well-tested, clearly documented, and adhere to the existing coding style and type safety principles.
7.  **Removed Comments**: The commented-out section `//***************************************************To BE USED LATER*********************************************************** */` suggests potential future work. Ensure any removals or modifications to these comments are intentional and don't obscure important context about intended usage.
