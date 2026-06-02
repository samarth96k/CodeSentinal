import { z } from "zod";

export const fileWikiDocumentSchema = z.object({
  sourceFilePath: z.string(),

  purpose: z.string(),

  responsibilities: z.array(z.string()),

  criticalReviewContext: z.array(z.string()),

  relatedFiles: z.array(z.string()),

  repositoryMemory: z.array(z.string()),
});

export const batchedFileWikiGenerationSchema = z.object({
  files: z.array(fileWikiDocumentSchema),
});

export const coreWikiGenerationSchema = z.object({
  architecture: z.string(),

  codingRules: z.string(),

  reviewRules: z.string(),

  databaseSchema: z.string(),

  index: z.string(),
});

export type FileWikiDocument =
  z.infer<typeof fileWikiDocumentSchema>;

export type BatchedFileWikiGenerationResponse =
  z.infer<typeof batchedFileWikiGenerationSchema>;

export type CoreWikiGenerationResponse =
  z.infer<typeof coreWikiGenerationSchema>;