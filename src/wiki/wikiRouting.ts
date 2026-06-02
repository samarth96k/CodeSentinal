import { sourcePathToWikiPath } from "./utils/wikiWriter.js";

import type {
  RepositoryMemorySection,
  WikiMarkdownUpdate,
} from "./wikiReviewTypes.js";

export type RoutedWikiUpdate = {
  wikiFilePath: string;

  memorySection?: RepositoryMemorySection;

  reason: string;

  contentToAppend: string;
};

const CORE_WIKI_ROUTES = {
  architecture:
    ".codesentinal/wiki/architecture.md",

  "database-schema":
    ".codesentinal/wiki/database-schema.md",

  "review-rules":
    ".codesentinal/wiki/review-rules.md",

  "repository-memory":
    ".codesentinal/wiki/repository-memory.md",
} as const;

export function routeWikiUpdate(
  update: WikiMarkdownUpdate
): RoutedWikiUpdate | null {
  switch (update.target) {
    case "architecture":
    case "database-schema":
    case "review-rules":
      return {
        wikiFilePath:
          CORE_WIKI_ROUTES[
            update.target
          ],

        reason: update.reason,

        contentToAppend:
          update.contentToAppend,
      };

    case "repository-memory":
      if (!update.memorySection) {
        console.log(
          "[CodeSentinal Wiki] repository-memory update missing memorySection."
        );

        return null;
      }

      return {
        wikiFilePath:
          CORE_WIKI_ROUTES[
            "repository-memory"
          ],

        memorySection:
          update.memorySection,

        reason: update.reason,

        contentToAppend:
          update.contentToAppend,
      };

    case "file":
      if (!update.sourceFile) {
        console.log(
          "[CodeSentinal Wiki] file target missing sourceFile."
        );

        return null;
      }

      return {
        wikiFilePath:
          sourcePathToWikiPath(
            update.sourceFile
          ),

        reason: update.reason,

        contentToAppend:
          update.contentToAppend,
      };

    default:
      return null;
  }
}