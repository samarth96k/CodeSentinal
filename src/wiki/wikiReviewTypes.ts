import type { ReviewChunk } from "../chunk.js";

export type WikiContextDocument = {
  wikiFilePath: string;
  reason: string;
  content: string;
};

export type ReviewChunkWithWikiContext = ReviewChunk & {
  wikiContext: string;
  wikiDocuments: WikiContextDocument[];
};

export type WikiMarkdownUpdate = {
  wikiFilePath: string;
  changeType: "append";
  reason: string;
  contentToAppend: string;
};

export type WikiUpdatePlan = {
  updatesRequired: boolean;
  summary: string;
  updates: WikiMarkdownUpdate[];
};

export type WikiMarkdownFileChange = {
  path: string;
  content: string;
};