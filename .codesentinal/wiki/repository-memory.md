## Integration Knowledge

### Memory ID: TEST001

Created At: 2026-06-03T00:00:00.000Z

**Reason**

GitHub API requests are susceptible to rate limiting.

**Knowledge**

All Octokit API requests should use executeGitHubWithRetry whenever possible.

---

### Memory ID: TEST002

Created At: 2026-06-03T00:00:00.000Z

**Reason**

Gemini requests can fail due to quota limits.

**Knowledge**

All Gemini requests should be wrapped with executeWithRetry and withTimeout.

---

### Memory ID: TEST003

Created At: 2026-06-03T00:00:00.000Z

**Reason**

Repository review relies on wiki context.

**Knowledge**

Review prompts should include architecture, review rules, schema knowledge and retrieved repository memories.
---