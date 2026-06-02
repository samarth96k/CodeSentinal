# Database Schema / Data Contracts

This document outlines the core data structures and interfaces used throughout the repository. These contracts define the shape of pull request data, code chunks, and repository knowledge objects.

## 1. Diff Processing Contracts (`src/chunk.ts`, `src/types/parse-diff.d.ts`)

These structures define the representation of code changes parsed from Git diffs.

### `ParsedChange`
Represents an individual line change within a file.
* `type`: `'add' | 'del' | 'normal'`
* `ln`: Line number (for normal lines)
* `ln1`: Line number in the old file (for deletions)
* `ln2`: Line number in the new file (for additions)
* `content`: The raw text content of the line

### `ParsedFile`
Represents a file affected by a pull request.
* `chunks`: Array of `Chunk` objects (containing groups of changes)
* `deleted`: Boolean flag if file was removed
* `new`: Boolean flag if file is new
* `from`: Path of the source file
* `to`: Path of the destination file

### `AddedLine`
* `line`: The string content of the added line
* `originalLineNumber`: Integer, position in the original file
* `newLineNumber`: Integer, position in the resulting file

## 2. Chunking Structures (`src/chunk.ts`)

### `chunkingParsed`
An interface representing the segmentation of code for LLM consumption.
* `lines`: Array of `AddedLine`
* `originalLineNumber`: Integer
* `fileName`: String
* `fileContent`: String (the context or slice of the file)

## 3. Wiki & Repository Knowledge Contracts (`src/wiki/`)

These contracts manage the persisted knowledge about the repository structure and impact analysis.

### `WikiManifest` (`src/wiki/wikiManifest.ts`)
Defines the structure for tracking knowledge files within the repository.
* `version`: Schema version
* `files`: Mapping of file paths to metadata (e.g., last analyzed, summary, dependencies)

### `WikiImpact` (`src/wiki/wikiImpactAnalyzer.ts`)
Represents the analysis of how changes ripple through the codebase.
* `affectedModules`: Array of strings
* `riskLevel`: `'low' | 'medium' | 'high'`
* `reasoning`: String explanation

### `WikiEntry` (`src/wiki/wikiTypes.ts`)
The standard unit of repository knowledge.
* `id`: Unique identifier
* `content`: Textual summary or documentation
* `lastUpdated`: ISO timestamp
* `relatedFiles`: Array of file paths
* `tags`: Array of strings

## 4. LLM Integration Payloads (`src/llm.ts`)

### `ReviewContext`
Payload constructed to communicate the state of the pull request to the AI.
* `diff`: `ParsedFile[]`
* `chunks`: `Chunk[]`
* `repositoryContext`: `WikiEntry[]` (retrieved from the wiki system)
* `actionInputs`: Configuration mapping for runtime behavior (e.g., `model`, `temperature`, `language`)

## 5. System Configuration (`src/index.ts`)

### `RuntimeConfig`
Configures the execution environment based on action inputs.
* `mode`: `'review' | 'wiki' | 'analysis'`
* `options`: Object containing sensitivity, exclude patterns, and target branch information.

---

## Repository Memory Entry

Memory ID: 2fc75c0168a8

Created At: 2026-06-02T10:22:42.568Z

### Reason

Contract change for review data structures.

### Knowledge

The interface 'ReviewChunkWithWikiContextWIKIUPDATE' is now the primary contract for wiki-update operations. Ensure that any expansion of chunk data in the review pipeline maintains backward compatibility with this type.
