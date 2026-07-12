export const CONFIG = {
  llm: {
    reviewModel:
      process.env.CODE_SENTINAL_REVIEW_MODEL ??
      "gemini-3.1-flash-lite",

    wikiModel:
      process.env.CODE_SENTINAL_WIKI_MODEL ??
      "gemini-3.1-flash-lite",

    retryDelayMs: Number(
      process.env.CODE_SENTINAL_LLM_RETRY_DELAY_MS ??
      "5000"
    ),

    maxRetries: Number(
      process.env.CODE_SENTINAL_LLM_MAX_RETRIES ??
      "3"
    ),

    requestTimeoutMs: Number(
        process.env.CODE_SENTINAL_LLM_TIMEOUT_MS ?? "120000"
    ),
  },

  wiki: {
    maxFileUpdatesPerRun: Number(
      process.env.CODE_SENTINAL_MAX_WIKI_FILES ??
      "20"
    ),

    maxFilesPerBatch: Number(
      process.env.CODE_SENTINAL_MAX_WIKI_FILES_PER_BATCH ??
      "20"
    ),

    maxContextDocumentChars: Number(
      process.env.CODE_SENTINAL_MAX_WIKI_CONTEXT_DOC_CHARS ??
      "1200"
    ),

    maxRepositoryMemoryEntries: Number(
      process.env.CODE_SENTINAL_MAX_REPOSITORY_MEMORY_ENTRIES ??
      "10"
    ),

    maxFileContentPreviewChars: Number(
      process.env.CODE_SENTINAL_MAX_FILE_CONTENT_PREVIEW_CHARS ??
      "3000"
    ),

    maxGeneratedMarkdownChars: Number(
      process.env.CODE_SENTINAL_MAX_GENERATED_MARKDOWN_CHARS ??
      "12000"
    ),

    minWikiUpdateChars: Number(
      process.env.CODE_SENTINAL_MIN_WIKI_UPDATE_CHARS ??
      "40"
    ),

    maxWikiDocsForUpdatePlanner: Number(
      process.env.CODE_SENTINAL_MAX_WIKI_DOCS_FOR_UPDATE_PLANNER ?? "5"
    ),

    maxWikiUpdateContextChars: Number(
      process.env.CODE_SENTINAL_MAX_WIKI_UPDATE_CONTEXT_CHARS ?? "12000"
    ),

    minMemoryConfidence: Number(
      process.env.CODE_SENTINAL_MIN_MEMORY_CONFIDENCE ?? "0.75"
    ),
  },

  review: {
    maxContextCharsPerChunk: Number(
      process.env.CODE_SENTINAL_MAX_CONTEXT_CHARS_PER_CHUNK ??
      "12000"
    ),

    maxWikiDocumentChars: Number(
      process.env.CODE_SENTINAL_MAX_DOC_CHARS ??
      "3500"
    ),

    chunkContextLines: Number(
        process.env.CODE_SENTINAL_CHUNK_CONTEXT_LINES ?? "3"
    ),

    maxChunkLines: Number(
        process.env.CODE_SENTINAL_MAX_CHUNK_LINES ?? "80"
    ),
    maxRepositoryMemoriesPerChunk:
  Number(
    process.env
      .CODE_SENTINAL_MAX_REPOSITORY_MEMORIES_PER_CHUNK
      ?? "5"
  ),
  },

  github: {
    maxInlineComments: Number(
      process.env.CODE_SENTINAL_MAX_INLINE_COMMENTS ??
      "50"
    ),
  },
  debug: {
  enabled:
    process.env.CODE_SENTINAL_DEBUG ===
    "true",
},
} as const;