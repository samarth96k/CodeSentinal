// test-sanitize-plan.ts

const sample = {
  classification: {
    category:
      "repository-memory",

    confidence: 0.95,

    reason:
      "Test",
  },

  updatesRequired: true,

  summary:
    "Test",

  updates: [
    {
      target:
        "repository-memory",

      memorySection:
        "Architectural Decisions",

      reason:
        "Retry Architecture",

      contentToAppend:
        "GitHub API operations must use executeGitHubWithRetry.",
    },
  ],
};

console.log(
  JSON.stringify(
    sample,
    null,
    2
  )
);